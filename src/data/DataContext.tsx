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
  analyzeDataAvailability, hasCoordinates,
} from '../data/analysisEngine';
import { apiFetch } from '../utils/api';

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
      const data = await apiFetch<AwsInfrastructureStatus>('/api/aws/status');
      setAwsStatus(data);
    } catch (err: any) {
      console.warn('Unable to reach /api/aws/status:', err.message);
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
      const data = await apiFetch<any>('/api/datasets/demo', { method: 'POST' });
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
    } catch (err: any) {
      console.warn('Backend unavailable during loadDemoData, falling back to local synthetic demonstration data:', err.message);
    }

    // Client-side fallback if backend is offline
    setRawData(DEMO_WASTE_DATA);
    setDatasetMeta(DEMO_DATASET_META);
    setDataMode('DEMO');
  }, [refreshAwsStatus]);

  const uploadData = useCallback(async (text: string, _format: 'csv' | 'json', fileName: string): Promise<{ success: boolean; message: string }> => {
    try {
      const data = await apiFetch<any>('/api/datasets/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, fileName }),
      });

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
    } catch (err: any) {
      console.error('Backend upload to AWS failed:', err.message);
      return {
        success: false,
        message: `AWS Ingestion Failed: ${err.message}. Telemetry was NOT uploaded to Amazon S3 or registered in AWS Glue Data Catalog.`,
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
    const data = await apiFetch<{ explanation: BedrockExplanationResponse }>('/api/intelligence/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotspotId, zoneId }),
    });
    return data.explanation;
  }, []);

  const updateInterventionStatus = useCallback(async (id: string, status: InterventionStatus, notes?: string) => {
    const data = await apiFetch<{ success: boolean; intervention: any }>(`/api/operations/interventions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });

    if (data.intervention) {
      setBackendInterventions(prev =>
        prev.map(it => it.id === id ? { ...it, status: data.intervention.status, notes: data.intervention.notes } : it)
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
