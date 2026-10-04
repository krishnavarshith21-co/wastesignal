import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './LandingPage.css';

type PlatformTab = 'hotspots' | 'predictions' | 'operations' | 'intelligence' | 'reports' | 'datasources';

export default function LandingPage() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activePlatformTab, setActivePlatformTab] = useState<PlatformTab>('hotspots');

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className="landing-page animate-fade-in">
      {/* 1. Navigation */}
      <header className="landing-nav-wrap">
        <nav className="landing-nav">
          <Link to="/" className="landing-brand">
            <div className="landing-brand-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span>WASTESIGNAL</span>
          </Link>

          <ul className="landing-nav-links">
            <li>
              <button
                type="button"
                className="btn-tertiary"
                onClick={() => scrollToSection('platform')}
              >
                Platform
              </button>
            </li>
            <li>
              <button
                type="button"
                className="btn-tertiary"
                onClick={() => scrollToSection('how-it-works')}
              >
                How It Works
              </button>
            </li>
            <li>
              <button
                type="button"
                className="btn-tertiary"
                onClick={() => scrollToSection('intelligence')}
              >
                Intelligence
              </button>
            </li>
            <li>
              <button
                type="button"
                className="btn-tertiary"
                onClick={() => scrollToSection('impact')}
              >
                Impact
              </button>
            </li>
          </ul>

          <div className="landing-nav-actions btn-group">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate('/dashboard')}
                >
                  Enter Workspace
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={logout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* 2. Hero Section */}
      <section className="landing-hero-section">
        <div className="landing-hero-grid">
          <div className="landing-hero-copy">
            <div className="landing-credibility-pill">
              <span className="status-dot active" style={{ width: 6, height: 6 }} />
              <span>Predictive operational intelligence for waste management</span>
            </div>

            <h1 className="landing-hero-title">
              Waste intelligence,<br />
              before the cleanup.
            </h1>

            <p className="landing-hero-desc">
              WasteSignal turns operational waste records into predictive signals — helping teams identify recurring hotspots before they become the next cleanup problem.
            </p>

            <div className="landing-hero-ctas btn-group">
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
              >
                Explore the Platform
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => scrollToSection('how-it-works')}
              >
                View How It Works
              </button>
            </div>
          </div>

          {/* Sophisticated Operational Intelligence Visualization */}
          <div className="landing-hero-viz-box">
            <div className="viz-flow-strip">
              <span>CITY / ZONES</span>
              <span>→</span>
              <span>OPERATIONAL SIGNALS</span>
              <span>→</span>
              <span>RISK PATTERNS</span>
              <span>→</span>
              <span className="viz-flow-item active">PREDICTIVE HOTSPOTS</span>
              <span>→</span>
              <span>PREVENTIVE ACTION</span>
            </div>

            <div className="viz-radar-canvas-wrap">
              {/* Restrained vector coordinate grid & radar sweeps */}
              <svg width="100%" height="100%" viewBox="0 0 400 240" fill="none">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2DFD7" strokeWidth="0.75" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Simulated zone boundaries */}
                <path d="M 50 180 Q 140 60 260 110 T 360 170" stroke="#7A8061" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                <path d="M 90 40 L 180 160 L 320 80" stroke="#B8B4AA" strokeWidth="1" fill="none" />

                {/* Hotspot Nodes with signal rings */}
                <g transform="translate(140, 110)">
                  <circle r="18" fill="rgba(198, 93, 58, 0.12)" />
                  <circle r="8" fill="rgba(198, 93, 58, 0.25)" />
                  <circle r="4" fill="#C65D3A" />
                  <text x="12" y="4" fill="#1D1D1B" fontSize="10" fontFamily="monospace" fontWeight="600">ZONE Z-07 (88 RISK)</text>
                </g>

                <g transform="translate(280, 140)">
                  <circle r="14" fill="rgba(212, 132, 90, 0.12)" />
                  <circle r="6" fill="rgba(212, 132, 90, 0.25)" />
                  <circle r="3.5" fill="#D4845A" />
                  <text x="10" y="3" fill="#68655E" fontSize="9" fontFamily="monospace">ZONE Z-12 (72 RISK)</text>
                </g>

                <g transform="translate(80, 70)">
                  <circle r="10" fill="rgba(122, 128, 97, 0.12)" />
                  <circle r="3" fill="#7A8061" />
                  <text x="8" y="3" fill="#68655E" fontSize="9" fontFamily="monospace">ZONE Z-03 (STABLE)</text>
                </g>

                {/* Vector signal line to telemetry node */}
                <line x1="140" y1="110" x2="280" y2="140" stroke="#C65D3A" strokeWidth="1" strokeDasharray="2 3" />
              </svg>

              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <span className="badge badge-demo">DEMO SIGNALS</span>
              </div>
              <div style={{ position: 'absolute', bottom: 10, left: 12 }}>
                <span className="text-meta" style={{ fontSize: '9px' }}>COORDINATE RADAR • REAL-TIME HORIZON: 7 DAYS</span>
              </div>
            </div>

            <div className="viz-hotspots-live-list">
              <div className="viz-hotspot-chip">
                <span className="text-meta" style={{ fontSize: '9px' }}>HIGH CONCURRENT</span>
                <span className="text-mono text-small" style={{ fontWeight: 600 }}>Zone Z-07</span>
                <span className="text-small" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>88 / 100 Risk</span>
              </div>
              <div className="viz-hotspot-chip">
                <span className="text-meta" style={{ fontSize: '9px' }}>COLLECTION DELAY</span>
                <span className="text-mono text-small" style={{ fontWeight: 600 }}>Zone Z-12</span>
                <span className="text-small" style={{ color: '#D4845A', fontWeight: 600 }}>72 / 100 Risk</span>
              </div>
              <div className="viz-hotspot-chip">
                <span className="text-meta" style={{ fontSize: '9px' }}>STABLE BASELINE</span>
                <span className="text-mono text-small" style={{ fontWeight: 600 }}>Zone Z-03</span>
                <span className="text-small" style={{ color: 'var(--olive)', fontWeight: 600 }}>34 / 100 Risk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Hero Editorial Tagline Banner */}
      <section className="landing-statement-section">
        <div className="landing-statement-inner">
          <span className="landing-statement-meta">CORE OPERATIONAL PHILOSOPHY</span>
          <h2 className="landing-statement-quote">
            Don't clean the next hotspot.<br />
            <span>Predict it.</span>
          </h2>
        </div>
      </section>

      {/* 4. Section — The Problem */}
      <section className="landing-section" id="problem">
        <div className="landing-section-header">
          <span className="landing-section-meta">OPERATIONAL REALITY</span>
          <h2 className="landing-section-title">Waste operations are still largely reactive.</h2>
          <p className="landing-section-desc">
            Municipal and commercial waste fleets have extensive cleanup capabilities, but operate with severe blind spots.
          </p>
        </div>

        <div className="landing-problems-grid">
          <div className="problem-editorial-item">
            <span className="problem-num">01</span>
            <h3 className="problem-title">Repeated hotspots</h3>
            <p className="problem-text">
              The same locations repeatedly generate waste incidents, overflows, and citizen complaints across seasonal cycles.
            </p>
          </div>

          <div className="problem-editorial-item">
            <span className="problem-num">02</span>
            <h3 className="problem-title">Delayed visibility</h3>
            <p className="problem-text">
              Operational teams often see the problem after accumulation has already occurred, triggering emergency cleanup costs.
            </p>
          </div>

          <div className="problem-editorial-item">
            <span className="problem-num">03</span>
            <h3 className="problem-title">Disconnected signals</h3>
            <p className="problem-text">
              Collection activity, delay telemetry, incident recurrence, and municipal context are rarely synthesized together.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Section — The Shift */}
      <section className="landing-section" id="intelligence">
        <div className="landing-section-header">
          <span className="landing-section-meta">THE PARADIGM SHIFT</span>
          <h2 className="landing-section-title">From cleanup records to predictive signals.</h2>
          <p className="landing-section-desc">
            WasteSignal transitions teams from emergency response to scheduled preventative intervention.
          </p>
        </div>

        <div className="landing-shift-container">
          <div className="shift-card before">
            <span className="shift-badge" style={{ color: 'var(--text-tertiary)' }}>TRADITIONAL PARADIGM — REACTIVE</span>
            <div className="shift-steps">
              <div className="shift-step-row">
                <span>Incident occurs</span>
              </div>
              <div className="shift-step-arrow">↓</div>
              <div className="shift-step-row">
                <span>Emergency cleanup dispatched</span>
              </div>
              <div className="shift-step-arrow">↓</div>
              <div className="shift-step-row">
                <span>Problem recurs next week</span>
              </div>
            </div>
            <p className="text-small text-tertiary" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              Results in route overtime, localized environmental degradation, and recurring community complaints.
            </p>
          </div>

          <div className="shift-card after">
            <span className="shift-badge" style={{ color: 'var(--terracotta)' }}>WASTESIGNAL PARADIGM — PREDICTIVE</span>
            <div className="shift-steps">
              <div className="shift-step-row" style={{ color: 'var(--deep-graphite)' }}>
                <span>Operational data connected</span>
              </div>
              <div className="shift-step-arrow">↓</div>
              <div className="shift-step-row" style={{ color: 'var(--deep-graphite)' }}>
                <span>Pattern detection & recurrence analysis</span>
              </div>
              <div className="shift-step-arrow">↓</div>
              <div className="shift-step-row" style={{ color: 'var(--deep-graphite)' }}>
                <span>Forward 7-day risk prioritization</span>
              </div>
              <div className="shift-step-arrow">↓</div>
              <div className="shift-step-row" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>
                <span>Preventive intervention staged</span>
              </div>
            </div>
            <p className="text-small text-secondary" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              Reduces unscheduled emergency calls, balances route workloads, and stops localized accumulation cycles.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Section — How WasteSignal Works */}
      <section className="landing-section" id="how-it-works">
        <div className="landing-section-header">
          <span className="landing-section-meta">OPERATIONAL WORKFLOW</span>
          <h2 className="landing-section-title">A signal layer for waste operations.</h2>
          <p className="landing-section-desc">
            Four coordinated stages to turn raw records into scheduled field actions.
          </p>
        </div>

        <div className="landing-process-grid">
          <div className="process-step-item">
            <span className="process-step-num">01</span>
            <h3 className="process-step-title">Ingest</h3>
            <p className="process-step-desc">
              Operational records and contextual signals enter the system via municipal CSV, JSON streams, or dispatch webhooks.
            </p>
          </div>

          <div className="process-step-item">
            <span className="process-step-num">02</span>
            <h3 className="process-step-title">Interpret</h3>
            <p className="process-step-desc">
              WasteSignal automatically identifies recurrence patterns, collection delay telemetry, and volume spikes.
            </p>
          </div>

          <div className="process-step-item">
            <span className="process-step-num">03</span>
            <h3 className="process-step-title">Predict</h3>
            <p className="process-step-desc">
              Potential hotspot risk is prioritized across a forward-looking 7-day predictive operational window.
            </p>
          </div>

          <div className="process-step-item">
            <span className="process-step-num">04</span>
            <h3 className="process-step-title">Act</h3>
            <p className="process-step-desc">
              Teams receive actionable intervention priorities, executive synthesis briefings, and automated dispatch triggers.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Section — Platform Capabilities */}
      <section className="landing-section" id="platform">
        <div className="landing-section-header">
          <span className="landing-section-meta">THE PLATFORM</span>
          <h2 className="landing-section-title">One operational view. Multiple intelligence layers.</h2>
          <p className="landing-section-desc">
            Explore the specialized modules engineered into the WasteSignal platform.
          </p>
        </div>

        <div className="landing-platform-wrap">
          <div className="platform-tabs-row">
            {(['hotspots', 'predictions', 'operations', 'intelligence', 'reports', 'datasources'] as PlatformTab[]).map(tab => (
              <button
                key={tab}
                type="button"
                className={`platform-tab-btn ${activePlatformTab === tab ? 'active' : ''}`}
                onClick={() => setActivePlatformTab(tab)}
              >
                {tab === 'hotspots' && 'Hotspots'}
                {tab === 'predictions' && 'Predictions'}
                {tab === 'operations' && 'Operations'}
                {tab === 'intelligence' && 'Intelligence'}
                {tab === 'reports' && 'Reports'}
                {tab === 'datasources' && 'Data Sources'}
              </button>
            ))}
          </div>

          <div className="platform-preview-content">
            <div className="platform-preview-meta">
              {activePlatformTab === 'hotspots' && (
                <>
                  <span className="text-meta" style={{ color: 'var(--terracotta)' }}>SYSTEMIC HOTSPOT PRIORITIZATION</span>
                  <h3 className="heading-section" style={{ fontSize: 'var(--text-2xl)' }}>
                    Continuous hotspot scoring & recurrence tracking
                  </h3>
                  <p className="text-body">
                    Ranks monitored municipal zones from 0 to 100 based on verified incident frequency, collection delay telemetry, and historical recurrence.
                  </p>
                  <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
                    <li>Calculated risk scores with transparent signal breakdown</li>
                    <li>Drawer inspection with signal strength telemetry</li>
                    <li>Zero black-box claims — scoring adapts to available fields</li>
                  </ul>
                </>
              )}

              {activePlatformTab === 'predictions' && (
                <>
                  <span className="text-meta" style={{ color: 'var(--terracotta)' }}>FORWARD HORIZON MODELING</span>
                  <h3 className="heading-section" style={{ fontSize: 'var(--text-2xl)' }}>
                    Forward 7-day predictive window
                  </h3>
                  <p className="text-body">
                    Projects emerging overflow and contamination windows based on historical recurrence cycles, allowing supervisors to adjust route manifests proactively.
                  </p>
                  <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
                    <li>Temporal grouping across Day +1 through Day +7</li>
                    <li>Pre-emptive dispatch intervention recommendations</li>
                    <li>Labeled clearly as synthetic or historical projection</li>
                  </ul>
                </>
              )}

              {activePlatformTab === 'operations' && (
                <>
                  <span className="text-meta" style={{ color: 'var(--olive)' }}>FIELD FLEET TELEMETRY</span>
                  <h3 className="heading-section" style={{ fontSize: 'var(--text-2xl)' }}>
                    Collection activity & delay impact tracking
                  </h3>
                  <p className="text-body">
                    Aggregates scheduled, completed, delayed, and missed collections directly from operational status records to detect route volatility.
                  </p>
                  <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
                    <li>Actual completion rate calculations</li>
                    <li>Quantified delay impact minutes on downstream routes</li>
                    <li>Intervention queue for preventive adjustments</li>
                  </ul>
                </>
              )}

              {activePlatformTab === 'intelligence' && (
                <>
                  <span className="text-meta" style={{ color: 'var(--deep-graphite)' }}>AUTOMATED SYNTHESIS</span>
                  <h3 className="heading-section" style={{ fontSize: 'var(--text-2xl)' }}>
                    System-generated pattern observations
                  </h3>
                  <p className="text-body">
                    Translates multi-dimensional operational records into actionable observations with full provenance and signal attribution.
                  </p>
                  <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
                    <li>Severity-coded intelligence briefs</li>
                    <li>Documented signal origins & timestamps</li>
                    <li>Identifies systemic bottleneck zones</li>
                  </ul>
                </>
              )}

              {activePlatformTab === 'reports' && (
                <>
                  <span className="text-meta" style={{ color: 'var(--terracotta)' }}>EXECUTIVE DOCUMENT EXPORTS</span>
                  <h3 className="heading-section" style={{ fontSize: 'var(--text-2xl)' }}>
                    Operational reports & manifest downloads
                  </h3>
                  <p className="text-body">
                    Generates transparent briefings and dispatch manifests calculated directly from connected datasets in PDF, CSV, or JSON formats.
                  </p>
                  <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
                    <li>Hotspot recurrence executive summaries</li>
                    <li>Audited data limitation disclosures</li>
                    <li>Downloadable operational CSV manifests</li>
                  </ul>
                </>
              )}

              {activePlatformTab === 'datasources' && (
                <>
                  <span className="text-meta" style={{ color: 'var(--olive)' }}>TRANSPARENT INGESTION</span>
                  <h3 className="heading-section" style={{ fontSize: 'var(--text-2xl)' }}>
                    Flexible municipal schema validation
                  </h3>
                  <p className="text-body">
                    Accommodates real municipal formats without rigid requirements. Missing columns are marked as unavailable rather than inventing fake data.
                  </p>
                  <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
                    <li>Instant client-side CSV / JSON schema validation</li>
                    <li>Pre-loaded synthetic demo baseline for zero-setup evaluation</li>
                    <li>One-click sample CSV download for operational testing</li>
                  </ul>
                </>
              )}

              <div style={{ marginTop: 'var(--space-md)' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate(isAuthenticated ? `/${activePlatformTab === 'hotspots' ? 'hotspots' : activePlatformTab === 'predictions' ? 'predictions' : activePlatformTab === 'operations' ? 'operations' : activePlatformTab === 'intelligence' ? 'intelligence' : activePlatformTab === 'reports' ? 'reports' : 'data-sources'}` : '/login')}
                >
                  Inspect in Workspace
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Visual Fragment Preview */}
            <div className="platform-fragment-frame">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <span className="text-meta">WASTESIGNAL INTERFACE • MODULE PREVIEW</span>
                <span className="badge badge-demo">LIVE PROTOCOL</span>
              </div>

              {activePlatformTab === 'hotspots' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '10px 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className="text-mono" style={{ fontWeight: 600 }}>Zone Z-07</span>
                      <div className="text-small text-tertiary">Industrial Corridor East</div>
                    </div>
                    <span className="badge badge-critical">88 / 100 CRITICAL</span>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className="text-mono" style={{ fontWeight: 600 }}>Zone Z-12</span>
                      <div className="text-small text-tertiary">Commercial Market District</div>
                    </div>
                    <span className="badge badge-high">72 / 100 HIGH</span>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className="text-mono" style={{ fontWeight: 600 }}>Zone Z-03</span>
                      <div className="text-small text-tertiary">Transit Terminal Hub</div>
                    </div>
                    <span className="badge badge-low">34 / 100 LOW</span>
                  </div>
                </div>
              )}

              {activePlatformTab === 'predictions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="text-mono text-small" style={{ fontWeight: 600 }}>DAY +2 • ZONE Z-07</span>
                      <span className="badge badge-critical">CRITICAL RISK</span>
                    </div>
                    <p className="text-small text-secondary">
                      Anticipated overflow spike driven by bi-weekly collection delay telemetry.
                    </p>
                  </div>
                  <div style={{ padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="text-mono text-small" style={{ fontWeight: 600 }}>DAY +5 • ZONE Z-12</span>
                      <span className="badge badge-high">HIGH RISK</span>
                    </div>
                    <p className="text-small text-secondary">
                      Commercial route delay accumulation pattern observed.
                    </p>
                  </div>
                </div>
              )}

              {activePlatformTab === 'operations' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <div style={{ padding: '10px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <span className="text-meta" style={{ fontSize: '9px' }}>COMPLETED RATE</span>
                    <div className="text-data text-mono" style={{ fontSize: '18px', color: 'var(--olive)' }}>91.4%</div>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <span className="text-meta" style={{ fontSize: '9px' }}>AVG FLEET DELAY</span>
                    <div className="text-data text-mono" style={{ fontSize: '18px', color: 'var(--terracotta)' }}>+38m</div>
                  </div>
                </div>
              )}

              {activePlatformTab === 'intelligence' && (
                <div style={{ padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="text-small" style={{ fontWeight: 600 }}>Zone Z-07 Recurrence Signature</span>
                    <span className="badge badge-critical">CRITICAL</span>
                  </div>
                  <p className="text-small text-secondary" style={{ lineHeight: 1.4 }}>
                    Recurrence index is 3.4x municipal baseline across morning shift collections.
                  </p>
                </div>
              )}

              {activePlatformTab === 'reports' && (
                <div style={{ padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="text-small" style={{ fontWeight: 600 }}>REP-01: Hotspot Briefing</span>
                    <div className="text-meta" style={{ fontSize: '9px' }}>PDF • WEEKLY SYNTHESIS</div>
                  </div>
                  <span className="btn-secondary btn-sm">Download</span>
                </div>
              )}

              {activePlatformTab === 'datasources' && (
                <div style={{ padding: '12px 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="text-meta" style={{ fontSize: '10px' }}>SCHEMA VALIDATION</span>
                    <span className="badge badge-low">FIELD VERIFICATION ACTIVE</span>
                  </div>
                  <span className="text-mono text-small">zone_id, timestamp, incident_type, collection_delay</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Section — Why It Matters */}
      <section className="landing-section" id="impact">
        <div className="landing-section-header">
          <span className="landing-section-meta">OPERATIONAL IMPACT</span>
          <h2 className="landing-section-title">The goal is not more cleanup. The goal is fewer repeat problems.</h2>
          <p className="landing-section-desc">
            Moving from reactive crisis response to systematic prevention changes the economics of municipal waste.
          </p>
        </div>

        <div className="landing-outcomes-grid">
          <div className="outcome-card">
            <span className="outcome-tag">01 • PRIORITIZE</span>
            <h3 className="heading-section">Focus attention where risk is emerging</h3>
            <p className="text-body text-secondary">
              Direct supervisors and fleet managers toward high-volatility sectors before bins overflow and trigger public complaints.
            </p>
          </div>

          <div className="outcome-card">
            <span className="outcome-tag">02 • PREVENT</span>
            <h3 className="heading-section">Act before recurring waste becomes another cycle</h3>
            <p className="text-body text-secondary">
              Intervene with proactive container sizing, scheduled route reallocations, and targeted enforcement protocols.
            </p>
          </div>

          <div className="outcome-card">
            <span className="outcome-tag">03 • LEARN</span>
            <h3 className="heading-section">Turn operational history into better decisions</h3>
            <p className="text-body text-secondary">
              Transform passive incident logs into permanent analytical capital for municipal budgeting and long-term contract design.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Section — AWS & Infrastructure Technology */}
      <section className="landing-section" id="technology">
        <div className="landing-aws-wrap">
          <div>
            <span className="landing-section-meta">INFRASTRUCTURE ARCHITECTURE</span>
            <h2 className="landing-section-title" style={{ fontSize: 'var(--text-2xl)' }}>
              Built for operational intelligence.
            </h2>
            <p className="landing-section-desc">
              WasteSignal's analytical layer is architected on enterprise AWS cloud primitives for scalable municipal data processing.
            </p>
          </div>

          <div className="aws-services-grid">
            <div className="aws-service-pill">
              <span className="aws-service-name">Amazon S3</span>
              <span className="aws-service-role">Scalable object storage for telemetry & manifests</span>
            </div>
            <div className="aws-service-pill">
              <span className="aws-service-name">AWS Glue</span>
              <span className="aws-service-role">Automated ETL pipelines & schema cataloging</span>
            </div>
            <div className="aws-service-pill">
              <span className="aws-service-name">Amazon Athena</span>
              <span className="aws-service-role">Serverless SQL queries over historical logs</span>
            </div>
            <div className="aws-service-pill">
              <span className="aws-service-name">Amazon SageMaker</span>
              <span className="aws-service-role">Predictive hotspot risk modeling</span>
            </div>
            <div className="aws-service-pill">
              <span className="aws-service-name">Amazon Bedrock</span>
              <span className="aws-service-role">Operational briefing synthesis</span>
            </div>
            <div className="aws-service-pill">
              <span className="aws-service-name">AWS Lambda</span>
              <span className="aws-service-role">Event-driven dispatch webhook processing</span>
            </div>
            <div className="aws-service-pill">
              <span className="aws-service-name">Amazon API Gateway</span>
              <span className="aws-service-role">Secure municipal data ingestion endpoints</span>
            </div>
            <div className="aws-service-pill">
              <span className="aws-service-name">Amazon CloudWatch</span>
              <span className="aws-service-role">Real-time pipeline monitoring & telemetry</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Final Call to Action */}
      <section className="landing-final-cta">
        <span className="landing-section-meta">GET STARTED TODAY</span>
        <h2 className="landing-final-title">
          See what your waste data can reveal.
        </h2>
        <p className="landing-final-desc">
          Connect operational records, identify recurring patterns, and move from reactive cleanup toward predictive intervention.
        </p>

        <div className="btn-group">
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
          >
            {isAuthenticated ? 'Enter Workspace' : 'Get Started'}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          {!isAuthenticated && (
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          )}
        </div>

        <div className="landing-final-tagline">
          DON'T CLEAN THE NEXT HOTSPOT. PREDICT IT.
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <strong style={{ letterSpacing: '0.12em' }}>WASTESIGNAL</strong>
            </div>
            <p className="text-small text-secondary" style={{ marginTop: '4px' }}>
              Waste intelligence before the cleanup.
            </p>
          </div>

          <ul className="landing-footer-links">
            <li>
              <button
                type="button"
                className="btn-tertiary"
                onClick={() => scrollToSection('platform')}
              >
                Platform
              </button>
            </li>
            <li>
              <button
                type="button"
                className="btn-tertiary"
                onClick={() => scrollToSection('how-it-works')}
              >
                How It Works
              </button>
            </li>
            <li>
              <Link to="/login" className="btn-tertiary">
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/signup" className="btn-tertiary">
                Get Started
              </Link>
            </li>
          </ul>
        </div>

        <div className="landing-footer-bottom">
          <span>© 2026 WasteSignal. Predictive operational intelligence for waste operations.</span>
          <span className="text-mono" style={{ fontSize: '11px' }}>ENTERPRISE CLIMATE-TECH</span>
        </div>
      </footer>
    </div>
  );
}
