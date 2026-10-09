import { useState, useRef } from 'react';
import { useWasteData } from '../data/DataContext';
import EmptyState from '../components/EmptyState';
import AwsStatusCard from '../components/AwsStatusCard';
import { parseCSV, parseJSON } from '../data/analysisEngine';
import { apiFetch } from '../utils/api';
import type { WasteRecord } from '../types';
import './DataSources.css';

const SAMPLE_CSV = `zone_id,zone_name,timestamp,incident_type,incident_status,collection_status,collection_delay,latitude,longitude,waste_type,volume
Z-07,Northern Residential Block,2026-10-04T08:00:00Z,OVERFLOW,OPEN,DELAYED,45,12.9850,77.5920,MIXED,320
Z-07,Northern Residential Block,2026-10-01T14:00:00Z,OVERFLOW,RESOLVED,COMPLETED,0,12.9852,77.5918,MIXED,290
Z-09,Transit Hub South,2026-10-03T18:00:00Z,OVERFLOW,OPEN,DELAYED,60,12.9710,77.5870,MIXED,410
Z-09,Transit Hub South,2026-09-28T17:00:00Z,OVERFLOW,RESOLVED,DELAYED,35,12.9712,77.5868,MIXED,380
Z-04,Central Market District,2026-10-02T10:00:00Z,OVERFLOW,OPEN,DELAYED,25,12.9780,77.5950,ORGANIC,280
Z-04,Central Market District,2026-09-26T09:00:00Z,OVERFLOW,RESOLVED,COMPLETED,0,12.9782,77.5948,ORGANIC,310
Z-12,Industrial Corridor East,2026-09-30T13:00:00Z,CONTAMINATION,OPEN,DELAYED,90,12.9650,77.6100,HAZARDOUS,150
Z-12,Industrial Corridor East,2026-10-01T15:00:00Z,ILLEGAL_DUMPING,OPEN,DELAYED,120,12.9648,77.6105,CONSTRUCTION,600
Z-02,Waterfront Promenade,2026-10-03T11:00:00Z,OVERFLOW,OPEN,DELAYED,20,12.9910,77.5780,RECYCLABLE,190
Z-15,University Quarter,2026-10-02T16:00:00Z,OVERFLOW,OPEN,DELAYED,30,12.9620,77.6250,MIXED,340`;

