import { Router, Request, Response } from 'express';
import { operationsEngine, type InterventionStatus } from '../engine/operationsEngine';
import { dataStore } from '../data/store';

export const operationsRouter = Router();

// GET /api/operations
operationsRouter.get('/', (_req: Request, res: Response) => {
  const active = dataStore.getActive();
  if (!active) {
    return res.json({
      collectionActivity: null,
      incidents: [],
      interventions: [],
    });
  }

  // Derive collection stats from active records
  const records = active.records;
  const scheduled = records.length;
  const completed = records.filter(r => r.collection_status === 'COMPLETED').length;
  const delayed = records.filter(r => r.collection_status === 'DELAYED' || r.collection_delay > 0).length;
  const missed = records.filter(r => r.collection_status === 'MISSED').length;

  const delays = records.filter(r => r.collection_delay > 0);
  const avgDelay = delays.length > 0 ? delays.reduce((s, r) => s + r.collection_delay, 0) / delays.length : 0;
  const completionRate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;

  // Extract incidents
  const incidents = records
    .filter(r => r.incident_type)
    .map(r => ({
      id: `INC-${r.record_id}`,
      type: r.incident_type,
      zone: r.zone_id,
      locationName: r.location_name,
      timestamp: r.timestamp,
      severity: r.reported_volume > 350 ? 'CRITICAL' : r.reported_volume > 250 ? 'HIGH' : 'MODERATE',
      status: r.incident_status || 'OPEN',
      collectionDelay: r.collection_delay,
      volume: r.reported_volume,
      wasteType: r.waste_type,
    }));

  const interventions = operationsEngine.getAll();

  return res.json({
    collectionActivity: {
      scheduled,
      completed,
      delayed,
      missed,
      completionRate,
      avgDelayMinutes: Math.round(avgDelay),
    },
    incidents,
    interventions,
  });
});

// PATCH /api/operations/interventions/:id
operationsRouter.patch('/interventions/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { status, assignedTo, notes } = req.body;

    const validStatuses: InterventionStatus[] = ['PENDING', 'REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updated = operationsEngine.updateStatus(id, status, assignedTo, notes);
    const active = dataStore.getActive();
    if (active) {
      active.interventions = operationsEngine.getAll();
    }
    return res.json({ success: true, intervention: updated });
  } catch (err: any) {
    const statusCode = err.message?.includes('Invalid state transition') ? 400 : 404;
    return res.status(statusCode).json({ error: err.message });
  }
});
