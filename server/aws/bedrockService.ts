import {
  ListFoundationModelsCommand,
} from '@aws-sdk/client-bedrock';
import {
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient, bedrockRuntimeClient } from './clients';
import { config } from '../config';

export interface StructuredExplanationInput {
  location: string;
  zoneId: string;
  riskScore: number;
  priority: string;
  signals: Array<{ label: string; strength: string; description: string }>;
  incidentCount: number;
  avgDelayMinutes?: number;
  lastIncidentDate?: string;
  recurrencePattern?: string;
}

export interface ExplanationResult {
  whyPrioritized: string;
  contributingSignalsSummary: string[];
  recommendedAction: string;
  preventiveChecklist: string[];
  uncertaintyOrMissingInfo?: string;
  aiProvider: 'BEDROCK' | 'RULE_BASED_FALLBACK';
  modelId?: string;
  fallbackReason?: string;
}

export class BedrockService {
  private modelId: string;

  constructor() {
    this.modelId = config.aws.bedrockModelId;
  }

  private healthCache: { result: { status: 'CONNECTED' | 'UNAVAILABLE' | 'NOT CONFIGURED'; modelId: string; error?: string }; expiresAt: number } | null = null;

  async checkHealth(): Promise<{ status: 'CONNECTED' | 'UNAVAILABLE' | 'NOT CONFIGURED'; modelId: string; error?: string }> {
    if (!this.modelId) {
      return { status: 'NOT CONFIGURED', modelId: '' };
    }

    const now = Date.now();
    if (this.healthCache && this.healthCache.expiresAt > now) {
      return this.healthCache.result;
    }

    try {
      // 1. Verify model is listed in region
      const res = await bedrockClient.send(new ListFoundationModelsCommand({}));
      const models = res.modelSummaries || [];
      const hasModel = models.some(m => m.modelId === this.modelId);
      if (!hasModel) {
        const result = {
          status: 'UNAVAILABLE' as const,
          modelId: this.modelId,
          error: `Model ${this.modelId} not listed in region ${config.aws.region}`,
        };
        this.healthCache = { result, expiresAt: now + 300_000 };
        return result;
      }

      // 2. Perform a lightweight 1-token invocation probe to verify genuine model access
      let probeBody: any;
      if (this.modelId.startsWith('amazon.nova')) {
        probeBody = {
          messages: [{ role: 'user', content: [{ text: 'ping' }] }],
          inferenceConfig: { max_new_tokens: 1 },
        };
      } else if (this.modelId.startsWith('anthropic.claude')) {
        probeBody = {
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        };
      } else {
        probeBody = { prompt: 'ping', maxTokens: 1 };
      }

      await bedrockRuntimeClient.send(new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(probeBody),
      }));

