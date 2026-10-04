import './KPIStrip.css';

interface KPI {
  label: string;
  value: string | number | null;
  accent?: 'terracotta' | 'olive' | 'default';
}

interface KPIStripProps {
  items: KPI[];
  sourceLabel: string;
}

export default function KPIStrip({ items, sourceLabel }: KPIStripProps) {
  return (
    <div className="kpi-strip">
      {items.map((item, i) => (
        <div key={i} className="kpi-item">
          <span className="text-meta">{item.label}</span>
          <span className={`kpi-value ${item.accent === 'terracotta' ? 'accent-terracotta' : item.accent === 'olive' ? 'accent-olive' : ''}`}>
            {item.value != null ? (typeof item.value === 'number' && item.value < 10 ? `0${item.value}` : item.value) : '—'}
          </span>
          {item.value == null && <span className="kpi-nodata">NO DATA</span>}
        </div>
      ))}
      <div className="kpi-source-tag">
        <span className="text-meta">SOURCE: {sourceLabel}</span>
      </div>
    </div>
  );
}
