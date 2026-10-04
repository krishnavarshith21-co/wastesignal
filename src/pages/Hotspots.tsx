import { useState, useMemo } from 'react';
import HotspotDrawer from '../components/HotspotDrawer';
import EmptyState from '../components/EmptyState';
import { useWasteData } from '../data/DataContext';
import type { Hotspot, Priority, Status } from '../types';
import './Hotspots.css';

export default function Hotspots() {
  const { dataMode, sourceLabel, hotspots } = useWasteData();
  const [selected, setSelected] = useState<Hotspot | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<'risk' | 'zone' | 'priority'>('risk');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let result = [...hotspots];
    if (priorityFilter !== 'ALL') result = result.filter(h => h.priority === priorityFilter);
    if (statusFilter !== 'ALL') result = result.filter(h => h.status === statusFilter);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'risk') cmp = a.risk - b.risk;
      else if (sortField === 'zone') cmp = a.zone.localeCompare(b.zone);
      else {
        const order: Record<Priority, number> = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1 };
        cmp = order[a.priority] - order[b.priority];
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [hotspots, priorityFilter, statusFilter, sortField, sortDir]);

  function handleSort(field: 'risk' | 'zone' | 'priority') {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  function openDrawer(hs: Hotspot) {
    setSelected(hs);
    setDrawerOpen(true);
  }

  const sortArrow = (field: string) => sortField === field ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '';

  return (
    <div className="hotspots-page animate-fade-in">
      <div className="page-top">
        <div>
          <h1 className="heading-page">Hotspots</h1>
          <p className="text-body" style={{ marginTop: 4 }}>
            Systemic waste hotspot zones derived from operational records and delay signals
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${dataMode === 'DEMO' ? 'badge-demo' : dataMode === 'LIVE' ? 'badge-low' : 'badge-outline'}`}>
            {sourceLabel}
          </span>
        </div>
      </div>

      {dataMode === 'NONE' || hotspots.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No hotspot data available"
            message="Connect a dataset or load the demo dataset to analyze and detect recurring waste hotspots."
          />
        </div>
      ) : (
        <>
          <div className="hotspots-filters">
            <select className="select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as Priority | 'ALL')}>
              <option value="ALL">All priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
            <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as Status | 'ALL')}>
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="MONITORING">Monitoring</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <span className="text-meta" style={{ marginLeft: 'auto' }}>
              {filtered.length} OF {hotspots.length} ZONES
            </span>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('zone')} style={{ cursor: 'pointer' }}>Zone{sortArrow('zone')}</th>
                  <th onClick={() => handleSort('priority')} style={{ cursor: 'pointer' }}>Priority{sortArrow('priority')}</th>
                  <th onClick={() => handleSort('risk')} style={{ cursor: 'pointer' }}>Calculated Risk{sortArrow('risk')}</th>
                  <th>Recurrence</th>
                  <th>Last Incident</th>
                  <th>Trend</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(hs => (
                  <tr key={hs.id} onClick={() => openDrawer(hs)}>
                    <td>
                      <div className="hotspot-zone-cell">
                        <span className="text-mono">{hs.zone}</span>
                        <span className="zone-name-sub">{hs.zoneName.split('—')[1]?.trim() || hs.zoneName}</span>
                      </div>
                    </td>
                    <td><span className={`badge badge-${hs.priority.toLowerCase()}`}>{hs.priority}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="text-mono" style={{ fontWeight: 600 }}>{hs.risk}</span>
                        <span className="text-meta" style={{ fontSize: '9px' }}>/100</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-small">
                        {hs.recurrence === 'RECURRING' ? 'Recurring' : hs.recurrence === 'INTERMITTENT' ? 'Intermittent' : 'New'}
                      </span>
                    </td>
                    <td><span className="text-small">{hs.lastIncident}</span></td>
                    <td>
                      <span className={`trend-indicator ${hs.trend.toLowerCase()}`}>
                        {hs.trend === 'UP' ? '↑ Rising' : hs.trend === 'DOWN' ? '↓ Falling' : '→ Stable'}
                      </span>
                    </td>
                    <td><span className="text-small">{hs.status}</span></td>
                    <td>
                      <button
                        className="btn-tertiary btn-sm"
                        onClick={e => { e.stopPropagation(); openDrawer(hs); }}
                      >
                        Inspect signals →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <span className="text-meta">
              RISK SCORES CALCULATED FROM AVAILABLE SIGNALS • NO ARBITRARY MODEL ACCURACY CLAIMS
            </span>
            <span className="text-meta">{sourceLabel}</span>
          </div>
        </>
      )}

      {/* Drawer */}
      <HotspotDrawer
        hotspot={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
