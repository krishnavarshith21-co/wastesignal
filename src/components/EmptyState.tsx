/* EmptyState — Premium onboarding & empty states when no data is connected */
import { useNavigate } from 'react-router-dom';
import { useWasteData } from '../data/DataContext';
import './EmptyState.css';

interface EmptyStateProps {
  title?: string;
  message?: string;
  showActions?: boolean;
  compact?: boolean;
  onUploadClick?: () => void;
  onViewFormatClick?: () => void;
}

export default function EmptyState({
  title = 'No data connected',
  message = 'Connect a dataset to begin generating WasteSignal intelligence.',
  showActions = true,
  compact = false,
  onUploadClick,
  onViewFormatClick,
}: EmptyStateProps) {
  const { loadDemoData } = useWasteData();
  const navigate = useNavigate();

  return (
    <div className={`empty-state ${compact ? 'compact' : ''}`}>
      <div className="empty-state-icon">
        <svg width={compact ? 32 : 48} height={compact ? 32 : 48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
        </svg>
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {showActions && (
        <div className="empty-state-actions btn-group">
          <button
            className="btn-primary"
            onClick={onUploadClick ? onUploadClick : () => navigate('/data-sources')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Dataset
          </button>
          <button className="btn-secondary" onClick={loadDemoData}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Use Demo Data
          </button>
          {onViewFormatClick && (
            <button className="btn-tertiary" onClick={onViewFormatClick}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              View Data Format
            </button>
          )}
        </div>
      )}
      <div className="empty-state-status">
        <span className="text-meta">DATA STATUS: NO DATA CONNECTED</span>
      </div>
    </div>
  );
}

/* Premium onboarding state specifically for Section 24 */
export function OnboardingHero({ onUploadClick, onViewFormatClick }: { onUploadClick?: () => void; onViewFormatClick?: () => void }) {
  const { loadDemoData } = useWasteData();
  const navigate = useNavigate();

  return (
    <div className="onboarding-hero-card animate-fade-in">
      <div className="onboarding-badge-row">
        <span className="badge badge-outline">DATA ONBOARDING</span>
        <span className="text-meta">SYSTEM READY</span>
      </div>
      <div className="onboarding-content">
        <h2 className="heading-editorial">Connect your first dataset.</h2>
        <p className="text-body onboarding-desc">
          Turn operational waste records into actionable intelligence. WasteSignal analyzes collection delay telemetry, incident frequency, and recurrence signals to prioritize preventive action.
        </p>
        <div className="onboarding-actions btn-group">
          <button
            className="btn-primary"
            onClick={onUploadClick ? onUploadClick : () => navigate('/data-sources')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Dataset
          </button>
          <button className="btn-secondary" onClick={loadDemoData}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Use Demo Data
          </button>
          <button
            className="btn-tertiary"
            onClick={onViewFormatClick ? onViewFormatClick : () => navigate('/data-sources')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            View Data Format
          </button>
        </div>
      </div>
      <div className="onboarding-footer">
        <div className="onboarding-requirement-pill">
          <span className="text-meta">SUPPORTED FORMATS:</span>
          <span className="text-mono text-small">CSV, JSON</span>
        </div>
        <div className="onboarding-requirement-pill">
          <span className="text-meta">PRIMARY FIELDS:</span>
          <span className="text-small">zone_id, timestamp, incident_type, collection_status</span>
        </div>
      </div>
    </div>
  );
}

/* Inline "no data" indicator for KPIs, metrics, etc. */
export function NoDataValue({ label }: { label?: string }) {
  return (
    <span className="no-data-value" title={label || 'No data'}>
      —
    </span>
  );
}

/* Source label tag */
export function SourceTag({ label, isDemo }: { label: string; isDemo?: boolean }) {
  return (
    <div className="source-tag">
      <span className="text-meta">SOURCE: {label}</span>
      {isDemo && <span className="badge badge-demo">SYNTHETIC DATA</span>}
    </div>
  );
}