export default function DataSources() {
  const {
    dataMode,
    sourceLabel,
    rawData,
    datasetMeta,
    loadDemoData,
    uploadData,
    clearData,
    dataAvailability,
  } = useWasteData();

  const [notification, setNotification] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);

  // Upload modal state
  const [uploadText, setUploadText] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFormat, setUploadFormat] = useState<'csv' | 'json'>('csv');
  const [stagedRecords, setStagedRecords] = useState<WasteRecord[]>([]);
  const [stagedColumns, setStagedColumns] = useState<string[]>([]);
  const [stagedValidation, setStagedValidation] = useState<{ valid: number; invalid: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Athena workbench state
  const [athenaQueryType, setAthenaQueryType] = useState<string | null>(null);
  const [athenaLoading, setAthenaLoading] = useState(false);
  const [athenaResults, setAthenaResults] = useState<{ queryExecutionId?: string; rows?: any[]; error?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isConnected = dataMode !== 'NONE' && rawData.length > 0;
  const isDemo = dataMode === 'DEMO';

  // Handle file selection
  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    const format = file.name.endsWith('.json') ? 'json' : 'csv';
    setUploadFormat(format);

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      setUploadText(text);
      processStagedFile(text, format);
    };
    reader.readAsText(file);
  }

  function processStagedFile(text: string, format: 'csv' | 'json') {
    try {
      const records = format === 'csv' ? parseCSV(text) : parseJSON(text);
      if (records.length === 0) {
        setStagedValidation({ valid: 0, invalid: 0 });
        setStagedRecords([]);
        setStagedColumns([]);
        return;
      }

      const cols = Object.keys(records[0] || {});
      const valid = records.filter(r => r.zone_id && r.timestamp).length;
      const invalid = records.length - valid;

      setStagedRecords(records);
      setStagedColumns(cols);
      setStagedValidation({ valid, invalid });
    } catch {
      setStagedValidation({ valid: 0, invalid: 0 });
      setStagedRecords([]);
    }
  }

  async function handleConfirmIngestion() {
    if (!uploadText.trim()) return;
    setIsProcessing(true);

    try {
      const result = await uploadData(uploadText, uploadFormat, uploadFileName || `dataset-${Date.now()}.${uploadFormat}`);
      setIsProcessing(false);
      setShowUploadModal(false);
      setUploadText('');
      setStagedRecords([]);
      setStagedValidation(null);

      setNotification(result.message);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setIsProcessing(false);
      setNotification(err.message || 'Upload failed');
      setTimeout(() => setNotification(null), 4000);
    }
  }

  async function runAthenaQuery(queryType: string) {
    setAthenaQueryType(queryType);
    setAthenaLoading(true);
    setAthenaResults(null);

    try {
      const data = await apiFetch<any>('/api/aws/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryType }),
      });
      if (data.success) {
        setAthenaResults({ queryExecutionId: data.queryExecutionId, rows: data.rows });
      } else {
        setAthenaResults({ error: data.error || data.details || 'Athena query execution failed' });
      }
    } catch (err: any) {
      setAthenaResults({ error: err.message || 'Athena query network error' });
    } finally {
      setAthenaLoading(false);
    }
  }

  function handleDownloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_waste_signals.csv';
    a.click();
    setNotification('Downloaded sample_waste_signals.csv');
    setTimeout(() => setNotification(null), 3000);
  }

  return (
    <div className="datasources-page animate-fade-in">
      {/* Top Banner / Title */}
      <div className="page-top">
        <div>
          <h1 className="heading-page">Data Sources & Signal Ingestion</h1>
          <p className="text-body" style={{ marginTop: 4 }}>
            Connect and validate municipal operational datasets to drive WasteSignal predictive intelligence
          </p>
        </div>
        <div className="datasources-top-actions">
          {isConnected && (
            <button className="btn-caution" onClick={clearData}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                <line x1="12" y1="2" x2="12" y2="12" />
              </svg>
              Disconnect Dataset
            </button>
          )}
          <button className="btn-secondary" onClick={handleDownloadSample}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Sample CSV
          </button>
          <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
              <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
            </svg>
            Connect Data Source
          </button>
        </div>
      </div>

      {notification && (
        <div className="datasources-toast animate-slide-up">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{notification}</span>
        </div>
      )}

      {/* Top Section Replaced Exactly per Section 3 */}
      <div className="card" style={{ padding: 'var(--space-2xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-xl)' }}>
          <div style={{ maxWidth: '640px' }}>
            <span className="text-meta">CONNECTED DATA SOURCES</span>
            <h2 className="heading-section" style={{ fontSize: 'var(--text-3xl)', marginTop: '4px', marginBottom: '8px' }}>
              {isConnected ? '1 Connected' : '0 Connected'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className={`status-dot ${isConnected ? 'active' : 'inactive'}`} />
              <span className="text-small" style={{ fontWeight: 500, color: isConnected ? 'var(--deep-graphite)' : 'var(--text-tertiary)' }}>
                {dataMode === 'NONE'
                  ? 'No operational dataset connected.'
                  : dataMode === 'DEMO'
                  ? 'Demo dataset connected (Synthetic demonstration baseline).'
                  : `Live dataset connected: ${datasetMeta?.name || 'Custom upload'}`}
              </span>
            </div>
            <p className="text-body text-secondary" style={{ lineHeight: 'var(--leading-relaxed)' }}>
              {isConnected
                ? 'WasteSignal is actively deriving hotspot risk scores, forward 7-day prediction windows, and operational observations from this dataset.'
                : 'Connect a dataset to begin generating WasteSignal intelligence. Upload operational records in CSV or JSON, or load the controlled synthetic demo dataset.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
            <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Dataset
            </button>
            <button className="btn-secondary" onClick={loadDemoData}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Use Demo Data
            </button>
            <button className="btn-tertiary" onClick={() => setShowFormatModal(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              View Required Schema
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stream summary - strictly calculated, no fake latency or fake certification */}
      <div className="datasources-kpi-grid">
        <div className="card ds-kpi-card">
          <span className="text-meta">DATA MODE</span>
          <span className="ds-kpi-val text-mono" style={{ fontSize: 'var(--text-lg)' }}>
            {dataMode}
          </span>
          <span className="text-meta">{sourceLabel}</span>
        </div>
        <div className="card ds-kpi-card">
          <span className="text-meta">INGESTED RECORDS</span>
          <span className="ds-kpi-val text-mono">
            {rawData.length > 0 ? rawData.length.toLocaleString() : '—'}
          </span>
          <span className="text-meta">
            {rawData.length > 0 ? `${datasetMeta?.validRecords || rawData.length} valid rows` : 'No data connected'}
          </span>
        </div>
        <div className="card ds-kpi-card">
          <span className="text-meta">AVAILABLE SIGNALS</span>
          <span className="ds-kpi-val text-mono">
            {dataAvailability.available.length > 0 ? `${dataAvailability.available.length} Fields` : '—'}
          </span>
          <span className="text-meta">
            {dataAvailability.missing.length > 0 ? `${dataAvailability.missing.length} fields missing` : 'All signals mapped'}
          </span>
        </div>
        <div className="card ds-kpi-card">
          <span className="text-meta">DATA VALIDATION</span>
          <span className="ds-kpi-val text-mono" style={{ fontSize: 'var(--text-lg)', color: isConnected ? 'var(--olive)' : 'var(--text-tertiary)' }}>
            {isConnected ? 'VALIDATED' : 'STANDBY'}
          </span>
          <span className="text-meta">
            {isConnected ? 'Schema validation active' : 'Awaiting ingestion'}
          </span>
        </div>
      </div>

      {/* Detailed Inspection Pane */}
      {isConnected && datasetMeta ? (
        <div className="datasources-layout">
          {/* Left: Dataset Details Panel */}
          <div className="card ds-detail-card">
            <div className="card-header">
              <div>
                <span className="text-meta">CONNECTED DATASET</span>
                <h3 className="heading-section" style={{ marginTop: '2px' }}>{datasetMeta.name}</h3>
              </div>
              <span className={`badge ${isDemo ? 'badge-demo' : 'badge-low'}`}>
                {datasetMeta.status}
              </span>
            </div>

            <div className="ds-detail-body">
              <div className="ds-detail-meta-grid">
                <div className="ds-meta-item">
                  <span className="text-meta">FILE NAME</span>
                  <span className="text-small text-mono">{datasetMeta.fileName}</span>
                </div>
                <div className="ds-meta-item">
                  <span className="text-meta">LAST IMPORTED</span>
                  <span className="text-mono text-small">
                    {new Date(datasetMeta.importedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="ds-meta-item">
                  <span className="text-meta">TOTAL RECORDS</span>
                  <span className="text-mono text-small">{datasetMeta.totalRecords.toLocaleString()}</span>
                </div>
                <div className="ds-meta-item">
                  <span className="text-meta">VALID RECORDS</span>
                  <span className="text-mono text-small" style={{ color: 'var(--olive)' }}>{datasetMeta.validRecords.toLocaleString()}</span>
                </div>
                <div className="ds-meta-item">
                  <span className="text-meta">INVALID / REJECTED</span>
                  <span className="text-mono text-small" style={{ color: datasetMeta.invalidRecords > 0 ? 'var(--terracotta)' : 'var(--text-secondary)' }}>
                    {datasetMeta.invalidRecords}
                  </span>
                </div>
                <div className="ds-meta-item">
                  <span className="text-meta">INGESTION STATUS</span>
                  <span className="text-small text-mono">{datasetMeta.status}</span>
                </div>
              </div>

              {/* Signals breakdown: Available vs Missing */}
              <div>
                <span className="text-meta">SIGNAL AVAILABILITY AUDIT</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '8px' }}>
                  {dataAvailability.available.map(field => (
                    <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                      <span className="text-mono text-small">{field}</span>
                      <span className="badge badge-low" style={{ fontSize: '9px' }}>AVAILABLE</span>
                    </div>
                  ))}
                  {dataAvailability.missing.map(field => (
                    <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' }}>
                      <span className="text-mono text-small text-tertiary">{field}</span>
                      <span className="badge badge-outline" style={{ fontSize: '9px', color: 'var(--terracotta)' }}>FIELD NOT AVAILABLE</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Sample Preview */}
              <div>
                <span className="text-meta">FIRST 5 NORMALIZED RECORDS</span>
                <div style={{ overflowX: 'auto', marginTop: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <table className="data-table" style={{ margin: 0, fontSize: '11px' }}>
                    <thead>
                      <tr>
                        <th>zone_id</th>
                        <th>timestamp</th>
                        <th>incident_type</th>
                        <th>collection_status</th>
                        <th>delay</th>
                        <th>coords</th>
                        <th>volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rawData.slice(0, 5).map((r, i) => (
                        <tr key={i}>
                          <td className="text-mono">{r.zone_id}</td>
                          <td className="text-mono">{r.timestamp?.slice(0, 16)}</td>
                          <td>{r.incident_type || '—'}</td>
                          <td>{r.collection_status || '—'}</td>
                          <td className="text-mono">{r.collection_delay != null ? `${r.collection_delay}m` : '—'}</td>
                          <td className="text-mono">{r.latitude != null ? `${r.latitude.toFixed(3)}, ${r.longitude?.toFixed(3)}` : '—'}</td>
                          <td className="text-mono">{r.volume != null ? r.volume : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Lineage and Ingestion Guidelines */}
          <div className="card ds-detail-card">
            <h3 className="heading-section">Data Provenance Architecture</h3>
            <p className="text-small text-secondary" style={{ lineHeight: 'var(--leading-relaxed)' }}>
              WasteSignal follows a strict real-data workflow:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 'var(--space-md) 0' }}>
              {[
                { step: '1. Ingestion', desc: 'Raw records parsed from CSV/JSON streams' },
                { step: '2. Validation', desc: 'Required fields checked (zone_id, timestamp)' },
                { step: '3. Normalization', desc: 'Missing fields labeled as unavailable' },
                { step: '4. Analysis', desc: 'Risk scores derived from recurrence & delay signals' },
                { step: '5. Dashboard', desc: 'All views synchronized to the active dataset' },
              ].map(item => (
                <div key={item.step} style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <span className="text-small" style={{ fontWeight: 600 }}>{item.step}</span>
                  <div className="text-small text-tertiary" style={{ fontSize: '11px', marginTop: '2px' }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)' }}>
              <span className="text-meta">PROVENANCE NOTICE</span>
              <p className="text-small text-secondary" style={{ marginTop: '4px' }}>
                {isDemo
                  ? 'All records in this environment are synthetic and labeled as DEMO. No real municipal telemetry is claimed.'
                  : `Ingested from ${datasetMeta.fileName}. Calculations reflect actual uploaded observations.`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <EmptyState
            title="No operational dataset connected"
            message="WasteSignal intelligence is generated by calculating hotspot risk scores and forward prediction horizons from connected records."
            onUploadClick={() => setShowUploadModal(true)}
            onViewFormatClick={() => setShowFormatModal(true)}
          />
        </div>
      )}

      {/* Amazon Athena Analytical Workbench */}
      <div className="card" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span className="text-meta">SERVERLESS ANALYTICS LAYER</span>
            <h3 className="heading-section" style={{ marginTop: '2px' }}>Amazon Athena Analytics Workbench</h3>
            <p className="text-small text-secondary" style={{ marginTop: '4px' }}>
              Execute live ANSI SQL queries against S3 operational telemetry cataloged via AWS Glue.
            </p>
          </div>
          <div className="btn-group">
            <button
              className={`btn-secondary ${athenaLoading && athenaQueryType === 'hotspot-frequency' ? 'btn-loading' : ''}`}
              onClick={() => runAthenaQuery('hotspot-frequency')}
              disabled={athenaLoading}
            >
              Hotspot Frequency
            </button>
            <button
              className={`btn-secondary ${athenaLoading && athenaQueryType === 'collection-performance' ? 'btn-loading' : ''}`}
              onClick={() => runAthenaQuery('collection-performance')}
              disabled={athenaLoading}
            >
              Collection Performance
            </button>
            <button
              className={`btn-secondary ${athenaLoading && athenaQueryType === 'day-of-week' ? 'btn-loading' : ''}`}
              onClick={() => runAthenaQuery('day-of-week')}
              disabled={athenaLoading}
            >
              Day-of-Week Patterns
            </button>
          </div>
        </div>

        {athenaLoading && (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <span className="text-small">Executing Amazon Athena query in ap-southeast-2 (workgroup: primary)...</span>
          </div>
        )}

        {athenaResults?.error && (
          <div style={{ padding: 'var(--space-md) var(--space-lg)', margin: 'var(--space-md)', background: 'rgba(198, 93, 58, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(198, 93, 58, 0.2)' }}>
            <span className="text-small" style={{ color: 'var(--terracotta)', fontWeight: 500 }}>
              {athenaResults.error}
            </span>
          </div>
        )}

        {athenaResults?.rows && athenaResults.rows.length > 0 && (
          <div style={{ padding: '0 var(--space-lg) var(--space-lg)' }}>
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-meta" style={{ fontSize: '10px' }}>
                QUERY EXECUTION ID: <code className="text-mono">{athenaResults.queryExecutionId}</code>
              </span>
              <span className="text-meta" style={{ fontSize: '10px' }}>
                {athenaResults.rows.length} ROWS RETURNED FROM S3 / GLUE
              </span>
            </div>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <table className="data-table" style={{ fontSize: '11px', margin: 0 }}>
                <thead>
                  <tr>
                    {Object.keys(athenaResults.rows[0]).map(col => (
                      <th key={col}>{col.replace(/_/g, ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {athenaResults.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {Object.values(row).map((val: any, cIdx) => (
                        <td key={cIdx} className="text-mono">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {athenaResults?.rows && athenaResults.rows.length === 0 && (
          <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span className="text-small">Query succeeded with 0 rows. Ingest data to query S3 partitions.</span>
          </div>
        )}
      </div>

      {/* Real AWS Data & AI Infrastructure Status */}
      <AwsStatusCard />


      {/* Upload Modal (CSV / JSON / Demo) */}
      {showUploadModal && (
        <div className="modal-backdrop">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="heading-section">Connect Data Source</h3>
              <button className="btn-ghost" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="btn-group" style={{ marginBottom: 'var(--space-lg)' }}>
                <button
                  className="btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Select File (CSV or JSON)
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  style={{ display: 'none' }}
                  onChange={handleFileSelected}
                />
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setUploadText(SAMPLE_CSV);
                    setUploadFileName('sample_waste_signals.csv');
                    setUploadFormat('csv');
                    processStagedFile(SAMPLE_CSV, 'csv');
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Load Sample CSV
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    loadDemoData();
                    setShowUploadModal(false);
                    setNotification('Loaded controlled synthetic demo dataset.');
                    setTimeout(() => setNotification(null), 3000);
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Use Demo Dataset
                </button>
              </div>

              {/* Paste or Edit text area */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="text-meta">RAW DATA CONTENT ({uploadFormat.toUpperCase()})</label>
                  {uploadFileName && <span className="text-mono text-small">{uploadFileName}</span>}
                </div>
                <textarea
                  className="input text-mono"
                  style={{ height: '140px', fontSize: '11px', lineHeight: 1.4, resize: 'vertical' }}
                  placeholder="Paste CSV or JSON here, or select a file..."
                  value={uploadText}
                  onChange={e => {
                    setUploadText(e.target.value);
                    const format = e.target.value.trim().startsWith('[') || e.target.value.trim().startsWith('{') ? 'json' : 'csv';
                    setUploadFormat(format);
                    processStagedFile(e.target.value, format);
                  }}
                />
              </div>

              {/* Staged file validation preview */}
              {stagedValidation && (
                <div className="staged-preview-box" style={{ marginTop: 'var(--space-md)', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="text-meta">SCHEMA VALIDATION PREVIEW</span>
                    <span className="badge badge-low">{stagedValidation.valid} VALID RECORDS</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div>
                      <span className="text-meta" style={{ fontSize: '10px' }}>TOTAL ROWS</span>
                      <div className="text-mono text-small">{stagedRecords.length}</div>
                    </div>
                    <div>
                      <span className="text-meta" style={{ fontSize: '10px' }}>DETECTED COLUMNS</span>
                      <div className="text-mono text-small">{stagedColumns.length} fields</div>
                    </div>
                    <div>
                      <span className="text-meta" style={{ fontSize: '10px' }}>REJECTED RECORDS</span>
                      <div className="text-mono text-small" style={{ color: stagedValidation.invalid > 0 ? 'var(--terracotta)' : 'inherit' }}>
                        {stagedValidation.invalid}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <span className="text-meta" style={{ fontSize: '10px' }}>DETECTED FIELDS:</span>
                    <div className="text-mono text-small text-tertiary" style={{ fontSize: '11px', marginTop: '2px' }}>
                      {stagedColumns.join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer btn-group">
              <button className="btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button
                className={`btn-primary ${isProcessing ? 'btn-loading' : ''}`}
                onClick={handleConfirmIngestion}
                disabled={isProcessing || stagedRecords.length === 0}
              >
                {!isProcessing && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {isProcessing ? 'Validating & Ingesting...' : `Confirm & Ingest ${stagedRecords.length} Records`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schema / Format Modal */}
      {showFormatModal && (
        <div className="modal-backdrop">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="heading-section">WasteSignal Data Schema</h3>
              <button className="btn-ghost" onClick={() => setShowFormatModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="text-body" style={{ marginBottom: 'var(--space-md)' }}>
                WasteSignal accommodates real municipal data schemas. Not all fields are required; missing fields are clearly labeled as <code>FIELD NOT AVAILABLE</code>.
              </p>
              <table className="data-table" style={{ fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Requirement</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-mono">zone_id</td>
                    <td>String</td>
                    <td><span className="badge badge-high">Required</span></td>
                    <td>Municipal sector/district identifier (e.g. Z-07)</td>
                  </tr>
                  <tr>
                    <td className="text-mono">timestamp</td>
                    <td>ISO Date</td>
                    <td><span className="badge badge-high">Required</span></td>
                    <td>Event or collection date and time</td>
                  </tr>
                  <tr>
                    <td className="text-mono">incident_type</td>
                    <td>String</td>
                    <td>Optional</td>
                    <td>OVERFLOW, CONTAMINATION, MISSED_COLLECTION</td>
                  </tr>
                  <tr>
                    <td className="text-mono">collection_status</td>
                    <td>String</td>
                    <td>Optional</td>
                    <td>COMPLETED, DELAYED, MISSED, SCHEDULED</td>
                  </tr>
                  <tr>
                    <td className="text-mono">collection_delay</td>
                    <td>Number</td>
                    <td>Optional</td>
                    <td>Delay in minutes (for route volatility analysis)</td>
                  </tr>
                  <tr>
                    <td className="text-mono">latitude, longitude</td>
                    <td>Number</td>
                    <td>Optional</td>
                    <td>Geographic coordinates for map projection</td>
                  </tr>
                  <tr>
                    <td className="text-mono">volume</td>
                    <td>Number</td>
                    <td>Optional</td>
                    <td>Waste volume in kg or bin units</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="modal-footer btn-group">
              <button className="btn-secondary" onClick={() => setShowFormatModal(false)}>Close</button>
              <button className="btn-primary" onClick={() => { setShowFormatModal(false); setShowUploadModal(true); }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
