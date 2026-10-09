import type { ValidatedWasteRecord } from './schemaValidator';

export interface ScoringWeights {
  recurrence: number;            // default 0.25
  recentActivity: number;        // default 0.20
  incidentFrequency: number;     // default 0.20
  collectionIrregularity: number;// default 0.15
  responseDelay: number;         // default 0.10
  contextual: number;            // default 0.10
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  recurrence: 0.25,
  recentActivity: 0.20,
  incidentFrequency: 0.20,
  collectionIrregularity: 0.15,
  responseDelay: 0.10,
  contextual: 0.10,
};

export interface HotspotSignalItem {
  type: 'RECURRENCE' | 'RECENT_ACTIVITY' | 'INCIDENT_FREQUENCY' | 'COLLECTION' | 'RESPONSE_DELAY' | 'CONTEXT';
  label: string;
  description: string;
  strength: 'LOW' | 'MODERATE' | 'HIGH';
  available: boolean;
  rawMetricValue: number;
}

export interface ComputedHotspotItem {
  id: string;
  zoneId: string;
  locationName: string;
  riskScore: number;                 // 0..100
  priority: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  recurrence: 'RECURRING' | 'INTERMITTENT' | 'NEW';
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: 'OPEN' | 'MONITORING' | 'RESOLVED' | 'PENDING';
  lastIncidentDate: string;
  latitude: number;
  longitude: number;
  incidentCount: number;
  openIncidentCount: number;
  avgDelayMinutes: number;
  avgVolume: number;
  totalComplaints: number;
  signals: HotspotSignalItem[];
  contributingSignals: string[];
  recommendedAction: string;
  methodologyNote: string;
  incidentHistory: Array<{
    date: string;
    type: string;
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    resolved: boolean;
  }>;
}

