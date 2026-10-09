import type { ComputedHotspotItem } from './hotspotEngine';
import type { ValidatedWasteRecord } from './schemaValidator';

export interface ForwardPredictionItem {
  id: string;
  hotspotId: string;
  zoneId: string;
  locationName: string;
  dayHorizon: number;               // 1..7 days forward
  dayLabel: string;                 // Day +1, Day +2, etc.
  predictedDate: string;
  predictedRisk: number;            // 0..100
  recurrenceLikelihood: 'LOW' | 'MODERATE' | 'HIGH';
  priority: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  priorityLabel: 'LOW PRIORITY' | 'MEDIUM PRIORITY' | 'HIGH PRIORITY' | 'CRITICAL PRIORITY';
  confidenceLevel: 'HIGH CONFIDENCE' | 'MODERATE CONFIDENCE' | 'LOW CONFIDENCE';
  contributingSignals: string[];
  signals: Array<{ label: string; strength: 'LOW' | 'MODERATE' | 'HIGH'; description: string }>;
  recommendedIntervention: string;
  predictionTimestamp: string;
  methodology: string;
}

export interface PredictiveModelInterface {
  generatePredictions(
    hotspots: ComputedHotspotItem[],
    historicalRecords: ValidatedWasteRecord[]
  ): Promise<ForwardPredictionItem[]>;
}

export class StatisticalRecurrencePredictor implements PredictiveModelInterface {
  async generatePredictions(
    hotspots: ComputedHotspotItem[],
    records: ValidatedWasteRecord[]
  ): Promise<ForwardPredictionItem[]> {
    const predictions: ForwardPredictionItem[] = [];
    const predictionTimestamp = new Date().toISOString();

    const topHotspots = hotspots.filter(h => h.riskScore >= 25);

    topHotspots.forEach(hs => {
      const zoneRecords = records.filter(r => r.zone_id === hs.zoneId);
      const incidentRecords = zoneRecords.filter(r => r.incident_type);

      // Historical data density determines confidence
      let confidence: 'HIGH CONFIDENCE' | 'MODERATE CONFIDENCE' | 'LOW CONFIDENCE' = 'LOW CONFIDENCE';
      if (incidentRecords.length >= 4) confidence = 'HIGH CONFIDENCE';
      else if (incidentRecords.length >= 2) confidence = 'MODERATE CONFIDENCE';

      // Estimate mean recurrence interval (in days)
      let meanIntervalDays = 3.5;
      if (incidentRecords.length >= 2) {
        const sorted = [...incidentRecords].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        let totalGapMs = 0;
        for (let i = 1; i < sorted.length; i++) {
          totalGapMs += new Date(sorted[i].timestamp).getTime() - new Date(sorted[i - 1].timestamp).getTime();
        }
        meanIntervalDays = Math.max(1, Math.round((totalGapMs / (sorted.length - 1)) / (86400 * 1000)));
      }

      // Generate 7-day prediction window
      for (let day = 1; day <= 7; day++) {
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + day);

        // Sinusoidal/decay cadence based on recurrence interval
        const recurrencePhase = Math.cos(((day % meanIntervalDays) / meanIntervalDays) * Math.PI * 2);
        const cadenceModifier = (recurrencePhase + 1) * 0.15; // -0.3 to +0.3 relative shift

        let dayRisk = hs.riskScore * (0.85 + cadenceModifier);
        // If high recent incidents and delayed collections, risk rises toward end of cycle
        if (hs.avgDelayMinutes > 40) {
          dayRisk += day * 1.5;
        }

        const normalizedRisk = Math.min(100, Math.max(10, Math.round(dayRisk)));

        let prio: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
        let prioLabel: 'LOW PRIORITY' | 'MEDIUM PRIORITY' | 'HIGH PRIORITY' | 'CRITICAL PRIORITY' = 'LOW PRIORITY';

        if (normalizedRisk >= 75) {
          prio = 'CRITICAL';
          prioLabel = 'CRITICAL PRIORITY';
        } else if (normalizedRisk >= 55) {
          prio = 'HIGH';
          prioLabel = 'HIGH PRIORITY';
        } else if (normalizedRisk >= 35) {
          prio = 'MODERATE';
          prioLabel = 'MEDIUM PRIORITY';
        }

        const likelihood = normalizedRisk >= 70 ? 'HIGH' : normalizedRisk >= 45 ? 'MODERATE' : 'LOW';

        predictions.push({
          id: `PRED-${hs.zoneId}-D${day}`,
          hotspotId: hs.id,
          zoneId: hs.zoneId,
          locationName: hs.locationName,
          dayHorizon: day,
          dayLabel: `Day +${day}`,
          predictedDate: forecastDate.toISOString().split('T')[0],
          predictedRisk: normalizedRisk,
          recurrenceLikelihood: likelihood,
          priority: prio,
          priorityLabel: prioLabel,
          confidenceLevel: confidence,
          contributingSignals: hs.contributingSignals,
          signals: hs.signals.map(s => ({
            label: s.label,
            strength: s.strength,
            description: s.description,
          })),
          recommendedIntervention:
            normalizedRisk >= 65
              ? `Deploy preventive collection crew to ${hs.locationName} by 07:00 on Day +${day}.`
              : `Monitor bin level telemetry and review driver logs for ${hs.locationName}.`,
          predictionTimestamp,
          methodology: 'Historical recurrence interval modeling with day-of-cycle risk modulation (SageMaker-compatible interface).',
        });
      }
    });

    return predictions;
  }
}

export const predictionEngine = new StatisticalRecurrencePredictor();
