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
export const datasetsRouter = Router();

// Helper to parse CSV into array of objects
function parseCsvToObjects(csvText: string): RawWasteInputRecord[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: RawWasteInputRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (rawCols.length === 0 || rawCols.every(c => !c)) continue;

    const rowObj: RawWasteInputRecord = {};
    headers.forEach((h, idx) => {
      rowObj[h] = rawCols[idx];
    });
    rows.push(rowObj);
  }

  return rows;
}

// Generate canonical synthetic demo CSV
function generateSyntheticDemoCsv(): string {
  const now = new Date();
  const d = (daysAgo: number, hour = 8) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - daysAgo);
    dt.setHours(hour, 0, 0, 0);
    return dt.toISOString();
  };

  const header = 'record_id,timestamp,latitude,longitude,location_name,zone_id,waste_type,incident_type,incident_status,collection_status,collection_delay,reported_volume,complaint_count,previous_incidents,response_time,weather_context,day_of_week';
  const rows = [
    `REC-01,${d(0, 6)},12.9850,77.5920,Northern Residential Block,Z-07,MIXED,OVERFLOW,OPEN,DELAYED,45,320,4,3,60,RAIN,Monday`,
    `REC-02,${d(3, 14)},12.9852,77.5918,Northern Residential Block,Z-07,MIXED,OVERFLOW,RESOLVED,COMPLETED,0,290,2,2,40,CLEAR,Friday`,
    `REC-03,${d(7, 9)},12.9855,77.5922,Northern Residential Block,Z-07,CONSTRUCTION,ILLEGAL_DUMPING,RESOLVED,COMPLETED,0,180,1,1,30,CLEAR,Monday`,
    `REC-04,${d(1, 18)},12.9710,77.5870,Transit Hub South,Z-09,MIXED,OVERFLOW,OPEN,DELAYED,60,410,6,4,85,CLEAR,Sunday`,
    `REC-05,${d(5, 17)},12.9712,77.5868,Transit Hub South,Z-09,MIXED,OVERFLOW,RESOLVED,DELAYED,35,380,3,3,50,RAIN,Thursday`,
    `REC-06,${d(9, 16)},12.9708,77.5872,Transit Hub South,Z-09,MIXED,MISSED_COLLECTION,RESOLVED,MISSED,0,0,5,2,90,CLEAR,Sunday`,
    `REC-07,${d(2, 10)},12.9780,77.5950,Central Market District,Z-04,ORGANIC,OVERFLOW,OPEN,DELAYED,25,280,2,2,35,HUMID,Saturday`,
    `REC-08,${d(8, 9)},12.9782,77.5948,Central Market District,Z-04,ORGANIC,OVERFLOW,RESOLVED,COMPLETED,0,310,1,1,20,CLEAR,Sunday`,
    `REC-09,${d(4, 13)},12.9650,77.6100,Industrial Corridor East,Z-12,HAZARDOUS,CONTAMINATION,OPEN,DELAYED,90,150,3,3,110,CLEAR,Wednesday`,
    `REC-10,${d(3, 15)},12.9648,77.6105,Industrial Corridor East,Z-12,CONSTRUCTION,ILLEGAL_DUMPING,OPEN,DELAYED,120,600,7,4,130,CLEAR,Thursday`,
    `REC-11,${d(5, 12)},12.9900,77.5800,Waterfront Promenade,Z-02,RECYCLABLE,OVERFLOW,RESOLVED,COMPLETED,0,180,1,1,25,CLEAR,Tuesday`,
    `REC-12,${d(7, 11)},12.9550,77.6050,University Quarter,Z-15,MIXED,OVERFLOW,RESOLVED,COMPLETED,0,220,2,1,30,CLEAR,Monday`,
    `REC-13,${d(3, 16)},12.9600,77.6000,Logistics Park,Z-11,PACKAGING,OVERFLOW,OPEN,DELAYED,40,520,3,3,45,CLEAR,Thursday`,
    `REC-14,${d(10, 15)},12.9602,77.5998,Logistics Park,Z-11,PACKAGING,OVERFLOW,RESOLVED,COMPLETED,0,490,1,2,30,CLEAR,Wednesday`,
    `REC-15,${d(6, 8)},12.9950,77.5750,Suburban Residential West,Z-14,MIXED,MISSED_COLLECTION,RESOLVED,MISSED,0,0,2,1,60,CLEAR,Tuesday`,
    // Routine completed collections without incident
    `REC-16,${d(1, 7)},12.9851,77.5921,Northern Residential Block,Z-07,MIXED,,RESOLVED,COMPLETED,0,200,0,0,0,CLEAR,Sunday`,
    `REC-17,${d(2, 7)},12.9851,77.5921,Northern Residential Block,Z-07,ORGANIC,,RESOLVED,COMPLETED,0,150,0,0,0,CLEAR,Saturday`,
    `REC-18,${d(2, 7)},12.9710,77.5870,Transit Hub South,Z-09,MIXED,,RESOLVED,COMPLETED,0,260,0,0,0,CLEAR,Saturday`,
    `REC-19,${d(3, 7)},12.9710,77.5870,Transit Hub South,Z-09,MIXED,,RESOLVED,COMPLETED,0,240,0,0,0,CLEAR,Friday`,
    `REC-20,${d(1, 7)},12.9780,77.5950,Central Market District,Z-04,ORGANIC,,RESOLVED,COMPLETED,0,220,0,0,0,CLEAR,Sunday`,
    `REC-21,${d(3, 7)},12.9780,77.5950,Central Market District,Z-04,MIXED,,RESOLVED,COMPLETED,0,190,0,0,0,CLEAR,Friday`,
    `REC-22,${d(2, 7)},12.9650,77.6100,Industrial Corridor East,Z-12,INDUSTRIAL,,RESOLVED,COMPLETED,0,350,0,0,0,CLEAR,Saturday`,
    `REC-23,${d(1, 7)},12.9900,77.5800,Waterfront Promenade,Z-02,MIXED,,RESOLVED,COMPLETED,0,140,0,0,0,CLEAR,Sunday`,
    `REC-24,${d(1, 7)},12.9550,77.6050,University Quarter,Z-15,MIXED,,RESOLVED,COMPLETED,0,160,0,0,0,CLEAR,Sunday`,
    `REC-25,${d(2, 7)},12.9600,77.6000,Logistics Park,Z-11,PACKAGING,,RESOLVED,COMPLETED,0,380,0,0,0,CLEAR,Saturday`,
  ];
  return [header, ...rows].join('\n');
}

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
