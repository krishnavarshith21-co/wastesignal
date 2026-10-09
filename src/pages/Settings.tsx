import { useState } from 'react';
import { useWasteData } from '../data/DataContext';
import AwsStatusCard from '../components/AwsStatusCard';
import './Settings.css';

export default function Settings() {
  const { dataMode, sourceLabel, rawData, datasetMeta } = useWasteData();

  // Model Weight Parameters (Transparent Scoring)
  const [sensitivity, setSensitivity] = useState(70);
  const [lookbackWindow, setLookbackWindow] = useState('30_DAYS');
  const [recurrenceWeight, setRecurrenceWeight] = useState(40);
  const [fleetDelayWeight, setFleetDelayWeight] = useState(30);
  const [volumeWeight, setVolumeWeight] = useState(30);

  // Operational Rules
  const [autoIntervene, setAutoIntervene] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customWebhook, setCustomWebhook] = useState('');

  // Feedback notice
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  function handleSave() {
    setSaveNotice('Predictive signal weighting and operational rules updated.');
    setTimeout(() => setSaveNotice(null), 3000);
  }

  function handleResetDemo() {
    setSensitivity(70);
    setLookbackWindow('30_DAYS');
    setRecurrenceWeight(40);
    setFleetDelayWeight(30);
    setVolumeWeight(30);
    setAutoIntervene(true);
    setSaveNotice('Signal weights restored to default baseline.');
    setTimeout(() => setSaveNotice(null), 3000);
  }

  return (
    <div className="settings-page animate-fade-in">
      <div className="page-top">
        <div>
          <h1 className="heading-page">Platform Settings & Signal Calibration</h1>
          <p className="text-body" style={{ marginTop: 4 }}>
            Configure signal weighting models, workspace data mode, and dispatch integration hooks
          </p>
        </div>
        <div className="settings-top-actions btn-group">
          <button className="btn-caution" onClick={handleResetDemo}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset Defaults
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Calibration
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="settings-toast animate-slide-up">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{saveNotice}</span>
        </div>
      )}

      <div className="settings-grid">
        {/* Workspace & Dataset Status */}
        <div className="card settings-section-card full-width">
          <div className="card-header">
            <div>
              <span className="text-meta">ACTIVE WORKSPACE</span>
              <h3 className="heading-section" style={{ marginTop: '2px' }}>WasteSignal Prototype Workspace</h3>
            </div>
            <span className={`badge ${dataMode === 'DEMO' ? 'badge-demo' : dataMode === 'LIVE' ? 'badge-low' : 'badge-outline'}`}>
              {sourceLabel}
            </span>
          </div>

          <div className="settings-card-body tenant-grid">
            <div className="tenant-stat">
              <span className="text-meta">DATA MODE</span>
              <span className="tenant-val">{dataMode}</span>
              <span className="text-small text-tertiary">
                {dataMode === 'NONE' ? 'Awaiting dataset connection' : dataMode === 'DEMO' ? 'Synthetic demo environment' : 'Active live dataset'}
              </span>
            </div>
            <div className="tenant-stat">
              <span className="text-meta">CONNECTED DATASET</span>
              <span className="tenant-val text-mono" style={{ fontSize: 'var(--text-md)' }}>
                {datasetMeta?.name || 'No dataset loaded'}
              </span>
              <span className="text-small text-tertiary">
                {rawData.length > 0 ? `${rawData.length} analyzed records` : '0 records in memory'}
              </span>
            </div>
            <div className="tenant-stat">
              <span className="text-meta">DATA VALIDATION</span>
              <span className="tenant-val" style={{ color: 'var(--olive)' }}>Schema Active</span>
              <span className="text-small text-tertiary">Field verification & column detection</span>
            </div>
            <div className="tenant-stat">
              <span className="text-meta">ENVIRONMENT</span>
              <span className="tenant-val">Prototype</span>
              <span className="text-small text-tertiary">Client-side analytical engine</span>
            </div>
          </div>
        </div>

        {/* AWS Infrastructure Live Probing */}
        <div className="full-width" style={{ gridColumn: '1 / -1' }}>
          <AwsStatusCard />
        </div>

        {/* Signal Weight Calibration */}
        <div className="card settings-section-card">
          <div className="card-header">
            <div>
              <span className="text-meta">SCORING METHODOLOGY</span>
              <h3 className="heading-section" style={{ marginTop: '2px' }}>Signal Weight Distribution</h3>
            </div>
            <span className="badge badge-outline">TRANSPARENT WEIGHTING</span>
          </div>

          <div className="settings-card-body">
            <div className="form-group">
              <div className="setting-label-row">
                <label className="text-meta">HOTSPOT SENSITIVITY THRESHOLD</label>
                <span className="text-mono text-small">{sensitivity}% Risk Level</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                value={sensitivity}
                onChange={e => setSensitivity(Number(e.target.value))}
                className="settings-slider"
              />
              <span className="text-small text-tertiary">
                Zones with calculated risk above this threshold trigger preventative queue recommendations.
              </span>
            </div>

            <div className="form-group">
              <label className="text-meta">HISTORICAL RECURRENCE LOOKBACK</label>
              <select
                className="select"
                value={lookbackWindow}
                onChange={e => setLookbackWindow(e.target.value)}
              >
                <option value="7_DAYS">7 Days (Short-term operational volatility)</option>
                <option value="14_DAYS">14 Days (Bi-weekly cycle analysis)</option>
                <option value="30_DAYS">30 Days (Recommended dataset window)</option>
                <option value="90_DAYS">90 Days (Multi-cycle baseline)</option>
              </select>
            </div>

            <div className="setting-weights-block">
              <span className="text-meta">SIGNAL PROPORTIONS (NORMALIZED)</span>
              <div className="weights-grid" style={{ marginTop: '8px' }}>
                <div className="weight-item">
                  <div className="weight-label">
                    <span>Incident Recurrence</span>
                    <span className="text-mono">{recurrenceWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={recurrenceWeight}
                    onChange={e => setRecurrenceWeight(Number(e.target.value))}
                    className="settings-slider"
                  />
                </div>
                <div className="weight-item">
                  <div className="weight-label">
                    <span>Collection Delay Telemetry</span>
                    <span className="text-mono">{fleetDelayWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={fleetDelayWeight}
                    onChange={e => setFleetDelayWeight(Number(e.target.value))}
                    className="settings-slider"
                  />
                </div>
                <div className="weight-item">
                  <div className="weight-label">
                    <span>Waste Volume / Context</span>
                    <span className="text-mono">{volumeWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={volumeWeight}
                    onChange={e => setVolumeWeight(Number(e.target.value))}
                    className="settings-slider"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration and Dispatch */}
        <div className="card settings-section-card">
          <div className="card-header">
            <div>
              <span className="text-meta">DISPATCH INTEGRATION</span>
              <h3 className="heading-section" style={{ marginTop: '2px' }}>Operational Webhook Hook</h3>
            </div>
            <span className="badge badge-outline">NOT CONNECTED</span>
          </div>

          <div className="settings-card-body">
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="text-meta">DISPATCH WEBHOOK ENDPOINT</label>
                <span className="text-meta" style={{ color: 'var(--terracotta)' }}>STATUS: NOT CONNECTED</span>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', marginTop: '4px' }}>
                <span className="text-small text-secondary">
                  Integration endpoint can be configured when a backend service or municipal dispatch system is connected.
                </span>
              </div>
              <div style={{ marginTop: '10px' }}>
                <button className="btn-secondary" onClick={() => setShowConfigModal(true)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Configure Integration
                </button>
              </div>
            </div>

            <div className="toggle-list" style={{ marginTop: 'var(--space-md)' }}>
              <label className="toggle-row">
                <div>
                  <div className="toggle-title">Stage Preventive Interventions</div>
                  <div className="text-small text-tertiary">
                    When calculated risk reaches Critical (80+), automatically stage a preventive action in Operations.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoIntervene}
                  onChange={e => setAutoIntervene(e.target.checked)}
                  className="toggle-checkbox"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Configure Webhook Modal */}
      {showConfigModal && (
        <div className="modal-backdrop">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="heading-section">Configure Dispatch Endpoint</h3>
              <button className="btn-ghost" onClick={() => setShowConfigModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="text-body text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
                Integration endpoints must point to an active municipal dispatch or fleet management service.
              </p>
              <div className="form-group">
                <label className="text-meta">HTTP POST ENDPOINT URL</label>
                <input
                  type="text"
                  className="input text-mono text-small"
                  placeholder="https://your-service.local/api/dispatch"
                  value={customWebhook}
                  onChange={e => setCustomWebhook(e.target.value)}
                />
                <span className="text-small text-tertiary" style={{ marginTop: '4px' }}>
                  No fake or unverified municipal endpoints are preconfigured.
                </span>
              </div>
            </div>
            <div className="modal-footer btn-group">
              <button className="btn-secondary" onClick={() => setShowConfigModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowConfigModal(false);
                  setSaveNotice(customWebhook.trim() ? 'Endpoint saved (Standby mode).' : 'Integration kept in disconnected state.');
                  setTimeout(() => setSaveNotice(null), 3000);
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
