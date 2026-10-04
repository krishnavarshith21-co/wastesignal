import { useState } from 'react';
import EmptyState from '../components/EmptyState';
import { useWasteData } from '../data/DataContext';
import './Intelligence.css';

type InsightFilter = 'ALL' | 'HOTSPOT' | 'COLLECTION' | 'PRIORITY' | 'TREND';

export default function Intelligence() {
  const { dataMode, sourceLabel, insights } = useWasteData();
  const [filter, setFilter] = useState<InsightFilter>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'ALL'
    ? insights
    : insights.filter(i => i.type === filter);

  const isDemo = dataMode === 'DEMO';

  return (
    <div className="intelligence-page animate-fade-in">
      <div className="page-top">
        <div>
          <h1 className="heading-page">Operational Intelligence</h1>
          <p className="text-body" style={{ marginTop: 4 }}>
            System-generated signals and pattern observations derived strictly from connected data
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${isDemo ? 'badge-demo' : dataMode === 'LIVE' ? 'badge-low' : 'badge-outline'}`}>
            {sourceLabel}
          </span>
        </div>
      </div>

      <div className="tabs">
        {(['ALL', 'HOTSPOT', 'COLLECTION', 'PRIORITY', 'TREND'] as InsightFilter[]).map(t => (
          <button key={t} className={`tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'ALL' ? 'All Signals' : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {insights.length === 0 ? (
        <div className="card">
          <EmptyState
            title="INSUFFICIENT DATA FOR INSIGHT"
            message="The connected dataset does not contain sufficient signals to derive operational intelligence. Connect an operational dataset or load demo data."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
          <span className="text-secondary">No insights match the selected filter category ({filter}).</span>
        </div>
      ) : (
        <div className="intelligence-list">
          {filtered.map(insight => {
            const isExpanded = expandedId === insight.id || expandedId === null; // expanded by default or toggleable
            return (
              <div
                key={insight.id}
                className={`intelligence-card ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setExpandedId(expandedId === insight.id ? '' : insight.id)}
              >
                <div className="intel-card-left">
                  <div
                    className="intel-card-severity"
                    style={{
                      background: insight.severity === 'CRITICAL' ? 'var(--terracotta)' : insight.severity === 'HIGH' ? 'var(--priority-high)' : insight.severity === 'MODERATE' ? 'var(--priority-moderate)' : 'var(--priority-low)'
                    }}
                  />
                </div>
                <div className="intel-card-body">
                  <div className="intel-card-header">
                    <div>
                      <h3 className="heading-subsection">{insight.title}</h3>
                      <div className="intel-card-meta" style={{ marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`badge badge-${insight.severity.toLowerCase()}`}>{insight.severity}</span>
                        <span className="text-meta">{insight.type}</span>
                        {insight.zone && <span className="text-mono text-small">{insight.zone}</span>}
                        <span className="text-small text-tertiary">{insight.timeRange}</span>
                      </div>
                    </div>
                    <svg className={`intel-expand-icon ${isExpanded ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>

                  {isExpanded && (
                    <div className="intel-card-expanded animate-slide-up" style={{ marginTop: 'var(--space-md)' }}>
                      <p className="text-body" style={{ lineHeight: 'var(--leading-relaxed)' }}>{insight.description}</p>

                      <div className="intel-provenance-box" style={{ marginTop: 'var(--space-md)', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                          <div>
                            <span className="text-meta" style={{ fontSize: '10px' }}>SOURCE</span>
                            <div className="text-small" style={{ fontWeight: 500, marginTop: '2px' }}>{insight.dataSource}</div>
                          </div>
                          <div>
                            <span className="text-meta" style={{ fontSize: '10px' }}>SIGNALS USED</span>
                            <div className="text-small text-mono" style={{ marginTop: '2px' }}>
                              {insight.signalsUsed.length > 0 ? insight.signalsUsed.join(', ') : 'Direct telemetry'}
                            </div>
                          </div>
                          <div>
                            <span className="text-meta" style={{ fontSize: '10px' }}>TIME RANGE</span>
                            <div className="text-small" style={{ marginTop: '2px' }}>{insight.timeRange}</div>
                          </div>
                        </div>
                      </div>

                      {isDemo && (
                        <div className="intel-card-notice" style={{ marginTop: 'var(--space-sm)' }}>
                          <span className="text-meta">
                            SYNTHETIC DATA — THIS INSIGHT WAS DERIVED FROM THE CONTROLLED DEMO DATASET
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
