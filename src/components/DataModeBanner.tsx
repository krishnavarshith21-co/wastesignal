/* Data Mode Banner — shows current data source status globally */
import { useWasteData } from '../data/DataContext';
import './DataModeBanner.css';

export default function DataModeBanner() {
  const { dataMode, sourceLabel, datasetMeta } = useWasteData();

  if (dataMode === 'NONE') return null;

  return (
    <div className={`data-mode-banner ${dataMode === 'DEMO' ? 'demo' : 'live'}`}>
      <div className="data-mode-left">
        <span className="data-mode-dot" />
        <span className="data-mode-label">
          {dataMode === 'DEMO' ? 'DEMO ENVIRONMENT — SYNTHETIC DATASET' : 'CONNECTED — UPLOADED DATASET'}
        </span>
      </div>
      <div className="data-mode-right">
        <span className="data-mode-meta">SOURCE: {sourceLabel}</span>
        {datasetMeta && (
          <span className="data-mode-meta">{datasetMeta.totalRecords} RECORDS</span>
        )}
      </div>
    </div>
  );
}
