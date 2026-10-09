import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import KPIStrip from '../components/KPIStrip';
import MapVisualization from '../components/MapVisualization';
import HotspotDrawer from '../components/HotspotDrawer';
import { OnboardingHero } from '../components/EmptyState';
import { useWasteData } from '../data/DataContext';
import type { Hotspot } from '../types';
import './Overview.css';

export default function Overview() {
  const location = useLocation();
  const { dataMode, sourceLabel, hotspots, predictions, interventions, insights, loadDemoData } = useWasteData();
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (location.search.includes('demo=judge') && dataMode === 'NONE') {
      loadDemoData();
    }
  }, [location.search, dataMode, loadDemoData]);

  // Derived metrics from actual data
  const hasData = dataMode !== 'NONE';
  const activeHotspots = hasData ? hotspots.filter(h => h.status !== 'RESOLVED').length : null;
  const highPriority = hasData ? hotspots.filter(h => h.priority === 'HIGH' || h.priority === 'CRITICAL').length : null;
  const predictedNext7Days = hasData ? predictions.length : null;
  const openInterventions = hasData ? interventions.filter(i => i.status === 'PENDING').length : null;
  const resolved = hasData ? hotspots.filter(h => h.status === 'RESOLVED').length : null;

  function handleHotspotClick(hs: Hotspot) {
    setSelectedHotspot(hs);
    setDrawerOpen(true);
  }

  return (
    <div className="overview-page animate-fade-in">
      {/* Hero */}
      <div className="overview-hero">
        <div className="overview-hero-content">
          <h1 className="heading-editorial">Waste intelligence, before the cleanup.</h1>
          <p className="text-body overview-hero-desc">
            WasteSignal analyzes operational and contextual signals to identify recurring waste hotspots and prioritize preventive action.
          </p>
        </div>
        <div className="overview-system-status">
          <div className="system-status-card">
            <span className="text-meta">SYSTEM STATUS</span>
            <div className="system-status-row">
              <span className={`status-dot ${hasData ? 'active' : 'inactive'}`} />
              <span className="system-status-label" style={{ color: hasData ? 'var(--olive)' : 'var(--text-tertiary)' }}>
                {dataMode === 'NONE' ? 'NO DATA CONNECTED' : dataMode === 'DEMO' ? 'ANALYSIS READY' : 'LIVE ANALYSIS'}
              </span>
            </div>
            <span className="text-meta" style={{ marginTop: 4 }}>
              {dataMode === 'NONE' ? 'NO DATASET LOADED' : dataMode === 'DEMO' ? 'DEMO ENVIRONMENT (SYNTHETIC)' : 'LIVE DATASET CONNECTED'}
            </span>
          </div>
        </div>
      </div>

      {/* Onboarding Hero when NO DATA is connected */}
      {dataMode === 'NONE' && (
        <OnboardingHero />
      )}

      {/* Dynamic KPI Strip */}
      <div className="overview-section">
        <KPIStrip
          sourceLabel={sourceLabel}
          items={[
            { label: 'ACTIVE HOTSPOTS', value: activeHotspots },
            { label: 'HIGH PRIORITY', value: highPriority, accent: 'terracotta' },
            { label: 'PREDICTED NEXT 7 DAYS', value: predictedNext7Days },
            { label: 'OPEN INTERVENTIONS', value: openInterventions },
            { label: 'RESOLVED', value: resolved, accent: 'olive' },
          ]}
        />
      </div>

      {/* Map */}
      <div className="overview-section">
        <MapVisualization
          hotspots={hotspots}
          onHotspotClick={handleHotspotClick}
          selectedId={selectedHotspot?.id}
        />
      </div>

      {/* Bottom grid: Active Hotspots + Intelligence */}
      <div className="overview-bottom-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="heading-section">Active hotspots</h3>
            <span className="text-meta">
              {hasData ? `${activeHotspots} ZONES` : 'NO DATA'}
            </span>
          </div>
          {hotspots.filter(h => h.status !== 'RESOLVED').length > 0 ? (
            <div className="overview-hotspot-list">
              {hotspots.filter(h => h.status !== 'RESOLVED').slice(0, 5).map(hs => (
                <div key={hs.id} className="overview-hotspot-row" onClick={() => handleHotspotClick(hs)}>
                  <div className="overview-hotspot-info">
                    <span className="overview-hotspot-zone">{hs.zone}</span>
                    <span className="overview-hotspot-name">{hs.zoneName.split('—')[1]?.trim() || hs.zoneName}</span>
                  </div>
                  <div className="overview-hotspot-meta">
                    <span className={`badge badge-${hs.priority.toLowerCase()}`}>{hs.priority}</span>
                    <span className="overview-hotspot-risk">{hs.risk}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overview-empty-box">
              <span className="text-secondary text-small">
                {dataMode === 'NONE'
                  ? 'No dataset connected. Connect a data source to detect active hotspots.'
                  : 'No active hotspots detected in current dataset.'}
              </span>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="heading-section">Latest intelligence</h3>
            <span className={`badge ${dataMode === 'DEMO' ? 'badge-demo' : dataMode === 'LIVE' ? 'badge-low' : 'badge-outline'}`}>
              {sourceLabel}
            </span>
          </div>
          {insights.length > 0 ? (
            <div className="overview-intel-list">
              {insights.slice(0, 4).map(insight => (
                <div key={insight.id} className="overview-intel-item">
                  <div
                    className="intel-severity-line"
                    style={{
                      background: insight.severity === 'CRITICAL' ? 'var(--terracotta)' : insight.severity === 'HIGH' ? 'var(--priority-high)' : insight.severity === 'MODERATE' ? 'var(--priority-moderate)' : 'var(--priority-low)'
                    }}
                  />
                  <div className="intel-content">
                    <div className="intel-header-row">
                      <span className="intel-title">{insight.title}</span>
                      <span className="text-meta" style={{ fontSize: '10px' }}>{insight.timeRange}</span>
                    </div>
                    <p className="intel-desc">{insight.description.slice(0, 140)}…</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overview-empty-box">
              <span className="text-secondary text-small">
                {dataMode === 'NONE'
                  ? 'No operational data connected. Load demo data or connect a data source to view derived intelligence.'
                  : 'Insufficient data signals to derive intelligence.'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hotspot Drawer */}
      <HotspotDrawer
        hotspot={selectedHotspot}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
