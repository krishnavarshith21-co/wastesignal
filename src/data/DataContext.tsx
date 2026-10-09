/* ============================================================
   WasteSignal — Data Context
   
   Central state for the entire application.
   Integrates directly with the AWS backend layer:
   - S3 object storage
   - AWS Glue catalog synchronization
   - Deterministic hotspot calculation & recurrence predictions
   - Amazon Bedrock grounded explanation generation
   - Real-time AWS infrastructure probing
   ============================================================ */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type {
  DataMode, DataSourceLabel, WasteRecord, DatasetMeta,
  Hotspot, Prediction, Incident, Intervention,
  IntelligenceInsight, CollectionActivity, Notification,
  AwsInfrastructureStatus, BedrockExplanationResponse, InterventionStatus,
} from '../types';
import { DEMO_WASTE_DATA, DEMO_DATASET_META } from '../data/demoWasteData';
import {
  analyzeHotspots, analyzePredictions, analyzeCollectionActivity,
  analyzeIncidents, analyzeInterventions, analyzeIntelligence,
  analyzeDataAvailability, parseCSV, parseJSON, hasCoordinates,
} from '../data/analysisEngine';

interface DataContextType {
  // Mode
  dataMode: DataMode;
  sourceLabel: DataSourceLabel;

  // Raw data
  rawData: WasteRecord[];
  datasetMeta: DatasetMeta | null;

  // AWS Infrastructure
  awsStatus: AwsInfrastructureStatus | null;
  awsStatusLoading: boolean;
  refreshAwsStatus: () => Promise<void>;

  // Computed data — derived from rawData
  hotspots: Hotspot[];
  predictions: Prediction[];
  collectionActivity: CollectionActivity | null;
  incidents: Incident[];
  interventions: Intervention[];
  insights: IntelligenceInsight[];
  notifications: Notification[];
  dataAvailability: { available: string[]; missing: string[] };
  hasMapCoordinates: boolean;

