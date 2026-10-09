import { Router, Request, Response } from 'express';
import multer from 'multer';
import { s3Service } from '../aws/s3Service';
import { glueService } from '../aws/glueService';
import { validateAndNormalizeDataset, type RawWasteInputRecord } from '../engine/schemaValidator';
import { computeHotspots } from '../engine/hotspotEngine';
import { predictionEngine } from '../engine/predictionEngine';
import { operationsEngine } from '../engine/operationsEngine';
import { dataStore } from '../data/store';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
import { parseCsvToObjects, generateSyntheticDemoCsv } from '../data/demoSeed';

export const datasetsRouter = Router();

// POST /api/datasets/demo
datasetsRouter.post('/demo', async (req: Request, res: Response) => {
  try {
    const csvContent = generateSyntheticDemoCsv();
    const parsedRows = parseCsvToObjects(csvContent);
    const validation = validateAndNormalizeDataset(parsedRows);

    if (!validation.valid && validation.records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dataset validation failed for demo data',
        details: validation.errors,
      });
    }

    const datasetId = `demo-${Date.now()}`;
    const rawKey = `wastesignal/demo/demo_waste_telemetry_${datasetId}.csv`;
    const primaryRawKey = `wastesignal/raw/demo_waste_telemetry.csv`;
    const processedKey = `wastesignal/processed/demo_waste_telemetry_${datasetId}.json`;

    // 1. Upload to S3
    let s3Uploaded = false;
    let s3Error: string | undefined;
    try {
      await s3Service.uploadFile(rawKey, csvContent, 'text/csv');
      await s3Service.uploadFile(primaryRawKey, csvContent, 'text/csv');
      s3Uploaded = true;
    } catch (err: any) {
      s3Error = err.message;
    }

    // 2. Register Glue table catalog
    let glueCataloged = false;
    try {
      await glueService.ensureCatalogTable();
      glueCataloged = true;
    } catch (err: any) {
      console.warn('Glue catalog registration notice:', err.message);
    }

    // 3. Compute Hotspots & Predictions & Operations
    const hotspots = computeHotspots(validation.records);
    const predictions = await predictionEngine.generatePredictions(hotspots, validation.records);
    const interventions = operationsEngine.generateFromHotspots(hotspots);

    // 4. Upload processed data to S3
    if (s3Uploaded) {
      try {
        await s3Service.uploadFile(
          processedKey,
          JSON.stringify({ datasetId, hotspots, predictions, recordCount: validation.records.length }),
          'application/json'
        );
      } catch (err: any) {
        console.warn('S3 processed upload notice:', err.message);
      }
    }

    // 5. Cache in active dataStore
    dataStore.setActive({
      datasetId,
      name: 'WasteSignal Synthetic Demo Dataset',
      fileName: 'demo_waste_telemetry.csv',
      isDemo: true,
      uploadedAt: new Date().toISOString(),
      s3RawKey: s3Uploaded ? rawKey : undefined,
      s3ProcessedKey: s3Uploaded ? processedKey : undefined,
      records: validation.records,
      validation,
      hotspots,
      predictions,
      interventions,
    });

    return res.json({
      success: true,
      message: 'SYNTHETIC DEMONSTRATION DATA loaded and analyzed successfully.',
      dataset: {
        id: datasetId,
        name: 'WasteSignal Synthetic Demo Dataset',
        fileName: 'demo_waste_telemetry.csv',
        isDemo: true,
        recordCount: validation.records.length,
        s3RawKey: s3Uploaded ? rawKey : null,
        s3Uploaded,
        s3Error,
        glueCataloged,
      },
      validation: {
        valid: validation.valid,
        totalRecords: validation.totalRecords,
        validRecords: validation.validRecordsCount,
        invalidRecords: validation.invalidRecordsCount,
        errors: validation.errors,
        warnings: validation.warnings,
      },
      hotspots,
      predictions,
      interventions,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to initialize demo dataset',
      details: err.message,
    });
  }
});

