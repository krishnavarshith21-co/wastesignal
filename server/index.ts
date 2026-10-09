import express from 'express';
import cors from 'cors';
import { config } from './config';
import { datasetsRouter } from './routes/datasets';
import { hotspotsRouter } from './routes/hotspots';
import { predictionsRouter } from './routes/predictions';
import { operationsRouter } from './routes/operations';
import { intelligenceRouter } from './routes/intelligence';
import { awsRouter } from './routes/aws';

const app = express();

const allowedOrigins = [
  'https://wastesignal.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production' || process.env.CORS_ALLOW_ALL === 'true') {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (without secrets)
app.use((req, _res, next) => {
  const start = Date.now();
  _res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} -> ${_res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount API routes
app.use('/api/datasets', datasetsRouter);
app.use('/api/hotspots', hotspotsRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/operations', operationsRouter);
app.use('/api/intelligence', intelligenceRouter);
app.use('/api/aws', awsRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'wastesignal-backend',
    region: config.aws.region,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

// Centralized error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API ERROR]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server if executed directly in standalone mode (not in Lambda or test)
if (process.env.NODE_ENV !== 'test' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[WasteSignal Server] Listening on http://0.0.0.0:${config.port}`);
    console.log(`[WasteSignal AWS Region] ${config.aws.region}`);
    console.log(`[WasteSignal S3 Bucket] ${config.aws.s3Bucket}`);
  });
}

export default app;
