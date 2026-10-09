import type { ComputedHotspotItem } from './hotspotEngine';

export type InterventionStatus = 'PENDING' | 'REVIEW' | 'ASSIGNED' | 'IN PROGRESS' | 'RESOLVED';

export interface OperationalIntervention {
  id: string;
  hotspotId: string;
  zoneId: string;
  locationName: string;
  priority: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  reason: string;
  suggestedIntervention: string;
  status: InterventionStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  notes?: string;
}

const VALID_TRANSITIONS: Record<InterventionStatus, InterventionStatus[]> = {
  REVIEW: ['PENDING', 'ASSIGNED'],
  PENDING: ['ASSIGNED', 'IN PROGRESS'],
  ASSIGNED: ['IN PROGRESS', 'PENDING'],
  'IN PROGRESS': ['RESOLVED', 'ASSIGNED'],
  RESOLVED: ['IN PROGRESS'],
};

export class OperationsEngine {
  private interventions: Map<string, OperationalIntervention> = new Map();

  generateFromHotspots(hotspots: ComputedHotspotItem[]): OperationalIntervention[] {
    const list: OperationalIntervention[] = [];
    const now = new Date().toISOString();

    hotspots.forEach(hs => {
      const existingId = `INT-${hs.zoneId.replace(/[^a-zA-Z0-9]/g, '')}`;
      const existing = this.interventions.get(existingId);

      if (existing) {
        list.push(existing);
        return;
      }

      let reason = `Risk score reached ${hs.riskScore}/100 with ${hs.incidentCount} recorded incident(s).`;
      if (hs.avgDelayMinutes > 30) {
        reason += ` Recurring collection delay of ${hs.avgDelayMinutes} min contributing to overflow hazard.`;
      }

      const item: OperationalIntervention = {
        id: existingId,
        hotspotId: hs.id,
        zoneId: hs.zoneId,
        locationName: hs.locationName,
        priority: hs.priority,
        reason,
        suggestedIntervention: hs.recommendedAction,
        status: hs.priority === 'CRITICAL' || hs.priority === 'HIGH' ? 'PENDING' : 'REVIEW',
        createdAt: now,
        updatedAt: now,
      };

      this.interventions.set(item.id, item);
      list.push(item);
    });

    return list;
  }

  getAll(): OperationalIntervention[] {
    return Array.from(this.interventions.values());
  }

  getById(id: string): OperationalIntervention | undefined {
    return this.interventions.get(id);
  }

  updateStatus(
    id: string,
    status: InterventionStatus,
    assignedTo?: string,
    notes?: string
  ): OperationalIntervention {
    const item = this.interventions.get(id);
    if (!item) {
      throw new Error(`Intervention ${id} not found.`);
    }

    // Validate state machine transition if status is being changed
    if (status && status !== item.status) {
      const allowed = VALID_TRANSITIONS[item.status] || [];
      if (!allowed.includes(status)) {
        throw new Error(
          `Invalid state transition: Cannot change intervention from '${item.status}' to '${status}'. Permitted transitions are: ${allowed.join(', ') || 'None'}`
        );
      }
    }

    const now = new Date().toISOString();
    if (status) item.status = status;
    item.updatedAt = now;
    if (assignedTo !== undefined) item.assignedTo = assignedTo;
    if (notes !== undefined) item.notes = notes;
    if (status === 'RESOLVED') item.resolvedAt = now;

    this.interventions.set(id, item);
    return item;
  }

  clear() {
    this.interventions.clear();
  }
}

export const operationsEngine = new OperationsEngine();