// POST /api/datasets/upload
datasetsRouter.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let rawText = '';
    let fileName = 'uploaded_telemetry.csv';

    if (req.file) {
      rawText = req.file.buffer.toString('utf-8');
      fileName = req.file.originalname || fileName;
    } else if (req.body?.content) {
      rawText = req.body.content;
      fileName = req.body.fileName || fileName;
    } else {
      return res.status(400).json({
        success: false,
        error: 'No file or content provided for upload.',
      });
    }

    // Determine format
    const isJson = fileName.toLowerCase().endsWith('.json') || rawText.trim().startsWith('[');
    let parsedRows: RawWasteInputRecord[] = [];

    if (isJson) {
      try {
        parsedRows = JSON.parse(rawText);
      } catch (err: any) {
        return res.status(400).json({
          success: false,
          error: 'Dataset validation failed: Invalid JSON structure.',
          details: [{ field: 'format', message: err.message }],
        });
      }
    } else {
      parsedRows = parseCsvToObjects(rawText);
    }

    if (parsedRows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dataset validation failed: File contains no records or invalid headers.',
      });
    }

    // Validate dataset per schema
    const validation = validateAndNormalizeDataset(parsedRows);
    if (!validation.valid && validation.records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dataset validation failed',
        details: validation.errors,
      });
    }

    const datasetId = `upload-${Date.now()}`;
    const rawKey = `wastesignal/raw/${datasetId}_${fileName}`;
    const processedKey = `wastesignal/processed/${datasetId}_analysis.json`;

    // Upload to Amazon S3
    let s3Uploaded = false;
    let s3Error: string | undefined;
    try {
      await s3Service.uploadFile(rawKey, rawText, isJson ? 'application/json' : 'text/csv');
      s3Uploaded = true;
    } catch (err: any) {
      s3Error = err.message;
      return res.status(500).json({
        success: false,
        error: 'Dataset storage unavailable',
        details: err.message,
      });
    }

    // Register with Glue catalog
    let glueCataloged = false;
    try {
      await glueService.ensureCatalogTable();
      glueCataloged = true;
    } catch (err: any) {
      console.warn('Glue registration notice:', err.message);
    }

    // Run hotspot and prediction engines
    const hotspots = computeHotspots(validation.records);
    const predictions = await predictionEngine.generatePredictions(hotspots, validation.records);
    const interventions = operationsEngine.generateFromHotspots(hotspots);

    // Save processed results to S3
    try {
      await s3Service.uploadFile(
        processedKey,
        JSON.stringify({ datasetId, hotspots, predictions, recordCount: validation.records.length }),
        'application/json'
      );
    } catch (err: any) {
      console.warn('S3 processed upload notice:', err.message);
    }

    dataStore.setActive({
      datasetId,
      name: fileName,
      fileName,
      isDemo: false,
      uploadedAt: new Date().toISOString(),
      s3RawKey: rawKey,
      s3ProcessedKey: processedKey,
      records: validation.records,
      validation,
      hotspots,
      predictions,
      interventions,
    });

    return res.json({
      success: true,
      message: `Successfully processed ${validation.validRecordsCount} records from ${fileName}.`,
      dataset: {
        id: datasetId,
        name: fileName,
        fileName,
        isDemo: false,
        recordCount: validation.validRecordsCount,
        s3RawKey: rawKey,
        s3Uploaded,
        glueCataloged,
      },
      validation: {
        valid: validation.valid,
        totalRecords: validation.totalRecords,
        validRecords: validation.validRecordsCount,
        invalidRecords: validation.invalidRecordsCount,
        errors: validation.errors,
        warnings: validation.warnings,
      },
      hotspots,
      predictions,
      interventions,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Dataset processing error',
      details: err.message,
    });
  }
});

// GET /api/datasets
datasetsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const active = dataStore.getActive();
    let s3Files: Array<{ key: string; lastModified?: Date; size?: number }> = [];

    try {
      s3Files = await s3Service.listFiles('wastesignal/');
    } catch (err: any) {
      console.warn('S3 list notice:', err.message);
    }

    return res.json({
      activeDataset: active
        ? {
            id: active.datasetId,
            name: active.name,
            fileName: active.fileName,
            isDemo: active.isDemo,
            uploadedAt: active.uploadedAt,
            recordCount: active.records.length,
            s3RawKey: active.s3RawKey,
          }
        : null,
      storedDatasets: s3Files,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
