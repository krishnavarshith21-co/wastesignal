import { Router, Request, Response } from 'express';
import { dataStore } from '../data/store';

export const predictionsRouter = Router();

// GET /api/predictions
predictionsRouter.get('/', (_req: Request, res: Response) => {
  const active = dataStore.getActive();
  if (!active) {
    return res.json({ predictions: [], totalCount: 0, datasetId: null });
  }
  return res.json({
    predictions: active.predictions,
    totalCount: active.predictions.length,
    datasetId: active.datasetId,
    isDemo: active.isDemo,
  });
});

// GET /api/predictions/:id
predictionsRouter.get('/:id', (req: Request, res: Response) => {
  const active = dataStore.getActive();
  if (!active) {
    return res.status(404).json({ error: 'No active dataset connected.' });
  }
  const id = req.params.id;
  const prediction = active.predictions.find(p => p.id === id);
  if (!prediction) {
    return res.status(404).json({ error: `Prediction with id ${id} not found.` });
  }
  return res.json({ prediction });
});
