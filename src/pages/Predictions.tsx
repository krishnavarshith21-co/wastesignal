import { useState, useRef, useEffect } from 'react';
import HotspotDrawer from '../components/HotspotDrawer';
import EmptyState from '../components/EmptyState';
import { useWasteData } from '../data/DataContext';
import type { Hotspot, Prediction } from '../types';
import './Predictions.css';

export default function Predictions() {
  const { dataMode, sourceLabel, predictions, hotspots } = useWasteData();
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [drawerHotspot, setDrawerHotspot] = useState<Hotspot | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartDims, setChartDims] = useState({ w: 700, h: 280 });

  // Update selected prediction when predictions change
  useEffect(() => {
    if (predictions.length > 0 && !selectedPrediction) {
      setSelectedPrediction(predictions[0]);
    } else if (predictions.length === 0) {
      setSelectedPrediction(null);
    }
  }, [predictions, selectedPrediction]);

  // Resize observer
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        setChartDims({ w: entry.contentRect.width, h: 280 });
      }
    });
    if (chartContainerRef.current) obs.observe(chartContainerRef.current);
    return () => obs.disconnect();
  }, []);

  // Canvas drawing
  useEffect(() => {
    if (predictions.length === 0) return;

    const canvas = chartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = chartDims.w * dpr;
    canvas.height = chartDims.h * dpr;
    ctx.scale(dpr, dpr);

    const W = chartDims.w;
    const H = chartDims.h;
    const padL = 48, padR = 24, padT = 24, padB = 40;
    const cW = W - padL - padR;
    const cH = H - padT - padB;

    ctx.clearRect(0, 0, W, H);

    // Y axis labels & grid lines
    ctx.fillStyle = '#9E9A92';
    ctx.font = `400 10px 'Inter', sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const val = i * 25;
      const y = padT + cH - (val / 100) * cH;
      ctx.fillText(String(val), padL - 8, y);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + cW, y);
      ctx.strokeStyle = '#E2DFD7';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Days (1 to 7)
    const days = ['Day +1', 'Day +2', 'Day +3', 'Day +4', 'Day +5', 'Day +6', 'Day +7'];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    days.forEach((d, i) => {
      const x = padL + (i + 0.5) * (cW / 7);
      ctx.fillStyle = '#9E9A92';
      ctx.font = `500 11px 'Inter', sans-serif`;
      ctx.fillText(d, x, H - padB + 12);
    });

    // Bar groups by day
    const dayPredictions: Prediction[][] = [1, 2, 3, 4, 5, 6, 7].map(dayNum =>
      predictions.filter(p => p.day === dayNum)
    );

    const barWidth = Math.min(24, Math.max(8, cW / 7 / 4));

    dayPredictions.forEach((preds, dayIdx) => {
      const groupX = padL + (dayIdx + 0.5) * (cW / 7);
      const totalBars = Math.max(1, preds.length);
      const groupWidth = totalBars * (barWidth + 4) - 4;
      const startX = groupX - groupWidth / 2;

      preds.forEach((pred, barIdx) => {
        const x = startX + barIdx * (barWidth + 4);
        const barH = (pred.predictedRisk / 100) * cH;
        const y = padT + cH - barH;

        const color = pred.priority === 'CRITICAL' ? '#C65D3A' : pred.priority === 'HIGH' ? '#D4845A' : pred.priority === 'MODERATE' ? '#B8A88A' : '#7A8061';

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [2, 2, 0, 0]);
        ctx.fill();

        // Zone label on top
        ctx.fillStyle = '#68655E';
        ctx.font = `400 9px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(pred.zone, x + barWidth / 2, y - 4);
      });
    });
  }, [chartDims, predictions]);

  function openHotspotForPrediction(pred: Prediction) {
    const hs = hotspots.find(h => h.id === pred.hotspotId || h.zone === pred.zone);
    if (hs) {
      setDrawerHotspot(hs);
      setDrawerOpen(true);
    }
  }

  const isDemo = dataMode === 'DEMO';
  const hasPredictions = predictions.length > 0;

  return (
    <div className="predictions-page animate-fade-in">
      <div className="page-top">
        <div>
          <h1 className="heading-page">Forward Predictions</h1>
          <p className="text-body" style={{ marginTop: 4 }}>
            Forward 7-day predictive window generated from operational recurrence patterns
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDemo && <span className="badge badge-demo">SYNTHETIC DEMONSTRATION MODEL</span>}
          {dataMode === 'LIVE' && <span className="badge badge-low">HISTORICAL PROJECTION</span>}
          {dataMode === 'NONE' && <span className="badge badge-outline">NO DATA</span>}
        </div>
      </div>

      {isDemo && (
        <div className="card" style={{ padding: 'var(--space-md) var(--space-xl)', background: 'var(--bg-elevated)', borderLeft: '3px solid var(--terracotta)' }}>
          <span className="text-meta" style={{ color: 'var(--text-secondary)' }}>
            DEMONSTRATION MODEL — Projections shown below are generated from the synthetic baseline dataset solely to demonstrate the forward prediction workflow. They are not validated municipal forecasts.
          </span>
        </div>
      )}

      {!hasPredictions ? (
        <div className="card">
          <EmptyState
            title="PREDICTION UNAVAILABLE"
            message="Additional historical observations are required before generating a meaningful prediction. Connect an operational dataset with recurring incident logs to enable forward projections."
          />
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="card" ref={chartContainerRef}>
            <div className="card-header">
              <div>
                <h3 className="heading-section">Predicted Risk Horizon</h3>
                <span className="text-meta" style={{ marginTop: 2 }}>FORWARD 7-DAY WINDOW BY ZONE</span>
              </div>
              <span className="text-meta">{predictions.length} PREDICTED EVENTS</span>
            </div>
            <canvas ref={chartRef} style={{ width: chartDims.w, height: chartDims.h }} />
            <div className="predictions-chart-legend">
              <div className="legend-item"><span className="legend-dot" style={{ background: '#C65D3A' }} />Critical (80+)</div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#D4845A' }} />High (60-79)</div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#B8A88A' }} />Moderate (40-59)</div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#7A8061' }} />Low (&lt;40)</div>
            </div>
          </div>

          {/* Predictions Grid */}
          <div className="predictions-grid">
            {/* List */}
            <div className="predictions-list">
              <span className="text-meta" style={{ marginBottom: 4 }}>PREDICTED INCIDENT WINDOWS</span>
              {predictions.map(pred => (
                <div
                  key={pred.id}
                  className={`prediction-card ${selectedPrediction?.id === pred.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPrediction(pred)}
                >
                  <div className="prediction-card-top">
                    <div className="prediction-card-zone">
                      <span className="text-mono" style={{ fontWeight: 600 }}>{pred.zone}</span>
                      <span className="prediction-day">{pred.dayLabel}</span>
                    </div>
                    <span className={`badge badge-${pred.priority.toLowerCase()}`}>{pred.priority}</span>
                  </div>
                  <div className="prediction-card-metrics">
                    <div className="prediction-metric">
                      <span className="text-meta">PREDICTED RISK</span>
                      <span className="prediction-risk-val">{pred.predictedRisk}</span>
                    </div>
                    <div className="prediction-metric">
                      <span className="text-meta">RECURRENCE LIKELIHOOD</span>
                      <span className="prediction-recurrence">{pred.recurrenceLikelihood}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Explanation / Detail Pane */}
            {selectedPrediction && (
              <div className="card prediction-explain">
                <div className="card-header">
                  <div>
                    <span className="text-meta">PREDICTION DETAILS</span>
                    <h3 className="heading-section" style={{ marginTop: 2 }}>
                      {selectedPrediction.zone} — {selectedPrediction.dayLabel}
                    </h3>
                  </div>
                  <span className={`badge badge-${selectedPrediction.priority.toLowerCase()}`}>
                    {selectedPrediction.priority}
                  </span>
                </div>

                <div className="explain-signals">
                  <div className="explain-signal">
                    <span className="text-meta">DERIVATION SIGNALS USED</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {selectedPrediction.signals.map((sig, i) => (
                        <div key={i} className="signal-row" style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="text-small" style={{ fontWeight: 500 }}>{sig.label}</span>
                            <span className={`badge badge-meta ${sig.strength.toLowerCase()}`}>{sig.strength}</span>
                          </div>
                          <p className="text-small text-secondary" style={{ marginTop: '4px', fontSize: '11px' }}>{sig.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="explain-signal">
                    <span className="text-meta">RECOMMENDED PREVENTIVE ACTION</span>
                    <p className="text-body" style={{ marginTop: 4, padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }}>
                      {selectedPrediction.recommendedIntervention}
                    </p>
                  </div>

                  <div className="explain-signal" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-meta">DATA LINEAGE: {sourceLabel}</span>
                      <button className="btn-secondary" onClick={() => openHotspotForPrediction(selectedPrediction)}>
                        View Hotspot Zone →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Drawer */}
      <HotspotDrawer
        hotspot={drawerHotspot}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
