import { useState, useRef, useEffect } from 'react';
import EmptyState from '../components/EmptyState';
import { useWasteData } from '../data/DataContext';
import './Operations.css';

type OpTab = 'collection' | 'incidents' | 'interventions';

export default function Operations() {
  const { dataMode, sourceLabel, collectionActivity, incidents, interventions } = useWasteData();
  const [activeTab, setActiveTab] = useState<OpTab>('collection');
  const [incidentFilter, setIncidentFilter] = useState('ALL');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartW, setChartW] = useState(600);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setChartW(e.contentRect.width);
    });
    if (chartContainerRef.current) obs.observe(chartContainerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!collectionActivity || collectionActivity.scheduled === 0) return;

    const canvas = chartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const H = 200;
    canvas.width = chartW * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, chartW, H);

    const data = [
      { label: 'Scheduled', value: collectionActivity.scheduled, color: '#D8D3C8' },
      { label: 'Completed', value: collectionActivity.completed, color: '#7A8061' },
      { label: 'Delayed', value: collectionActivity.delayed, color: '#D4845A' },
      { label: 'Missed', value: collectionActivity.missed, color: '#C65D3A' },
    ];
    const max = Math.max(1, ...data.map(d => d.value));
    const padL = 80, padR = 40, padT = 16;
    const cW = chartW - padL - padR;
    const barH = 28;
    const gap = 16;

    data.forEach((d, i) => {
      const y = padT + i * (barH + gap);
      const w = (d.value / max) * cW;

      ctx.fillStyle = '#9E9A92';
      ctx.font = `400 11px 'Inter', sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.label, padL - 12, y + barH / 2);

      ctx.fillStyle = '#ECEAE3';
      ctx.beginPath();
      ctx.roundRect(padL, y, cW, barH, 3);
      ctx.fill();

      if (w > 0) {
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.roundRect(padL, y, w, barH, 3);
        ctx.fill();
      }

      ctx.fillStyle = '#1D1D1B';
      ctx.font = `600 12px 'Inter', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(d.value), padL + w + 8, y + barH / 2);
    });
  }, [chartW, collectionActivity]);

  const filteredIncidents = incidentFilter === 'ALL'
    ? incidents
    : incidents.filter(i => i.type === incidentFilter);

  const hasCollection = collectionActivity && collectionActivity.scheduled > 0;
  const isDemo = dataMode === 'DEMO';

  return (
    <div className="operations-page animate-fade-in">
      <div className="page-top">
        <div>
          <h1 className="heading-page">Operations</h1>
          <p className="text-body" style={{ marginTop: 4 }}>
            Collection telemetry, incident logs, and intervention tracking calculated from operational records
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${isDemo ? 'badge-demo' : dataMode === 'LIVE' ? 'badge-low' : 'badge-outline'}`}>
            {sourceLabel}
          </span>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'collection' ? 'active' : ''}`} onClick={() => setActiveTab('collection')}>Collection Activity</button>
        <button className={`tab ${activeTab === 'incidents' ? 'active' : ''}`} onClick={() => setActiveTab('incidents')}>Incidents ({incidents.length})</button>
        <button className={`tab ${activeTab === 'interventions' ? 'active' : ''}`} onClick={() => setActiveTab('interventions')}>Interventions ({interventions.length})</button>
      </div>

      {activeTab === 'collection' && (
        <div className="operations-content animate-fade-in">
          {!hasCollection ? (
            <div className="card">
              <EmptyState
                title="NO COLLECTION DATA"
                message="No collection activity records are available in the connected dataset. Records with collection_status (COMPLETED, DELAYED, MISSED, SCHEDULED) are required."
              />
            </div>
          ) : (
            <>
              <div className="operations-summary-grid">
                {[
                  { label: 'Scheduled', value: collectionActivity.scheduled, sub: 'Total collection events' },
                  { label: 'Completed', value: collectionActivity.completed, sub: `${collectionActivity.completionRate ?? 0}% completion rate` },
                  { label: 'Delayed', value: collectionActivity.delayed, sub: `Avg delay: ${Math.round(collectionActivity.delayAvg ?? 0)}m` },
                  { label: 'Missed', value: collectionActivity.missed, sub: 'Unfulfilled routes' },
                ].map((item, i) => (
                  <div key={i} className="card op-metric-card">
                    <span className="text-meta">{item.label}</span>
                    <span className="op-metric-val">{item.value}</span>
                    <span className="text-meta" style={{ marginTop: 2 }}>{item.sub}</span>
                  </div>
                ))}
              </div>

              <div className="card" ref={chartContainerRef}>
                <div className="card-header">
                  <div>
                    <h3 className="heading-section">Collection Performance Breakdown</h3>
                    <span className="text-meta" style={{ marginTop: 2 }}>DERIVED FROM OPERATIONAL STATUS RECORDS</span>
                  </div>
                  <span className="text-meta">{collectionActivity.scheduled} TOTAL RECORDS</span>
                </div>
                <canvas ref={chartRef} style={{ width: chartW, height: 200 }} />
                <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)' }}>
                  <span className="text-meta">
                    DATA SOURCE: {sourceLabel} • ALL COUNTS CALCULATED FROM INGESTED LOGS
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="operations-content animate-fade-in">
          {incidents.length === 0 ? (
            <div className="card">
              <EmptyState
                title="No incidents recorded"
                message="No incident records (OVERFLOW, CONTAMINATION, MISSED_COLLECTION, ILLEGAL_DUMPING) were found in the connected dataset."
              />
            </div>
          ) : (
            <>
              <div className="incidents-filters" style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <select className="select" value={incidentFilter} onChange={e => setIncidentFilter(e.target.value)}>
                  <option value="ALL">All incident types</option>
                  <option value="OVERFLOW">Overflow</option>
                  <option value="CONTAMINATION">Contamination</option>
                  <option value="MISSED_COLLECTION">Missed Collection</option>
                  <option value="ILLEGAL_DUMPING">Illegal Dumping</option>
                </select>
                <span className="text-meta" style={{ marginLeft: 'auto' }}>
                  {filteredIncidents.length} OF {incidents.length} INCIDENTS
                </span>
              </div>

              <div className="card" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Zone</th>
                      <th>Type</th>
                      <th>Reported</th>
                      <th>Status</th>
                      <th>Delay Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.map(inc => (
                      <tr key={inc.id}>
                        <td><span className="text-mono">{inc.zone}</span></td>
                        <td>{inc.type.replace(/_/g, ' ')}</td>
                        <td><span className="text-small">{inc.timestamp}</span></td>
                        <td>
                          <span className={`badge ${inc.status === 'RESOLVED' ? 'badge-low' : 'badge-high'}`}>
                            {inc.status}
                          </span>
                        </td>
                        <td>
                          <span className="text-mono text-small">
                            {inc.delayImpact != null && inc.delayImpact > 0 ? `+${inc.delayImpact}m delay` : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'interventions' && (
        <div className="operations-content animate-fade-in">
          {interventions.length === 0 ? (
            <div className="card">
              <EmptyState
                title="No active interventions"
                message="No preventive interventions staged. Interventions are derived when hotspot risk levels warrant proactive route adjustments."
              />
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Zone</th>
                    <th>Intervention Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {interventions.map(int => (
                    <tr key={int.id}>
                      <td><span className="text-mono">{int.id}</span></td>
                      <td><span className="text-mono">{int.zone}</span></td>
                      <td>{int.type.replace(/_/g, ' ')}</td>
                      <td><span className={`badge badge-${(int.priority || 'MODERATE').toLowerCase()}`}>{int.priority || 'STANDARD'}</span></td>
                      <td><span className="text-small">{int.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
