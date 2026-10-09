import { Router, Request, Response } from 'express';
import { dataStore } from '../data/store';

export const hotspotsRouter = Router();

// GET /api/hotspots
hotspotsRouter.get('/', (_req: Request, res: Response) => {
  const active = dataStore.getActive();
  if (!active) {
    return res.json({ hotspots: [], totalCount: 0, datasetId: null });
  }
  return res.json({
    hotspots: active.hotspots,
    totalCount: active.hotspots.length,
    datasetId: active.datasetId,
    isDemo: active.isDemo,
  });
});

// GET /api/hotspots/:id
hotspotsRouter.get('/:id', (req: Request, res: Response) => {
  const active = dataStore.getActive();
  if (!active) {
    return res.status(404).json({ error: 'No active dataset connected.' });
  }
  const id = req.params.id;
  const hotspot = active.hotspots.find(h => h.id === id || h.zoneId === id);
  if (!hotspot) {
    return res.status(404).json({ error: `Hotspot with id ${id} not found.` });
  }
  return res.json({ hotspot });
});
