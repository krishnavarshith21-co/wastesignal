import { useWasteData } from '../data/DataContext';
import type { Hotspot } from '../types';
import './HotspotDrawer.css';

interface HotspotDrawerProps {
  hotspot: Hotspot | null;
  open: boolean;
  onClose: () => void;
}

function priorityClass(p: string) {
  return `badge badge-${p.toLowerCase()}`;
}

function signalStrengthBar(strength: string) {
  const w = strength === 'HIGH' ? '85%' : strength === 'MODERATE' ? '55%' : '30%';
  const c = strength === 'HIGH' ? 'var(--terracotta)' : strength === 'MODERATE' ? 'var(--priority-high)' : 'var(--priority-low)';
  return (
    <div className="signal-bar-track">
      <div className="signal-bar-fill" style={{ width: w, background: c }} />
    </div>
  );
}

export default function HotspotDrawer({ hotspot, open, onClose }: HotspotDrawerProps) {
  const { sourceLabel, dataMode, datasetMeta } = useWasteData();

  if (!hotspot) return null;

  return (
    <>
      <div className={`drawer-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-header">
          <div>
            <span className="text-meta">{hotspot.id}</span>
            <h2 className="heading-section" style={{ marginTop: 4 }}>{hotspot.zoneName}</h2>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={priorityClass(hotspot.priority)}>{hotspot.priority} PRIORITY</span>
              <span className={`badge badge-${hotspot.status.toLowerCase()}`}>{hotspot.status}</span>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="drawer-body">
          {/* Risk Score */}
          <div className="drawer-section">
            <span className="text-meta">Risk Score</span>
            <div className="drawer-risk-display">
              <span className="risk-number">{hotspot.risk}</span>
              <span className="risk-total">/ 100</span>
            </div>
            <div className="risk-bar-track">
              <div
                className="risk-bar-fill"
                style={{
                  width: `${hotspot.risk}%`,
                  background: hotspot.risk >= 80 ? 'var(--terracotta)' : hotspot.risk >= 60 ? 'var(--priority-high)' : hotspot.risk >= 40 ? 'var(--priority-moderate)' : 'var(--priority-low)',
                }}
              />
            </div>
            <span className="text-meta" style={{ marginTop: 6 }}>CALCULATED FROM AVAILABLE SIGNALS</span>
          </div>

          <hr className="divider" />

          {/* Key Metrics */}
          <div className="drawer-section">
            <div className="drawer-metrics">
              <div className="drawer-metric">
                <span className="text-meta">Predicted Recurrence</span>
                <span className="metric-value">{hotspot.recurrence === 'RECURRING' ? 'HIGH' : hotspot.recurrence === 'INTERMITTENT' ? 'MODERATE' : 'LOW'}</span>
              </div>
              <div className="drawer-metric">
                <span className="text-meta">Last Incident</span>
                <span className="metric-value">{hotspot.lastIncident}</span>
              </div>
              <div className="drawer-metric">
                <span className="text-meta">Trend</span>
                <span className="metric-value">
                  {hotspot.trend === 'UP' ? '↑ Increasing' : hotspot.trend === 'DOWN' ? '↓ Decreasing' : '→ Stable'}
                </span>
              </div>
              <div className="drawer-metric">
                <span className="text-meta">Coordinates</span>
                <span className="metric-value">
                  {hotspot.lat != null && hotspot.lng != null
                    ? `${hotspot.lat.toFixed(4)}, ${hotspot.lng.toFixed(4)}`
                    : 'Not available'}
                </span>
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* Available Signals */}
          <div className="drawer-section">
            <h3 className="heading-subsection">Available signals</h3>
            <div className="drawer-signals">
              {hotspot.signals.map((signal, i) => (
                <div key={i} className="signal-item">
                  <div className="signal-header">
                    <span className="signal-label">{signal.label}</span>
                    <span className="text-meta">{signal.available ? signal.strength : 'NOT AVAILABLE'}</span>
                  </div>
                  <p className="signal-desc">{signal.description}</p>
                  {signal.available && signalStrengthBar(signal.strength)}
                </div>
              ))}
            </div>
          </div>

          <hr className="divider" />

          {/* Recommended Action */}
          <div className="drawer-section">
            <h3 className="heading-subsection">Recommended action</h3>
            <p className="text-body" style={{ marginTop: 8 }}>{hotspot.recommendedAction}</p>
          </div>

          <hr className="divider" />

          {/* Incident History */}
          <div className="drawer-section">
            <h3 className="heading-subsection">Incident history</h3>
            {hotspot.incidentHistory.length > 0 ? (
              <div className="drawer-history">
                {hotspot.incidentHistory.map((inc, i) => (
                  <div key={i} className="history-item">
                    <div className="history-dot-line">
                      <span className={`history-dot ${inc.resolved ? 'resolved' : 'active'}`} />
                      {i < hotspot.incidentHistory.length - 1 && <span className="history-line" />}
                    </div>
                    <div className="history-content">
                      <div className="history-header">
                        <span className="history-type">{inc.type}</span>
                        <span className={priorityClass(inc.severity)}>{inc.severity}</span>
                      </div>
                      <span className="history-date">{inc.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-small" style={{ marginTop: 8 }}>No incidents recorded in the current dataset.</p>
            )}
          </div>

          {/* Data Lineage */}
          <div className="drawer-section drawer-lineage">
            <h3 className="heading-subsection">Data lineage</h3>
            <div className="lineage-grid">
              <div className="lineage-item">
                <span className="text-meta">DATASET</span>
                <span className="text-small">{datasetMeta?.fileName || 'N/A'}</span>
              </div>
              <div className="lineage-item">
                <span className="text-meta">SIGNALS USED</span>
                <span className="text-small">{hotspot.signalsUsed.join(', ') || 'N/A'}</span>
              </div>
              <div className="lineage-item">
                <span className="text-meta">RECORDS ANALYZED</span>
                <span className="text-small">{datasetMeta?.totalRecords || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="drawer-section drawer-demo-notice">
            <span className="text-meta">
              {dataMode === 'DEMO'
                ? 'GENERATED FROM SYNTHETIC DEMO DATA'
                : `SOURCE: ${sourceLabel}`}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
