/* ============================================================
   WasteSignal — Data Context
   
   Central state for the entire application.
   Manages three data modes: NONE, DEMO, LIVE.
   All pages consume computed data from this single source.
   ============================================================ */

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type {
  DataMode, DataSourceLabel, WasteRecord, DatasetMeta,
  Hotspot, Prediction, Incident, Intervention,
  IntelligenceInsight, CollectionActivity, Notification,
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
  loadDemoData: () => void;
  uploadData: (text: string, format: 'csv' | 'json', fileName: string) => { success: boolean; message: string };
  clearData: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [dataMode, setDataMode] = useState<DataMode>('NONE');
  const [rawData, setRawData] = useState<WasteRecord[]>([]);
  const [datasetMeta, setDatasetMeta] = useState<DatasetMeta | null>(null);

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

  const interventions = useMemo(() =>
    hotspots.length > 0 ? analyzeInterventions(hotspots) : [],
    [hotspots]
  );

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
        description: `${critical[0].zone} risk level has reached CRITICAL based on dataset analysis.`,
        type: 'ALERT',
        timestamp: 'Current analysis',
        read: false,
      });
    }
    if (predictions.length > 0) {
      notifs.push({
        id: 'N-002',
        title: 'Predictions generated',
        description: `${predictions.length} hotspot predictions generated from the current dataset.`,
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

  const loadDemoData = useCallback(() => {
    setRawData(DEMO_WASTE_DATA);
    setDatasetMeta(DEMO_DATASET_META);
    setDataMode('DEMO');
  }, []);

  const uploadData = useCallback((text: string, format: 'csv' | 'json', fileName: string): { success: boolean; message: string } => {
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
      message: `Successfully imported ${records.length} records from ${fileName}.`,
    };
  }, []);

  const clearData = useCallback(() => {
    setRawData([]);
    setDatasetMeta(null);
    setDataMode('NONE');
  }, []);

  const value: DataContextType = {
    dataMode, sourceLabel, rawData, datasetMeta,
    hotspots, predictions, collectionActivity, incidents,
    interventions, insights, notifications, dataAvailability,
    hasMapCoordinates,
    loadDemoData, uploadData, clearData,
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
