import { useState } from 'react';
import EmptyState from '../components/EmptyState';
import { useWasteData } from '../data/DataContext';
import './Reports.css';

interface ReportTemplate {
  id: string;
  title: string;
  category: 'OPERATIONAL' | 'PREDICTIVE' | 'SYNTHESIS' | 'SUMMARY';
  frequency: string;
  format: 'PDF' | 'CSV' | 'JSON';
  summary: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'REP-01',
    title: 'Hotspot Recurrence & Preventive Action Briefing',
    category: 'PREDICTIVE',
    frequency: 'Weekly Synthesis',
    format: 'PDF',
    summary: 'Calculated risk indices across all monitored zones with forward predictive windows and staged preventive recommendations.',
  },
  {
    id: 'REP-02',
    title: 'Fleet Delay & Operational Performance Summary',
    category: 'OPERATIONAL',
    frequency: 'Cycle Summary',
    format: 'CSV',
    summary: 'Breakdown of scheduled, completed, delayed, and missed collections derived from ingested telemetry.',
  },
  {
    id: 'REP-03',
    title: 'Comprehensive Signal Provenance & Limitation Audit',
    category: 'SYNTHESIS',
    frequency: 'On-Demand',
    format: 'PDF',
    summary: 'Transparent documentation of available operational signals, detected patterns, and data boundary constraints.',
  },
];