      const result = {
        status: 'CONNECTED' as const,
        modelId: this.modelId,
      };
      this.healthCache = { result, expiresAt: now + 300_000 };
      return result;
    } catch (err: any) {
      const isInvocationAccessError =
        err.name === 'ValidationException' ||
        err.name === 'AccessDeniedException' ||
        err.message?.includes('Operation not allowed') ||
        err.message?.includes('access');

      const result = {
        status: 'UNAVAILABLE' as const,
        modelId: this.modelId,
        error: isInvocationAccessError
          ? `Model access pending AWS Console activation (${err.name || 'InvokeError'}: ${err.message}). Transparent rule-based fallback active.`
          : (err.message || err.name || 'Bedrock access failed'),
      };
      this.healthCache = { result, expiresAt: now + 300_000 };
      return result;
    }
  }

  async generateExplanation(input: StructuredExplanationInput): Promise<ExplanationResult> {
    const prompt = `You are the WasteSignal Operational Intelligence engine.
Only use the supplied structured signals. Do not invent statistics, locations, events, customers, measurements, or operational facts.

LOCATION CONTEXT:
Location: ${input.location} (Zone ${input.zoneId})
Risk score: ${input.riskScore}/100
Priority: ${input.priority}
Recurrence: ${input.recurrencePattern || 'RECURRING'}
Incident Count: ${input.incidentCount}
Average Collection Delay: ${input.avgDelayMinutes ?? 0} minutes
Last Incident: ${input.lastIncidentDate || 'Recent'}

CONTRIBUTING SIGNALS:
${input.signals.map(s => `- ${s.label} (${s.strength}): ${s.description}`).join('\n')}

Format your output as strict valid JSON ONLY with these keys:
{
  "whyPrioritized": "concise explanation grounded strictly in the provided signals",
  "contributingSignalsSummary": ["bullet 1", "bullet 2", "bullet 3"],
  "recommendedAction": "clear operational recommendation for field dispatch",
  "preventiveChecklist": ["action step 1", "action step 2"],
  "uncertaintyOrMissingInfo": "any unobserved telemetry fields, missing sensors, or interval variance"
}`;

    try {
      // Build body based on model type
      let requestBody: any;
      if (this.modelId.startsWith('amazon.nova')) {
        requestBody = {
          messages: [
            {
              role: 'user',
              content: [{ text: prompt }],
            },
          ],
          inferenceConfig: {
            temperature: 0.1,
            max_new_tokens: 450,
          },
        };
      } else if (this.modelId.startsWith('anthropic.claude')) {
        requestBody = {
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 450,
          temperature: 0.1,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        };
      } else {
        requestBody = {
          prompt,
          maxTokens: 450,
          temperature: 0.1,
        };
      }

      const response = await bedrockRuntimeClient.send(new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody),
      }));

      const raw = new TextDecoder().decode(response.body);
      const parsedRes = JSON.parse(raw);

      let textOutput = '';
      if (parsedRes.output?.message?.content?.[0]?.text) {
        textOutput = parsedRes.output.message.content[0].text;
      } else if (parsedRes.content?.[0]?.text) {
        textOutput = parsedRes.content[0].text;
      } else if (parsedRes.generation) {
        textOutput = parsedRes.generation;
      } else {
        textOutput = raw;
      }

      // Extract JSON block if surrounded by markdown fences
      const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          whyPrioritized: parsed.whyPrioritized,
          contributingSignalsSummary: Array.isArray(parsed.contributingSignalsSummary) ? parsed.contributingSignalsSummary : [],
          recommendedAction: parsed.recommendedAction,
          preventiveChecklist: Array.isArray(parsed.preventiveChecklist) ? parsed.preventiveChecklist : [],
          uncertaintyOrMissingInfo: parsed.uncertaintyOrMissingInfo || 'All primary operational telemetry signals observed.',
          aiProvider: 'BEDROCK',
          modelId: this.modelId,
        };
      }

      throw new Error('Could not parse JSON output from Bedrock response');
    } catch (err: any) {
      // Fallback transparently per Section 11:
      // "If Bedrock is unavailable or model access is not configured: return a transparent fallback message such as:
      // 'AI explanation unavailable. Showing rule-based explanation.' Do NOT fake an AI response."
      const fallbackReason = `AI explanation unavailable (AWS Bedrock: ${err.message || err.name || 'access error'}). Showing rule-based explanation.`;
      const ruleBased = this.generateRuleBasedFallback(input);
      return {
        ...ruleBased,
        aiProvider: 'RULE_BASED_FALLBACK',
        fallbackReason,
      };
    }
  }

  private generateRuleBasedFallback(input: StructuredExplanationInput): Omit<ExplanationResult, 'aiProvider'> {
    const highSignals = input.signals.filter(s => s.strength === 'HIGH');
    const signalBullets = input.signals.map(s => `${s.label}: ${s.description}`);

    const whyPrioritized = `${input.location} is prioritized with a risk score of ${input.riskScore}/100 (${input.priority}) driven by ${input.incidentCount} recorded incident(s)${input.avgDelayMinutes && input.avgDelayMinutes > 0 ? ` and an average collection delay of ${Math.round(input.avgDelayMinutes)} minutes` : ''}.${highSignals.length > 0 ? ` Dominant operational factors include ${highSignals.map(s => s.label.toLowerCase()).join(' and ')}.` : ''}`;

    let action = 'Schedule preventive route verification before next anticipated collection window.';
    if (input.riskScore >= 75) {
      action = 'Dispatch rapid sanitation inspector, reallocate backup compaction capacity, and inspect containment infrastructure.';
    } else if (input.riskScore >= 50) {
      action = 'Advance route schedule by 45 minutes and verify bin capacity before expected peak hours.';
    }

    const checklist = [
      `Audit current bin fill-level and containment structural integrity at ${input.location}`,
      input.avgDelayMinutes && input.avgDelayMinutes > 30
        ? `Investigate vehicle dispatch delay on assigned route (historical avg delay: ${Math.round(input.avgDelayMinutes)}m)`
        : 'Inspect collection access lanes for transit obstruction',
      'Log resolution outcome in WasteSignal Operations module to update predictive model feedback loop',
    ];

    const missingCaveats: string[] = [];
    if (!input.avgDelayMinutes || input.avgDelayMinutes === 0) {
      missingCaveats.push('Vehicle transit delay not recorded; baseline schedule assumed.');
    }
    if (input.incidentCount < 4) {
      missingCaveats.push('Sparse incident history (< 4 events); recurrence variance requires in-field verification.');
    }
    const uncertaintyOrMissingInfo = missingCaveats.length > 0
      ? missingCaveats.join(' ')
      : 'All primary operational telemetry signals observed within verified variance bounds.';

    return {
      whyPrioritized,
      contributingSignalsSummary: signalBullets,
      recommendedAction: action,
      preventiveChecklist: checklist,
      uncertaintyOrMissingInfo,
    };
  }
}

export const bedrockService = new BedrockService();
