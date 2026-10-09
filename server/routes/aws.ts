import { Router, Request, Response } from 'express';
import { getLiveAwsStatus } from '../aws/statusService';
import { athenaService } from '../aws/athenaService';

export const awsRouter = Router();

// GET /api/aws/status
awsRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await getLiveAwsStatus();
    return res.json(status);
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to probe AWS infrastructure status',
      details: err.message,
    });
  }
});

// POST /api/athena/query
awsRouter.post('/query', async (req: Request, res: Response) => {
  try {
    const { queryType, customSql } = req.body;

    if (customSql) {
      const result = await athenaService.runQuery(customSql);
      return res.json({ success: true, ...result });
    }

    if (queryType === 'hotspot-frequency') {
      const result = await athenaService.getHotspotFrequency();
      return res.json({ success: true, ...result });
    }

    if (queryType === 'collection-performance') {
      const result = await athenaService.getCollectionPerformance();
      return res.json({ success: true, ...result });
    }

    if (queryType === 'day-of-week') {
      const result = await athenaService.getDayOfWeekPatterns();
      return res.json({ success: true, ...result });
    }

    return res.status(400).json({
      error: 'Invalid queryType. Supported types: hotspot-frequency, collection-performance, day-of-week or customSql.',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Analytics query failed',
      details: err.message,
    });
  }
});