export function computeHotspots(
  records: ValidatedWasteRecord[],
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
  baseTime?: Date
): ComputedHotspotItem[] {
  if (records.length === 0) return [];

  // Anchor time for recency calculations
  const now = baseTime || (records.length > 0 ? new Date(Math.max(...records.map(r => new Date(r.timestamp).getTime()))) : new Date());

  // Group by zone_id
  const zoneMap = new Map<string, ValidatedWasteRecord[]>();
  for (const r of records) {
    const arr = zoneMap.get(r.zone_id) || [];
    arr.push(r);
    zoneMap.set(r.zone_id, arr);
  }

  const results: ComputedHotspotItem[] = [];

  for (const [zoneId, zoneRecords] of zoneMap.entries()) {
    const locName = zoneRecords[0].location_name || zoneId;
    const incidents = zoneRecords.filter(r => r.incident_type);
    const delayed = zoneRecords.filter(r => r.collection_status === 'DELAYED' || r.collection_delay > 0);
    const missed = zoneRecords.filter(r => r.collection_status === 'MISSED');

    // 1. Incident Frequency Signal (0..100)
    const incidentCount = incidents.length;
    const freqScore = Math.min(100, incidentCount * 22);

    // 2. Recurrence Signal (0..100)
    // Measures repeated occurrences spaced out across the observation window
    let recurrenceScore = 0;
    if (incidentCount >= 3) recurrenceScore = 90;
    else if (incidentCount === 2) recurrenceScore = 60;
    else if (incidentCount === 1) recurrenceScore = 25;

    // 3. Recent Activity Signal (0..100)
    // Incidents within 72 hours of observation cutoff receive highest weight
    const cutoff72h = 72 * 3600 * 1000;
    const recentIncidents = incidents.filter(r => {
      const diff = now.getTime() - new Date(r.timestamp).getTime();
      return diff >= 0 && diff <= cutoff72h;
    });
    const recentScore = Math.min(100, recentIncidents.length * 40);

    // 4. Collection Irregularity Signal (0..100)
    const totalDelays = delayed.reduce((sum, r) => sum + r.collection_delay, 0);
    const avgDelay = delayed.length > 0 ? totalDelays / delayed.length : 0;
    const irregularityScore = Math.min(100, (missed.length * 45) + (avgDelay * 0.8));

    // 5. Response Delay Signal (0..100)
    const avgResponseTime = zoneRecords.reduce((sum, r) => sum + r.response_time, 0) / (zoneRecords.length || 1);
    const responseScore = Math.min(100, avgResponseTime * 1.2);

    // 6. Contextual Signal (0..100)
    const totalComplaints = zoneRecords.reduce((sum, r) => sum + r.complaint_count, 0);
    const avgVol = zoneRecords.reduce((sum, r) => sum + r.reported_volume, 0) / (zoneRecords.length || 1);
    const contextScore = Math.min(100, (totalComplaints * 12) + (avgVol > 300 ? (avgVol - 300) * 0.15 : 0));

    // Composite Deterministic Score
    const rawScore =
      (recurrenceScore * weights.recurrence) +
      (recentScore * weights.recentActivity) +
      (freqScore * weights.incidentFrequency) +
      (irregularityScore * weights.collectionIrregularity) +
      (responseScore * weights.responseDelay) +
      (contextScore * weights.contextual);

    const riskScore = Math.min(100, Math.max(5, Math.round(rawScore)));

    // Priority mapping
    let priority: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScore >= 75) priority = 'CRITICAL';
    else if (riskScore >= 55) priority = 'HIGH';
    else if (riskScore >= 35) priority = 'MODERATE';

    // Recurrence pattern classification
    let recurrenceType: 'RECURRING' | 'INTERMITTENT' | 'NEW' = 'NEW';
    if (incidentCount >= 3) recurrenceType = 'RECURRING';
    else if (incidentCount === 2) recurrenceType = 'INTERMITTENT';

    // Trend calculation
    let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
    if (recentIncidents.length >= 2) trend = 'UP';
    else if (incidentCount > 0 && recentIncidents.length === 0) trend = 'DOWN';

    // Signals compilation
    const signals: HotspotSignalItem[] = [
      {
        type: 'RECURRENCE',
        label: 'Recurrence Pattern',
        description: `${incidentCount} total incident(s) logged in zone. ${recurrenceType === 'RECURRING' ? 'High historical recurrence detected.' : 'Single or intermittent incident history.'}`,
        strength: recurrenceScore >= 70 ? 'HIGH' : recurrenceScore >= 40 ? 'MODERATE' : 'LOW',
        available: true,
        rawMetricValue: recurrenceScore,
      },
      {
        type: 'RECENT_ACTIVITY',
        label: 'Recent Activity (72h)',
        description: `${recentIncidents.length} event(s) recorded in the primary 72-hour observation window.`,
        strength: recentScore >= 70 ? 'HIGH' : recentScore >= 35 ? 'MODERATE' : 'LOW',
        available: true,
        rawMetricValue: recentIncidents.length,
      },
      {
        type: 'COLLECTION',
        label: 'Collection Regularity',
        description: `${delayed.length} delayed and ${missed.length} missed collection(s). Average delay: ${Math.round(avgDelay)} min.`,
        strength: irregularityScore >= 60 ? 'HIGH' : irregularityScore >= 30 ? 'MODERATE' : 'LOW',
        available: true,
        rawMetricValue: Math.round(avgDelay),
      },
      {
        type: 'RESPONSE_DELAY',
        label: 'Response Latency',
        description: avgResponseTime > 0 ? `Mean field intervention latency: ${Math.round(avgResponseTime)} minutes.` : 'Field response latency within normal operational baseline.',
        strength: responseScore >= 60 ? 'HIGH' : responseScore >= 30 ? 'MODERATE' : 'LOW',
        available: avgResponseTime > 0,
        rawMetricValue: Math.round(avgResponseTime),
      },
      {
        type: 'CONTEXT',
        label: 'Volume & Complaints',
        description: `${totalComplaints} citizen complaints recorded. Average volume: ${Math.round(avgVol)} kg/units.`,
        strength: contextScore >= 60 ? 'HIGH' : contextScore >= 30 ? 'MODERATE' : 'LOW',
        available: true,
        rawMetricValue: totalComplaints,
      },
    ];

    const contributingSignals = signals
      .filter(s => s.strength === 'HIGH' || s.strength === 'MODERATE')
      .map(s => s.label);

    // Recommended action
    let recommendedAction = 'Maintain baseline scheduled collection and monitor via routine telemetry.';
    if (priority === 'CRITICAL') {
      recommendedAction = 'Dispatch preventive inspection prior to next collection cycle; escalate compaction frequency and clear bin spillover.';
    } else if (priority === 'HIGH') {
      recommendedAction = 'Advance route schedule by 45 minutes; verify vehicle access corridor and containment integrity.';
    } else if (priority === 'MODERATE') {
      recommendedAction = 'Review driver logs for route delays; inspect collection container for contamination.';
    }

    // Incident history
    const sortedIncidents = [...incidents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const latestIncident = sortedIncidents[0];
    const openIncidents = incidents.filter(r => r.incident_status === 'OPEN').length;

    results.push({
      id: `HS-${zoneId.replace(/[^a-zA-Z0-9]/g, '')}`,
      zoneId,
      locationName: locName,
      riskScore,
      priority,
      recurrence: recurrenceType,
      trend,
      status: openIncidents > 0 ? 'OPEN' : 'MONITORING',
      lastIncidentDate: latestIncident ? latestIncident.timestamp : zoneRecords[zoneRecords.length - 1].timestamp,
      latitude: zoneRecords[0].latitude,
      longitude: zoneRecords[0].longitude,
      incidentCount,
      openIncidentCount: openIncidents,
      avgDelayMinutes: Math.round(avgDelay),
      avgVolume: Math.round(avgVol),
      totalComplaints,
      signals,
      contributingSignals,
      recommendedAction,
      methodologyNote: 'Calculated using WasteSignal deterministic multi-signal scoring model (prototype methodology).',
      incidentHistory: sortedIncidents.slice(0, 5).map(inc => ({
        date: inc.timestamp,
        type: inc.incident_type || 'INCIDENT',
        severity: inc.reported_volume > 350 ? 'CRITICAL' : inc.reported_volume > 250 ? 'HIGH' : 'MODERATE',
        resolved: inc.incident_status === 'RESOLVED',
      })),
    });
  }

  // Sort by riskScore descending
  return results.sort((a, b) => b.riskScore - a.riskScore);
}