  // Actions
  loadDemoData: () => Promise<void>;
  uploadData: (text: string, format: 'csv' | 'json', fileName: string) => Promise<{ success: boolean; message: string }>;
  clearData: () => void;
  explainHotspot: (hotspotId: string, zoneId?: string) => Promise<BedrockExplanationResponse>;
  updateInterventionStatus: (id: string, status: InterventionStatus, notes?: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [dataMode, setDataMode] = useState<DataMode>('NONE');
  const [rawData, setRawData] = useState<WasteRecord[]>([]);
  const [datasetMeta, setDatasetMeta] = useState<DatasetMeta | null>(null);
  const [awsStatus, setAwsStatus] = useState<AwsInfrastructureStatus | null>(null);
  const [awsStatusLoading, setAwsStatusLoading] = useState(false);
  const [backendInterventions, setBackendInterventions] = useState<Intervention[]>([]);

  // Fetch real AWS status
  const refreshAwsStatus = useCallback(async () => {
    try {
      setAwsStatusLoading(true);
      const res = await fetch('/api/aws/status');
      if (res.ok) {
        const data: AwsInfrastructureStatus = await res.json();
        setAwsStatus(data);
      }
    } catch (err) {
      console.warn('Unable to reach /api/aws/status:', err);
    } finally {
      setAwsStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAwsStatus();
  }, [refreshAwsStatus]);

  const sourceLabel: DataSourceLabel = useMemo(() => {
    switch (dataMode) {
      case 'LIVE': return 'UPLOADED DATASET';
      case 'DEMO': return 'DEMO DATASET';
      default: return 'NO DATA CONNECTED';
    }
  }, [dataMode]);

  // ─── Computed analytics (all derived, never hardcoded) ─────
  const hotspots = useMemo(() =>
    rawData.length > 0 ? analyzeHotspots(rawData, sourceLabel) : [],
    [rawData, sourceLabel]
  );

  const predictions = useMemo(() =>
    rawData.length > 0 ? analyzePredictions(hotspots, rawData) : [],
    [hotspots, rawData]
  );

  const collectionActivity = useMemo(() =>
    rawData.length > 0 ? analyzeCollectionActivity(rawData) : null,
    [rawData]
  );

  const incidents = useMemo(() =>
    rawData.length > 0 ? analyzeIncidents(rawData) : [],
    [rawData]
  );

  const interventions = useMemo(() => {
    if (backendInterventions.length > 0) return backendInterventions;
    return hotspots.length > 0 ? analyzeInterventions(hotspots) : [];
  }, [backendInterventions, hotspots]);

  const insights = useMemo(() =>
    rawData.length > 0 ? analyzeIntelligence(rawData, hotspots, sourceLabel) : [],
    [rawData, hotspots, sourceLabel]
  );

  const dataAvailability = useMemo(() =>
    rawData.length > 0 ? analyzeDataAvailability(rawData) : { available: [], missing: [] },
    [rawData]
  );

  const hasMapCoordinates = useMemo(() =>
    hasCoordinates(rawData),
    [rawData]
  );

  const notifications: Notification[] = useMemo(() => {
    if (rawData.length === 0) return [];
    const notifs: Notification[] = [];
    const critical = hotspots.filter(h => h.priority === 'CRITICAL');
    if (critical.length > 0) {
      notifs.push({
        id: 'N-001',
        title: `Critical hotspot — ${critical[0].zone}`,
        description: `${critical[0].zone} risk level evaluated at ${critical[0].risk}/100 based on dataset telemetry.`,
        type: 'ALERT',
        timestamp: 'Current analysis',
        read: false,
      });
    }
    if (predictions.length > 0) {
      notifs.push({
        id: 'N-002',
        title: 'Predictions generated',
        description: `${predictions.length} forward recurrence predictions generated from operational signals.`,
        type: 'INFO',
        timestamp: 'Current analysis',
        read: false,
      });
    }
    if (incidents.length > 0) {
      const openCount = incidents.filter(i => i.status === 'OPEN').length;
      if (openCount > 0) {
        notifs.push({
          id: 'N-003',
          title: `${openCount} open incident${openCount > 1 ? 's' : ''}`,
          description: `There are ${openCount} unresolved incidents in the current dataset.`,
          type: 'WARNING',
          timestamp: 'Current analysis',
          read: true,
        });
      }
    }
    return notifs;
  }, [rawData, hotspots, predictions, incidents]);

  // ─── Actions ───────────────────────────────────────────────

  const loadDemoData = useCallback(async () => {
    try {
      const res = await fetch('/api/datasets/demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.dataset) {
          const mapped: WasteRecord[] = (data.validation?.records || []).map((r: any) => ({
            zone_id: r.zone_id,
            zone_name: r.location_name,
            timestamp: r.timestamp,
            incident_type: r.incident_type,
            incident_status: r.incident_status,
            collection_status: r.collection_status,
            collection_delay: r.collection_delay,
            latitude: r.latitude,
            longitude: r.longitude,
            waste_type: r.waste_type,
            volume: r.reported_volume,
          }));

          setRawData(mapped.length > 0 ? mapped : DEMO_WASTE_DATA);
          setDatasetMeta({
            id: data.dataset.id,
            name: data.dataset.name,
            fileName: data.dataset.fileName,
            importedAt: new Date().toISOString(),
            totalRecords: data.validation?.totalRecords || mapped.length,
            validRecords: data.validation?.validRecords || mapped.length,
            invalidRecords: data.validation?.invalidRecords || 0,
            detectedColumns: ['record_id', 'timestamp', 'latitude', 'longitude', 'location_name', 'zone_id', 'waste_type', 'incident_type', 'collection_status', 'collection_delay', 'reported_volume'],
            availableFields: ['record_id', 'timestamp', 'latitude', 'longitude', 'location_name', 'zone_id', 'waste_type', 'incident_type', 'collection_status', 'collection_delay', 'reported_volume'],
            missingFields: [],
            status: 'VALIDATED',
            isDemo: true,
          });

          if (data.interventions && Array.isArray(data.interventions)) {
            setBackendInterventions(
              data.interventions.map((it: any) => ({
                id: it.id,
                zone: it.zoneId,
                type: 'PREVENTIVE DISPATCH',
                priority: it.priority,
                status: it.status,
                assignedDate: it.createdAt,
                description: it.suggestedIntervention || it.reason,
                reason: it.reason,
                suggestedIntervention: it.suggestedIntervention,
                assignedTo: it.assignedTo,
              }))
            );
          }

          setDataMode('DEMO');
          refreshAwsStatus();
          return;
        }
      }
    } catch (err) {
      console.warn('Backend unavailable during loadDemoData, falling back to local data:', err);
    }

    // Client-side fallback if backend is offline
    setRawData(DEMO_WASTE_DATA);
    setDatasetMeta(DEMO_DATASET_META);
    setDataMode('DEMO');
  }, [refreshAwsStatus]);

  const uploadData = useCallback(async (text: string, format: 'csv' | 'json', fileName: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/datasets/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, fileName }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.dataset) {
          const mapped: WasteRecord[] = (data.validation?.records || []).map((r: any) => ({
            zone_id: r.zone_id,
            zone_name: r.location_name,
            timestamp: r.timestamp,
            incident_type: r.incident_type,
            incident_status: r.incident_status,
            collection_status: r.collection_status,
            collection_delay: r.collection_delay,
            latitude: r.latitude,
            longitude: r.longitude,
            waste_type: r.waste_type,
            volume: r.reported_volume,
          }));

          setRawData(mapped);
          setDatasetMeta({
            id: data.dataset.id,
            name: data.dataset.name,
            fileName: data.dataset.fileName,
            importedAt: new Date().toISOString(),
            totalRecords: data.validation?.totalRecords || mapped.length,
            validRecords: data.validation?.validRecords || mapped.length,
            invalidRecords: data.validation?.invalidRecords || 0,
            detectedColumns: ['record_id', 'timestamp', 'latitude', 'longitude', 'location_name', 'zone_id', 'waste_type', 'incident_type', 'collection_status', 'collection_delay', 'reported_volume'],
            availableFields: ['record_id', 'timestamp', 'latitude', 'longitude', 'location_name', 'zone_id', 'waste_type', 'incident_type', 'collection_status', 'collection_delay', 'reported_volume'],
            missingFields: [],
            status: data.validation?.invalidRecords > 0 ? 'WARNING' : 'VALIDATED',
            isDemo: false,
          });

          if (data.interventions && Array.isArray(data.interventions)) {
            setBackendInterventions(
              data.interventions.map((it: any) => ({
                id: it.id,
                zone: it.zoneId,
                type: 'PREVENTIVE DISPATCH',
                priority: it.priority,
                status: it.status,
                assignedDate: it.createdAt,
                description: it.suggestedIntervention || it.reason,
                reason: it.reason,
                suggestedIntervention: it.suggestedIntervention,
                assignedTo: it.assignedTo,
              }))
            );
          }

          setDataMode('LIVE');
          refreshAwsStatus();
          return {
            success: true,
            message: `Successfully processed ${data.validation?.validRecords || mapped.length} records into S3 and Glue catalog.`,
          };
        } else {
          return {
            success: false,
            message: data.error || 'Failed to upload dataset to AWS storage.',
          };
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.error || `Upload rejected (${res.status}): ${res.statusText}`,
        };
      }
    } catch (err: any) {
      console.warn('Backend upload failed, attempting local parse fallback:', err.message);
      const records = format === 'csv' ? parseCSV(text) : parseJSON(text);
      if (records.length === 0) {
        return { success: false, message: 'No valid records could be parsed from the file.' };
      }
      const availability = analyzeDataAvailability(records);
      setRawData(records);
      setDatasetMeta({
        id: `upload-${Date.now()}`,
        name: fileName,
        fileName,
        importedAt: new Date().toISOString(),
        totalRecords: records.length,
        validRecords: records.filter(r => r.zone_id && r.timestamp).length,
        invalidRecords: records.filter(r => !r.zone_id || !r.timestamp).length,
        detectedColumns: availability.available,
        availableFields: availability.available,
        missingFields: availability.missing,
        status: records.filter(r => !r.zone_id || !r.timestamp).length > 0 ? 'WARNING' : 'VALIDATED',
        isDemo: false,
      });
      setDataMode('LIVE');
      return {
        success: true,
        message: `Parsed ${records.length} records locally (backend offline).`,
      };
    }
  }, [refreshAwsStatus]);

  const clearData = useCallback(() => {
    setRawData([]);
    setDatasetMeta(null);
    setBackendInterventions([]);
    setDataMode('NONE');
  }, []);

  const explainHotspot = useCallback(async (hotspotId: string, zoneId?: string): Promise<BedrockExplanationResponse> => {
    const res = await fetch('/api/intelligence/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotspotId, zoneId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to generate explanation (${res.status})`);
    }

    const data = await res.json();
    return data.explanation;
  }, []);

  const updateInterventionStatus = useCallback(async (id: string, status: InterventionStatus, notes?: string) => {
    try {
      const res = await fetch(`/api/operations/interventions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.intervention) {
          setBackendInterventions(prev =>
            prev.map(it => it.id === id ? { ...it, status: data.intervention.status, notes: data.intervention.notes } : it)
          );
        }
      }
    } catch (err) {
      console.warn('Failed to persist intervention update:', err);
      // Local optimistic update
      setBackendInterventions(prev =>
        prev.map(it => it.id === id ? { ...it, status } : it)
      );
    }
  }, []);

  const value: DataContextType = {
    dataMode, sourceLabel, rawData, datasetMeta,
    awsStatus, awsStatusLoading, refreshAwsStatus,
    hotspots, predictions, collectionActivity, incidents,
    interventions, insights, notifications, dataAvailability,
    hasMapCoordinates,
    loadDemoData, uploadData, clearData,
    explainHotspot, updateInterventionStatus,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useWasteData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useWasteData must be used within DataProvider');
  return ctx;
}
