import { useState, useEffect } from 'react';
import { useWasteData } from '../data/DataContext';
import type { Hotspot, BedrockExplanationResponse } from '../types';
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
  const { sourceLabel, dataMode, datasetMeta, explainHotspot } = useWasteData();
  const [explanation, setExplanation] = useState<BedrockExplanationResponse | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  // Automatically fetch explanation when a hotspot is selected
  useEffect(() => {
    if (!hotspot || !open) {
      setExplanation(null);
      setExplainError(null);
      return;
    }

    let isCurrent = true;
    setIsExplaining(true);
    setExplainError(null);

    explainHotspot(hotspot.id, hotspot.zone)
      .then(res => {
        if (isCurrent) setExplanation(res);
      })
      .catch(err => {
        if (isCurrent) setExplainError(err.message);
      })
      .finally(() => {
        if (isCurrent) setIsExplaining(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [hotspot, open, explainHotspot]);

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
            <span className="text-meta" style={{ marginTop: 6 }}>DETERMINISTIC MULTI-SIGNAL SCORING MODEL</span>
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

          {/* Bedrock Grounded Explanation Section */}
          <div className="drawer-section" style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="text-meta" style={{ fontWeight: 600 }}>OPERATIONAL INTELLIGENCE & EXPLANATION</span>
              {explanation?.aiProvider === 'BEDROCK' || explanation?.aiProvider === 'AMAZON_BEDROCK' ? (
                <span className="badge-connected" style={{ fontSize: '9px' }}>AMAZON BEDROCK</span>
              ) : (
                <span className="badge-ready" style={{ fontSize: '9px' }}>RULE-BASED EXPLANATION</span>
              )}
            </div>

            {isExplaining && (
              <div style={{ padding: '12px 0', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                Querying AWS explanation engine...
              </div>
            )}

            {explainError && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--terracotta)', marginBottom: '8px' }}>
                {explainError}
              </div>
            )}

            {explanation && !isExplaining && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1. WHY IS THIS A HOTSPOT? */}
                <div>
                  <span className="text-meta" style={{ fontSize: '10px', color: 'var(--terracotta)' }}>WHY IS THIS A HOTSPOT?</span>
                  <p className="text-body" style={{ marginTop: '4px', fontSize: 'var(--text-sm)', lineHeight: '1.5' }}>
                    {explanation.whyPrioritized}
                  </p>
                </div>

                {/* 2. WHAT SIGNALS CONTRIBUTED? */}
                {explanation.contributingSignalsSummary.length > 0 && (
                  <div>
                    <span className="text-meta" style={{ fontSize: '10px' }}>WHAT SIGNALS CONTRIBUTED?</span>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      {explanation.contributingSignalsSummary.map((sig, idx) => (
                        <li key={idx} style={{ marginBottom: '3px' }}>{sig}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3. WHAT SHOULD THE OPERATOR DO? */}
                <div>
                  <span className="text-meta" style={{ fontSize: '10px', color: 'var(--olive)' }}>WHAT SHOULD THE OPERATOR DO?</span>
                  <p className="text-body" style={{ marginTop: '4px', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    {explanation.recommendedAction}
                  </p>
                </div>

                {/* Preventive Checklist */}
                {explanation.preventiveChecklist.length > 0 && (
                  <div>
                    <span className="text-meta" style={{ fontSize: '10px' }}>PREVENTIVE ACTION CHECKLIST</span>
                    <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {explanation.preventiveChecklist.map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--olive)', fontWeight: 'bold' }}>✓</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Uncertainty & Caveats */}
                {explanation.uncertaintyOrMissingInfo && (
                  <div>
                    <span className="text-meta" style={{ fontSize: '10px', color: 'var(--accent-terra)' }}>OBSERVATION UNCERTAINTY & CAVEATS</span>
                    <p className="text-body" style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {explanation.uncertaintyOrMissingInfo}
                    </p>
                  </div>
                )}

                {/* Provider Note */}
                <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', fontSize: '10px', color: 'var(--text-tertiary)' }}>
                  {explanation.aiProvider === 'BEDROCK' || explanation.aiProvider === 'AMAZON_BEDROCK'
                    ? `Generated by Amazon Bedrock (${explanation.modelId || 'Foundation Model'}) strictly grounded in structured telemetry.`
                    : `${explanation.fallbackReason || 'AI explanation unavailable. Showing rule-based explanation.'}`}
                </div>
              </div>
            )}
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
