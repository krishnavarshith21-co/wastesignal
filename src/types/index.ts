/* ============================================================
   WasteSignal — Data-Driven Type System
   All types reflect actual data schema or computed values.
   No type exists for fabricated/hardcoded metrics.
   ============================================================ */

// ─── Data Mode ───────────────────────────────────────────────
export type DataMode = 'LIVE' | 'DEMO' | 'NONE';

export type DataSourceLabel =
  | 'NO DATA CONNECTED'
  | 'DEMO DATASET'
  | 'UPLOADED DATASET';

// ─── Core Domain ─────────────────────────────────────────────
export type Priority = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type Status = 'OPEN' | 'MONITORING' | 'RESOLVED' | 'PENDING';
export type TrendDirection = 'UP' | 'DOWN' | 'STABLE';
export type IncidentType = 'OVERFLOW' | 'ILLEGAL_DUMPING' | 'MISSED_COLLECTION' | 'CONTAMINATION';
export type CollectionStatus = 'SCHEDULED' | 'COMPLETED' | 'DELAYED' | 'MISSED';

// ─── Raw Data Schema (CSV / JSON upload) ─────────────────────
export interface WasteRecord {
  zone_id: string;
  zone_name?: string;
  timestamp: string;                     // ISO 8601
  incident_type?: IncidentType;
  incident_status?: Status;
  collection_status?: CollectionStatus;
  collection_delay?: number;             // minutes
  latitude?: number;
  longitude?: number;
  route_id?: string;
  vehicle_id?: string;
  waste_type?: string;
  volume?: number;
  source?: string;
  // Optional contextual fields
  weather?: string;
  rainfall?: number;
  temperature?: number;
  footfall?: number;
  land_use?: string;
  commercial_activity?: number;
}

// ─── Dataset Metadata ────────────────────────────────────────
export interface DatasetMeta {
  id: string;
  name: string;
  fileName: string;
  importedAt: string;                    // actual ISO timestamp
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  detectedColumns: string[];
  availableFields: string[];
  missingFields: string[];
  status: 'VALIDATED' | 'WARNING' | 'ERROR';
  isDemo: boolean;
}

// ─── Computed Hotspot ────────────────────────────────────────
export interface Hotspot {
  id: string;
  zone: string;
  zoneName: string;
  priority: Priority;
  risk: number;                          // calculated from signals
  recurrence: 'RECURRING' | 'NEW' | 'INTERMITTENT';
  lastIncident: string;                  // actual timestamp from data
  trend: TrendDirection;
  status: Status;
  lat?: number;                          // from dataset coords
  lng?: number;                          // from dataset coords
  signals: Signal[];
  signalsUsed: string[];                 // explicit list of fields used
  recommendedAction: string;
  incidentHistory: IncidentRecord[];
}

export interface Signal {
  type: string;
  label: string;
  description: string;
  strength: 'LOW' | 'MODERATE' | 'HIGH';
  available: boolean;                    // whether data actually exists for this signal
}

export interface IncidentRecord {
  date: string;                          // actual timestamp
  type: string;
  severity: Priority;
  resolved: boolean;
}

// ─── Computed Prediction ─────────────────────────────────────
export interface Prediction {
  id: string;
  hotspotId: string;
  zone: string;
  day: number;
  dayLabel: string;
  predictedRisk: number;                 // calculated
  recurrenceLikelihood: 'LOW' | 'MODERATE' | 'HIGH';
  priority: Priority;
  signals: Signal[];
  recommendedIntervention: string;
}

// ─── Collection Activity (computed from dataset) ─────────────
export interface CollectionActivity {
  scheduled: number;
  completed: number;
  delayed: number;
  missed: number;
  completionRate?: number;
  delayAvg?: number;
}

// ─── Incident (from dataset) ─────────────────────────────────
export interface Incident {
  id: string;
  type: IncidentType;
  zone: string;
  date: string;                          // actual timestamp
  timestamp?: string;                    // formatted timestamp
  severity: Priority;
  status: Status;
  description: string;
  delayImpact?: number;
}

// ─── Intervention (computed) ─────────────────────────────────
export type InterventionStatus = 'PENDING' | 'REVIEW' | 'ASSIGNED' | 'IN PROGRESS' | 'RESOLVED' | 'ACTIVE';

export interface Intervention {
  id: string;
  zone: string;
  type: string;
  priority?: Priority;
  status: InterventionStatus;
  assignedDate: string;
  resolvedDate?: string;
  description: string;
  reason?: string;
  suggestedIntervention?: string;
  assignedTo?: string;
}

// ─── Intelligence Insight (computed from dataset) ────────────
export interface IntelligenceInsight {
  id: string;
  title: string;
  description: string;
  type: 'HOTSPOT' | 'COLLECTION' | 'PRIORITY' | 'TREND';
  severity: Priority;
  zone?: string;
  timestamp: string;                     // actual timestamp
  signalsUsed: string[];
  dataSource: DataSourceLabel;
  sourceLabel?: string;
  timeRange?: string;
}

// ─── Notification ────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'ALERT' | 'INFO' | 'WARNING';
  timestamp: string;
  read: boolean;
}

// ─── Report ──────────────────────────────────────────────────
export interface ReportConfig {
  title: string;
  dataStatus: DataSourceLabel;
  datasetName: string;
  recordCount: number;
  availableFields: string[];
  period: string;
  hotspotCount: number;
  predictionAvailable: boolean;
  limitations: string[];
}

// ─── AWS Infrastructure Types ────────────────────────────────
export interface AwsServiceProbe {
  status: 'CONNECTED' | 'NOT CONFIGURED' | 'UNAVAILABLE' | 'ERROR' | 'READY';
  bucket?: string;
  database?: string;
  workgroup?: string;
  modelId?: string;
  endpointName?: string;
  handler?: string;
  environment?: string;
  error?: string;
}

export interface AwsInfrastructureStatus {
  timestamp: string;
  region: string;
  services: {
    s3: AwsServiceProbe;
    glue: AwsServiceProbe;
    athena: AwsServiceProbe;
    bedrock: AwsServiceProbe;
    sagemaker: AwsServiceProbe;
    lambda: AwsServiceProbe;
  };
  overallStatus: 'OPERATIONAL' | 'DEGRADED' | 'CONFIG_REQUIRED';
}

export interface BedrockExplanationResponse {
  whyPrioritized: string;
  contributingSignalsSummary: string[];
  recommendedAction: string;
  preventiveChecklist: string[];
  aiProvider: 'AMAZON_BEDROCK' | 'RULE_BASED_FALLBACK';
  modelId?: string;
  fallbackReason?: string;
}

