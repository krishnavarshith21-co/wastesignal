import { useEffect, useRef, useState, useMemo } from 'react';
import { useWasteData } from '../data/DataContext';
import type { Hotspot } from '../types';
import './MapVisualization.css';

interface MapProps {
  hotspots: Hotspot[];
  onHotspotClick: (hotspot: Hotspot) => void;
  selectedId?: string;
}

export default function MapVisualization({ hotspots, onHotspotClick, selectedId }: MapProps) {
  const { dataMode, hasMapCoordinates } = useWasteData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 500 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const animFrame = useRef(0);

  // Resize observer
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ w: width, h: Math.max(340, Math.min(500, width * 0.55)) });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Filter hotspots that have coordinates
  const hotspotsWithCoords = useMemo(() => {
    return hotspots.filter(h => h.lat != null && h.lng != null);
  }, [hotspots]);

  // Compute bounding box for projection
  const bounds = useMemo(() => {
    if (hotspotsWithCoords.length === 0) return null;
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    hotspotsWithCoords.forEach(h => {
      if (h.lat! < minLat) minLat = h.lat!;
      if (h.lat! > maxLat) maxLat = h.lat!;
      if (h.lng! < minLng) minLng = h.lng!;
      if (h.lng! > maxLng) maxLng = h.lng!;
    });
    return { minLat, maxLat, minLng, maxLng };
  }, [hotspotsWithCoords]);

  // Coordinate projector
  const project = (lat?: number, lng?: number): { x: number; y: number } | null => {
    if (lat == null || lng == null) return null;
    // If coords are already normalized 0..1
    if (lat >= 0 && lat <= 1 && lng >= 0 && lng <= 1) {
      return { x: lng * dimensions.w, y: lat * dimensions.h };
    }
    if (!bounds) return null;
    const pad = 0.15;
    const latSpan = bounds.maxLat - bounds.minLat || 0.01;
    const lngSpan = bounds.maxLng - bounds.minLng || 0.01;

    const normX = pad + ((lng - bounds.minLng) / lngSpan) * (1 - 2 * pad);
    // Invert latitude so North is up
    const normY = pad + ((bounds.maxLat - lat) / latSpan) * (1 - 2 * pad);

    return { x: normX * dimensions.w, y: normY * dimensions.h };
  };

  useEffect(() => {
    if (dataMode === 'NONE' || hotspotsWithCoords.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.w * dpr;
    canvas.height = dimensions.h * dpr;
    ctx.scale(dpr, dpr);

    let tick = 0;

    function draw() {
      if (!ctx) return;
      tick++;
      ctx.clearRect(0, 0, dimensions.w, dimensions.h);

      // Background
      ctx.fillStyle = '#ECEAE3';
      ctx.fillRect(0, 0, dimensions.w, dimensions.h);

      // Grid lines
      ctx.strokeStyle = '#DDD9CF';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = 0; x < dimensions.w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.h);
        ctx.stroke();
      }
      for (let y = 0; y < dimensions.h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.w, y);
        ctx.stroke();
      }

      // If demo data, draw representative district boundaries
      if (dataMode === 'DEMO') {
        const zones = [
          { points: [[0.05, 0.05], [0.35, 0.05], [0.32, 0.35], [0.08, 0.32]], label: 'Z-02' },
          { points: [[0.35, 0.05], [0.65, 0.08], [0.62, 0.38], [0.32, 0.35]], label: 'Z-07' },
          { points: [[0.65, 0.08], [0.95, 0.05], [0.92, 0.42], [0.62, 0.38]], label: 'Z-15' },
          { points: [[0.08, 0.32], [0.32, 0.35], [0.28, 0.62], [0.05, 0.58]], label: 'Z-14' },
          { points: [[0.32, 0.35], [0.62, 0.38], [0.58, 0.62], [0.28, 0.62]], label: 'Z-04' },
          { points: [[0.62, 0.38], [0.92, 0.42], [0.88, 0.65], [0.58, 0.62]], label: 'Z-12' },
          { points: [[0.05, 0.58], [0.28, 0.62], [0.25, 0.88], [0.08, 0.92]], label: 'Z-03' },
          { points: [[0.28, 0.62], [0.58, 0.62], [0.55, 0.88], [0.25, 0.88]], label: 'Z-09' },
          { points: [[0.58, 0.62], [0.88, 0.65], [0.85, 0.92], [0.55, 0.88]], label: 'Z-11' },
          { points: [[0.42, 0.42], [0.55, 0.42], [0.53, 0.55], [0.40, 0.55]], label: 'Z-06' },
        ];

        zones.forEach(zone => {
          const pts = zone.points.map(([px, py]) => [px * dimensions.w, py * dimensions.h] as [number, number]);
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
          ctx.closePath();
          ctx.fillStyle = '#E8E5DC';
          ctx.fill();
          ctx.strokeStyle = '#C8C3B8';
          ctx.lineWidth = 1;
          ctx.stroke();

          const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
          const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
          ctx.fillStyle = '#B0AB9F';
          ctx.font = `500 10px 'Inter', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(zone.label, cx, cy);
        });

        // Collection routes (subtle dotted lines)
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = '#C8C3B8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dimensions.w * 0.1, dimensions.h * 0.2);
        ctx.lineTo(dimensions.w * 0.3, dimensions.h * 0.25);
        ctx.lineTo(dimensions.w * 0.5, dimensions.h * 0.3);
        ctx.lineTo(dimensions.w * 0.7, dimensions.h * 0.28);
        ctx.lineTo(dimensions.w * 0.9, dimensions.h * 0.25);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Hotspot points plotted from actual projected coords
      hotspotsWithCoords.forEach(hs => {
        const pt = project(hs.lat, hs.lng);
        if (!pt) return;
        const { x, y } = pt;

        const isHovered = hoveredId === hs.id;
        const isSelected = selectedId === hs.id;

        // Risk halo
        const haloAlpha = 0.04 + Math.sin(tick * 0.03 + (parseInt(hs.id.replace(/\D/g, '') || '1', 10) % 10)) * 0.02;
        const haloRadius = Math.max(12, hs.risk * 0.35 + (isHovered || isSelected ? 8 : 0));

        if (hs.priority === 'CRITICAL' || hs.priority === 'HIGH') {
          ctx.beginPath();
          ctx.arc(x, y, haloRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(198, 93, 58, ${haloAlpha})`;
          ctx.fill();
        }

        // Point dot
        const radius = hs.priority === 'CRITICAL' ? 7 : hs.priority === 'HIGH' ? 6 : hs.priority === 'MODERATE' ? 5 : 4;
        const finalRadius = (isHovered || isSelected) ? radius + 2 : radius;

        ctx.beginPath();
        ctx.arc(x, y, finalRadius, 0, Math.PI * 2);
        ctx.fillStyle = hs.priority === 'CRITICAL' ? '#C65D3A' : hs.priority === 'HIGH' ? '#D4845A' : hs.priority === 'MODERATE' ? '#B8A88A' : '#7A8061';
        ctx.fill();

        // Selection ring
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(x, y, finalRadius + 2, 0, Math.PI * 2);
          ctx.strokeStyle = isSelected ? '#1D1D1B' : '#68655E';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Label
        if (isHovered || isSelected || hs.priority === 'CRITICAL') {
          ctx.fillStyle = '#1D1D1B';
          ctx.font = `500 10px 'Inter', sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(hs.zone, x, y - finalRadius - 6);
        }
      });

      animFrame.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animFrame.current);
  }, [dimensions, hotspotsWithCoords, hoveredId, selectedId, bounds, dataMode]);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (const hs of hotspotsWithCoords) {
      const pt = project(hs.lat, hs.lng);
      if (!pt) continue;
      const dist = Math.sqrt((clickX - pt.x) ** 2 + (clickY - pt.y) ** 2);
      if (dist < 20) {
        onHotspotClick(hs);
        return;
      }
    }
  }

  function handleCanvasMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const moveX = e.clientX - rect.left;
    const moveY = e.clientY - rect.top;

    let found: string | null = null;
    for (const hs of hotspotsWithCoords) {
      const pt = project(hs.lat, hs.lng);
      if (!pt) continue;
      const dist = Math.sqrt((moveX - pt.x) ** 2 + (moveY - pt.y) ** 2);
      if (dist < 20) {
        found = hs.id;
        break;
      }
    }
    setHoveredId(found);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = found ? 'pointer' : 'default';
    }
  }

  const noDataOrCoords = dataMode === 'NONE' || !hasMapCoordinates || hotspotsWithCoords.length === 0;

  return (
    <div className="map-container" ref={containerRef}>
      <div className="map-header">
        <div>
          <div className="map-title-row">
            <h2 className="heading-section">Waste hotspot intelligence</h2>
            {dataMode === 'DEMO' && <span className="badge badge-demo">SYNTHETIC DEMO MAP</span>}
            {dataMode === 'LIVE' && <span className="badge badge-low">LIVE COORDINATES</span>}
            {dataMode === 'NONE' && <span className="badge badge-outline">NO DATA</span>}
          </div>
          <p className="text-small" style={{ marginTop: 4 }}>
            {noDataOrCoords ? 'Geographic coordinate visualization' : 'Interactive zone map — click a hotspot for details'}
          </p>
        </div>
        {!noDataOrCoords && (
          <div className="map-legend">
            <div className="legend-item"><span className="legend-dot" style={{ background: '#C65D3A' }} />Critical</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#D4845A' }} />High</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#B8A88A' }} />Moderate</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#7A8061' }} />Low</div>
          </div>
        )}
      </div>

      {noDataOrCoords ? (
        <div className="map-unavailable-overlay" style={{ height: dimensions.h }}>
          <div className="map-unavailable-content">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="#C65D3A" strokeWidth="1.5" />
            </svg>
            <h3 className="heading-subsection" style={{ marginTop: '12px' }}>MAP DATA UNAVAILABLE</h3>
            <p className="text-body text-secondary" style={{ maxWidth: '420px', marginTop: '6px', textAlign: 'center' }}>
              {dataMode === 'NONE'
                ? 'No dataset is currently connected. Connect a dataset or load demo data to view hotspot coordinates.'
                : 'Location coordinates (latitude / longitude) are not available in the connected dataset.'}
            </p>
            <span className="text-meta" style={{ marginTop: '12px' }}>GEOGRAPHIC COORDINATES MISSING</span>
          </div>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="map-canvas"
          style={{ width: dimensions.w, height: dimensions.h }}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMove}
          onMouseLeave={() => setHoveredId(null)}
        />
      )}

      <div className="map-footer">
        <span className="text-meta">
          {dataMode === 'DEMO'
            ? 'SYNTHETIC DEMO MAP — Hotspot coordinates derived from demo dataset'
            : dataMode === 'LIVE'
            ? `CONNECTED DATASET — ${hotspotsWithCoords.length} zones mapped from uploaded coordinates`
            : 'NO COORDINATES CONNECTED'}
        </span>
      </div>
    </div>
  );
}
