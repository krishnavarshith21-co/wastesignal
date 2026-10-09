import { Router, Request, Response } from 'express';
import { bedrockService, type StructuredExplanationInput } from '../aws/bedrockService';
import { dataStore } from '../data/store';

export const intelligenceRouter = Router();

// GET /api/intelligence
intelligenceRouter.get('/', (_req: Request, res: Response) => {
  const active = dataStore.getActive();
  if (!active || active.hotspots.length === 0) {
    return res.json({ insights: [] });
  }

  // Derive intelligence signals strictly from dataset
  const insights = active.hotspots.map((hs, idx) => ({
    id: `INTEL-${idx + 1}`,
    title: `${hs.priority} recurrence alert: ${hs.locationName}`,
    description: `Zone ${hs.zoneId} risk evaluated at ${hs.riskScore}/100. ${hs.recurrence} pattern with ${hs.incidentCount} incidents. ${hs.recommendedAction}`,
    type: hs.priority === 'CRITICAL' || hs.priority === 'HIGH' ? 'HOTSPOT' : 'TREND',
    severity: hs.priority,
    zone: hs.zoneId,
    locationName: hs.locationName,
    timestamp: hs.lastIncidentDate,
    signalsUsed: hs.contributingSignals,
    dataSource: active.isDemo ? 'SYNTHETIC DEMONSTRATION DATASET' : 'UPLOADED DATASET',
    timeRange: 'Monitored period',
  }));

  return res.json({ insights });
});

// POST /api/intelligence/explain
intelligenceRouter.post('/explain', async (req: Request, res: Response) => {
  try {
    const { hotspotId, zoneId } = req.body;
    const active = dataStore.getActive();

    let targetHotspot = active?.hotspots.find(h => h.id === hotspotId || h.zoneId === zoneId);

    // If not found in active dataStore, check if full structured payload was provided in request
    if (!targetHotspot && req.body.location && req.body.riskScore !== undefined) {
      targetHotspot = {
        id: hotspotId || 'HS-MANUAL',
        zoneId: zoneId || 'Z-01',
        locationName: req.body.location,
        riskScore: Number(req.body.riskScore),
        priority: req.body.priority || 'HIGH',
        recurrence: req.body.recurrence || 'RECURRING',
        trend: 'STABLE',
        status: 'OPEN',
        lastIncidentDate: new Date().toISOString(),
        latitude: req.body.latitude || 0,
        longitude: req.body.longitude || 0,
        incidentCount: req.body.incidentCount || 3,
        openIncidentCount: 1,
        avgDelayMinutes: req.body.avgDelayMinutes || 45,
        avgVolume: req.body.avgVolume || 300,
        totalComplaints: req.body.totalComplaints || 4,
        signals: req.body.signals || [],
        contributingSignals: req.body.contributingSignals || ['Recurrence', 'Collection Delay'],
        recommendedAction: req.body.recommendedAction || 'Inspect before recurrence window.',
        methodologyNote: 'Supplied directly in request',
        incidentHistory: [],
      };
    }

    if (!targetHotspot) {
      return res.status(404).json({
        error: 'Target hotspot could not be found to generate explanation.',
      });
    }

    const payload: StructuredExplanationInput = {
      location: targetHotspot.locationName,
      zoneId: targetHotspot.zoneId,
      riskScore: targetHotspot.riskScore,
      priority: targetHotspot.priority,
      signals: targetHotspot.signals.map(s => ({
        label: s.label,
        strength: s.strength,
        description: s.description,
      })),
      incidentCount: targetHotspot.incidentCount,
      avgDelayMinutes: targetHotspot.avgDelayMinutes,
      lastIncidentDate: targetHotspot.lastIncidentDate,
      recurrencePattern: targetHotspot.recurrence,
    };

    const explanation = await bedrockService.generateExplanation(payload);

    return res.json({
      success: true,
      hotspotId: targetHotspot.id,
      zoneId: targetHotspot.zoneId,
      locationName: targetHotspot.locationName,
      riskScore: targetHotspot.riskScore,
      priority: targetHotspot.priority,
      explanation,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to generate explanation',
      details: err.message,
    });
  }
});