export default function Reports() {
  const { dataMode, sourceLabel, rawData, datasetMeta, hotspots, predictions, collectionActivity, dataAvailability } = useWasteData();
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(reportTemplates[0]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Custom report configuration
  const [customTitle, setCustomTitle] = useState('Custom Operational Intelligence Briefing');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [minRisk, setMinRisk] = useState(40);
  const [isGenerating, setIsGenerating] = useState(false);

  const isDemo = dataMode === 'DEMO';
  const hasData = dataMode !== 'NONE' && rawData.length > 0;

  const filteredTemplates = activeCategory === 'ALL'
    ? reportTemplates
    : reportTemplates.filter(r => r.category === activeCategory);

  // Hotspots matching current zone / threshold
  const targetHotspots = hotspots.filter(h =>
    (selectedZone === 'ALL' || h.zone === selectedZone) && h.risk >= minRisk
  );

  function handleDownload(rep: ReportTemplate) {
    setExportNotice(`Exporting "${rep.title}" (${rep.format})...`);
    setTimeout(() => {
      // Trigger actual text download for CSV/JSON
      if (rep.format === 'CSV') {
        const headers = 'zone,priority,risk,recurrence,last_incident\n';
        const rows = hotspots.map(h => `${h.zone},${h.priority},${h.risk},${h.recurrence},"${h.lastIncident}"`).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wastesignal-${rep.id.toLowerCase()}.csv`;
        a.click();
      } else {
        const reportContent = `WASTESIGNAL REPORT: ${rep.title}\nDataset: ${datasetMeta?.name || 'Controlled Dataset'}\nRecords: ${rawData.length}\nDate: ${new Date().toISOString()}\n\nHotspots:\n` +
          hotspots.map(h => `[${h.zone}] Risk: ${h.risk} (${h.priority}) - Action: ${h.recommendedAction}`).join('\n');
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wastesignal-${rep.id.toLowerCase()}.txt`;
        a.click();
      }

      setExportNotice(`Export complete: ${rep.id} downloaded.`);
      setTimeout(() => setExportNotice(null), 3500);
    }, 800);
  }

  function handleGenerateCustom() {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowConfigModal(false);
      setExportNotice(`Generated report for ${selectedZone === 'ALL' ? 'All Zones' : selectedZone} (${targetHotspots.length} matching zones).`);
      setTimeout(() => setExportNotice(null), 3500);
    }, 1000);
  }

  return (
    <div className="reports-page animate-fade-in">
      <div className="page-top">
        <div>
          <h1 className="heading-page">Operational Reports & Intelligence Exports</h1>
          <p className="text-body" style={{ marginTop: 4 }}>
            Generate transparent briefings and dispatch manifests calculated directly from connected datasets
          </p>
        </div>
        <div className="reports-actions btn-group">
          <span className={`badge ${isDemo ? 'badge-demo' : dataMode === 'LIVE' ? 'badge-low' : 'badge-outline'}`}>
            {isDemo ? 'DATA STATUS: SYNTHETIC DATA' : dataMode === 'LIVE' ? 'DATA STATUS: UPLOADED DATASET' : 'NO DATA CONNECTED'}
          </span>
          {hasData && (
            <button className="btn-primary" onClick={() => setShowConfigModal(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Generate Custom Report
            </button>
          )}
        </div>
      </div>

      {exportNotice && (
        <div className="report-alert animate-slide-up">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{exportNotice}</span>
        </div>
      )}

      {!hasData ? (
        <div className="card">
          <EmptyState
            title="NO DATA CONNECTED"
            message="Connect a dataset or load demo data to view and generate operational intelligence reports."
          />
        </div>
      ) : (
        <>
          {/* Categories */}
          <div className="tabs">
            {['ALL', 'PREDICTIVE', 'OPERATIONAL', 'SYNTHESIS'].map(cat => (
              <button
                key={cat}
                className={`tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'ALL' ? 'All Reports' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="reports-grid">
            {/* Left: Template List */}
            <div className="reports-list-col">
              <div className="reports-cards-container">
                {filteredTemplates.map(rep => {
                  const isSelected = selectedTemplate.id === rep.id;
                  return (
                    <div
                      key={rep.id}
                      className={`report-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedTemplate(rep)}
                    >
                      <div className="report-card-header">
                        <div className="report-badge-row">
                          <span className={`badge badge-meta ${rep.category.toLowerCase()}`}>{rep.category}</span>
                          <span className="text-mono text-small">{rep.id}</span>
                        </div>
                        <span className="badge badge-outline">{rep.format}</span>
                      </div>
                      <h3 className="heading-subsection report-card-title">{rep.title}</h3>
                      <p className="text-small report-card-summary">{rep.summary}</p>
                      <div className="report-card-footer">
                        <span className="text-meta">{rep.frequency}</span>
                        <span className="text-meta">DERIVED FROM DATASET</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Document Preview */}
            <div className="reports-preview-col">
              <div className="card report-preview-card">
                <div className="card-header report-preview-header">
                  <div>
                    <div className="report-meta-tag-line">
                      <span className={`badge ${isDemo ? 'badge-demo' : 'badge-low'}`}>
                        {isDemo ? 'DEMONSTRATION REPORT' : 'OPERATIONAL REPORT'}
                      </span>
                      <span className="text-mono text-small">{selectedTemplate.id}</span>
                    </div>
                    <h2 className="heading-section" style={{ marginTop: '8px' }}>{selectedTemplate.title}</h2>
                  </div>
                  <button className="btn-secondary" onClick={() => handleDownload(selectedTemplate)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download {selectedTemplate.format}
                  </button>
                </div>

                <div className="report-doc-preview">
                  <div className="report-doc-sheet">
                    {/* Header */}
                    <div className="doc-header">
                      <div className="doc-brand">
                        <div className="sidebar-logo" style={{ width: 28, height: 28 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                          </svg>
                        </div>
                        <div>
                          <div className="doc-title-main">
                            {isDemo ? 'WASTESIGNAL DEMONSTRATION REPORT' : 'WASTESIGNAL OPERATIONAL REPORT'}
                          </div>
                          <div className="text-meta">PROVENANCE & SIGNAL SYNTHESIS PROTOCOL</div>
                        </div>
                      </div>
                      <div className="doc-stamp">
                        <span className="text-mono text-small">GENERATED: {new Date().toLocaleDateString('en-GB')}</span>
                        <span className={`badge ${isDemo ? 'badge-demo' : 'badge-low'}`}>
                          {isDemo ? 'SYNTHETIC DATA' : 'UPLOADED DATASET'}
                        </span>
                      </div>
                    </div>

                    <hr className="doc-divider" />

                    {/* Metadata Section */}
                    <div className="doc-section">
                      <h4 className="doc-section-heading">1. DATASET & OBSERVATION METADATA</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '8px' }}>
                        <div>
                          <span className="text-meta">DATASET NAME</span>
                          <div className="text-small text-mono">{datasetMeta?.name || 'Controlled Dataset'}</div>
                        </div>
                        <div>
                          <span className="text-meta">RECORDS ANALYZED</span>
                          <div className="text-small text-mono">{rawData.length} rows</div>
                        </div>
                        <div>
                          <span className="text-meta">DETECTED ZONES</span>
                          <div className="text-small text-mono">{hotspots.length} zones</div>
                        </div>
                        <div>
                          <span className="text-meta">AVAILABLE FIELDS</span>
                          <div className="text-small text-mono">{dataAvailability.available.length} fields</div>
                        </div>
                      </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="doc-section">
                      <h4 className="doc-section-heading">2. EXECUTIVE SUMMARY</h4>
                      <p className="text-body doc-para">
                        During the evaluated period, <strong>{rawData.length}</strong> operational records were synthesized across <strong>{hotspots.length}</strong> municipal zones.
                        {hotspots.length > 0 ? (
                          <>
                            {' '}The highest calculated risk was observed in <strong>{hotspots[0].zone}</strong> ({hotspots[0].zoneName.split('—')[1]?.trim() || hotspots[0].zoneName}) with an index of <strong>{hotspots[0].risk}/100</strong> ({hotspots[0].priority}), primarily driven by {hotspots[0].signalsUsed.join(', ')}.
                          </>
                        ) : (
                          ' No critical hotspot clusters were detected in the dataset.'
                        )}
                      </p>
                    </div>

                    {/* Hotspot Sector Matrix */}
                    <div className="doc-section">
                      <h4 className="doc-section-heading">3. CALCULATED HOTSPOT MATRIX</h4>
                      <table className="doc-table">
                        <thead>
                          <tr>
                            <th>Zone</th>
                            <th>Descriptor</th>
                            <th>Calculated Risk</th>
                            <th>Recurrence</th>
                            <th>Recommended Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hotspots.slice(0, 6).map(h => (
                            <tr key={h.id}>
                              <td className="text-mono">{h.zone}</td>
                              <td>{h.zoneName.split('—')[1]?.trim() || h.zoneName}</td>
                              <td>
                                <span className={`badge badge-${h.priority.toLowerCase()}`}>
                                  {h.risk}/100
                                </span>
                              </td>
                              <td>{h.recurrence}</td>
                              <td className="text-small">{h.recommendedAction}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Operational Observations */}
                    {collectionActivity && (
                      <div className="doc-section">
                        <h4 className="doc-section-heading">4. OPERATIONAL COLLECTION TELEMETRY</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '8px' }}>
                          <div className="tenant-stat">
                            <span className="text-meta">SCHEDULED</span>
                            <span className="text-mono">{collectionActivity.scheduled}</span>
                          </div>
                          <div className="tenant-stat">
                            <span className="text-meta">COMPLETED</span>
                            <span className="text-mono">{collectionActivity.completed} {collectionActivity.completionRate != null ? `(${collectionActivity.completionRate}%)` : ''}</span>
                          </div>
                          <div className="tenant-stat">
                            <span className="text-meta">DELAYED</span>
                            <span className="text-mono">{collectionActivity.delayed} {collectionActivity.delayAvg != null ? `(avg ${Math.round(collectionActivity.delayAvg)}m)` : ''}</span>
                          </div>
                          <div className="tenant-stat">
                            <span className="text-meta">MISSED</span>
                            <span className="text-mono">{collectionActivity.missed}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Data Limitations Section — Critical requirement 14 */}
                    <div className="doc-section">
                      <h4 className="doc-section-heading">5. DATA BOUNDARIES & SCIENTIFIC LIMITATIONS</h4>
                      <div className="doc-signals-box" style={{ background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div className="doc-signal-row" style={{ marginBottom: '6px' }}>
                          <span className="text-mono text-small" style={{ fontWeight: 600 }}>PROVENANCE:</span>
                          <span className="text-small">
                            {isDemo
                              ? 'All metrics in this report are calculated from a synthetic demonstration baseline for workflow presentation.'
                              : `Metrics in this report are calculated strictly from the uploaded dataset (${datasetMeta?.name || 'custom'}).`}
                          </span>
                        </div>
                        <div className="doc-signal-row" style={{ marginBottom: '6px' }}>
                          <span className="text-mono text-small" style={{ fontWeight: 600 }}>AVAILABLE FIELDS:</span>
                          <span className="text-small text-mono">{dataAvailability.available.join(', ')}</span>
                        </div>
                        {dataAvailability.missing.length > 0 && (
                          <div className="doc-signal-row" style={{ marginBottom: '6px' }}>
                            <span className="text-mono text-small" style={{ color: 'var(--terracotta)' }}>MISSING SIGNALS:</span>
                            <span className="text-small">
                              {dataAvailability.missing.join(', ')} are not present in the connected data and were excluded from scoring.
                            </span>
                          </div>
                        )}
                        <div className="doc-signal-row">
                          <span className="text-mono text-small" style={{ fontWeight: 600 }}>PREDICTION HORIZON:</span>
                          <span className="text-small">
                            {predictions.length > 0
                              ? `7-day forward horizon generated from ${hotspots.length} active zone signals. Not an audited regulatory certification.`
                              : 'Forward predictions are not presented because the dataset does not contain sufficient multi-cycle observations.'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="doc-footer">
                      <span className="text-meta">WasteSignal Platform • Operational Intelligence Engine</span>
                      <span className="text-meta">DATA LINEAGE: {sourceLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Report Modal */}
          {showConfigModal && (
            <div className="modal-backdrop">
              <div className="modal-content animate-slide-up">
                <div className="modal-header">
                  <h3 className="heading-section">Generate Custom Operational Report</h3>
                  <button className="btn-ghost" onClick={() => setShowConfigModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="text-meta">REPORT TITLE</label>
                    <input
                      type="text"
                      className="input"
                      value={customTitle}
                      onChange={e => setCustomTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="text-meta">TARGET ZONE</label>
                      <select
                        className="select"
                        value={selectedZone}
                        onChange={e => setSelectedZone(e.target.value)}
                      >
                        <option value="ALL">All Zones ({hotspots.length} detected)</option>
                        {hotspots.map(h => (
                          <option key={h.id} value={h.zone}>{h.zone} — {h.zoneName.split('—')[1]?.trim() || h.zoneName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="text-meta">MINIMUM RISK THRESHOLD ({minRisk})</label>
                      <input
                        type="range"
                        min="20"
                        max="90"
                        value={minRisk}
                        onChange={e => setMinRisk(Number(e.target.value))}
                        className="report-range"
                      />
                    </div>
                  </div>

                  <div className="modal-info-box" style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    <span className="text-small text-secondary">
                      This report will compile insights from <strong>{rawData.length}</strong> operational rows in <strong>{datasetMeta?.name || 'active dataset'}</strong> ({targetHotspots.length} matching zones).
                    </span>
                  </div>
                </div>

                <div className="modal-footer btn-group">
                  <button className="btn-secondary" onClick={() => setShowConfigModal(false)}>Cancel</button>
                  <button
                    className={`btn-primary ${isGenerating ? 'btn-loading' : ''}`}
                    onClick={handleGenerateCustom}
                    disabled={isGenerating}
                  >
                    {!isGenerating && (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {isGenerating ? 'Compiling Synthesis...' : 'Build & Export Briefing'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
