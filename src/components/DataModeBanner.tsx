/* Data Mode Banner — shows current data source status & Hackathon judge guidance */
import { useWasteData } from '../data/DataContext';
import './DataModeBanner.css';

export default function DataModeBanner() {
  const { dataMode, sourceLabel, datasetMeta, loadDemoData } = useWasteData();

  if (dataMode === 'NONE') {
    return (
      <div className="data-mode-banner hackathon-empty">
        <div className="data-mode-left">
          <span className="hackathon-tag-mini">WEMAKEDEVS × AWS HACKATHON • TRACK 03</span>
          <span className="data-mode-label">
            EVALUATION MODE: NO TELEMETRY CONNECTED YET
          </span>
        </div>
        <div className="data-mode-right">
          <button
            type="button"
            className="btn-banner-load"
            onClick={loadDemoData}
            title="Load live AWS S3 & Glue demo dataset"
          >
            ⚡ Load 1-Click AWS Demo Dataset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`data-mode-banner ${dataMode === 'DEMO' ? 'demo' : 'live'}`}>
      <div className="data-mode-left">
        <span className="data-mode-dot" />
        <span className="hackathon-tag-mini">TRACK 03 • WASTE & ENERGY</span>
        <span className="data-mode-label">
          {dataMode === 'DEMO'
            ? 'SYNTHETIC DEMONSTRATION DATA — S3 BUCKET & GLUE CATALOG ACTIVE'
            : 'CONNECTED — UPLOADED DATASET'}
        </span>
      </div>
      <div className="data-mode-right">
        <span className="data-mode-meta">REGION: ap-southeast-2</span>
        <span className="data-mode-meta">SOURCE: {sourceLabel}</span>
        {datasetMeta && (
          <span className="data-mode-meta">{datasetMeta.totalRecords} RECORDS</span>
        )}
      </div>
    </div>
  );
}

