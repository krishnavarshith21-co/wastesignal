import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import IntelligenceField3D from '../components/IntelligenceField3D';
import './LandingPage.css';

type PlatformTab = 'hotspots' | 'predictions' | 'operations' | 'intelligence' | 'reports' | 'datasources';

export default function LandingPage() {
  const { isAuthenticated, logout, login } = useAuth();
  const navigate = useNavigate();
  const [activePlatformTab, setActivePlatformTab] = useState<PlatformTab>('hotspots');
  const [activeWorkflowStage, setActiveWorkflowStage] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  async function handleJudgeDemo() {
    try {
      await login('operator@wastesignal.io', 'Password123!');
      navigate('/dashboard?demo=judge');
    } catch {
      navigate('/dashboard?demo=judge');
    }
  }

  // 1. Initial micro-sequence (450ms reveal)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Workflow signature cycling (every 3.2s)
  useEffect(() => {
    const wfTimer = setInterval(() => {
      setActiveWorkflowStage((prev) => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(wfTimer);
  }, []);

  // 2. Navbar scroll shrinkage
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Scroll-triggered progressive reveals (IntersectionObserver)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // Trigger only once
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );
    observerRef.current = observer;

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [pageReady]);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className={`landing-page ${pageReady ? 'is-loaded' : 'is-initializing'}`}>
      {/* Refined Initializing Banner (Quick 450ms luxury reveal) */}
      {!pageReady && (
        <div className="landing-preloader" aria-hidden="true">
          <div className="preloader-inner">
            <span className="preloader-brand">WASTESIGNAL</span>
            <div className="preloader-bar">
              <div className="preloader-fill" />
            </div>
            <span className="preloader-status">INITIALIZING INTELLIGENCE FIELD • DATA • SIGNALS • READY</span>
          </div>
        </div>
      )}

      {/* 1. Navigation — Translucent, Sticky, Micro-Interactions */}
      <header className={`landing-nav-wrap ${isScrolled ? 'nav-scrolled' : ''}`}>
        <nav className="landing-nav">
          <Link to="/" className="landing-brand">
            <div className="landing-brand-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                className="nav-link-btn"
                onClick={() => scrollToSection('impact')}
              >
                Environmental Impact
              </button>
            </li>
            <li>
              <button
                type="button"
                className="nav-link-btn"
                onClick={() => scrollToSection('problem')}
              >
                Problem
              </button>
            </li>
            <li>
              <button
                type="button"
                className="nav-link-btn"
                onClick={() => scrollToSection('intelligence')}
              >
                Paradigm Shift
              </button>
            </li>
            <li>
              <button
                type="button"
                className="nav-link-btn"
                onClick={() => scrollToSection('how-it-works')}
              >
                Pipeline
              </button>
            </li>
            <li>
              <button
                type="button"
                className="nav-link-btn"
                onClick={() => scrollToSection('platform')}
              >
                Platform
              </button>
            </li>
            <li>
              <button
                type="button"
                className="nav-link-btn"
                onClick={() => scrollToSection('technology')}
              >
                AWS Architecture
              </button>
            </li>
          </ul>

          <div className="landing-nav-actions">
            <button
              type="button"
              className="btn-judge btn-nav"
              onClick={handleJudgeDemo}
              title="1-Click Evaluation for Hackathon Judges"
            >
              <span className="judge-icon">⚡</span>
              Judge Demo
            </button>
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="btn-primary btn-nav"
                  onClick={() => navigate('/dashboard')}
                >
                  Enter Workspace
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-nav"
                  onClick={logout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary btn-nav">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary btn-nav">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* 2. Hero Section — Editorial Typography & Signature 3D Field */}
      <section className="landing-hero-section">
        <div className="landing-hero-grid">
          <div className="landing-hero-copy">
            <div className="landing-credibility-pill hackathon-pill">
              <span className="pill-dot active" />
              <span className="pill-hackathon-name">WEMAKEDEVS × AWS ENVIRONMENTAL HACKATHON</span>
              <span className="pill-hackathon-sep">•</span>
              <span className="pill-hackathon-track">TRACK 03: WASTE & ENERGY</span>
            </div>

            <h1 className="landing-hero-title">
              Waste intelligence,<br />
              <span className="title-emphasis">before the cleanup.</span>
            </h1>

            <p className="landing-hero-desc">
              WasteSignal predicts municipal waste overflow and illegal dumping cycles before they emit methane or get torched — transforming emergency cleanups into proactive, low-emission routes.
            </p>

            <div className="landing-hero-ctas">
              <button
                type="button"
                className="btn-judge btn-hero"
                onClick={handleJudgeDemo}
                title="Instant 1-Click Evaluation for Hackathon Judges"
              >
                <span className="judge-icon">⚡</span>
                1-Click Judge Demo
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button
                type="button"
                className="btn-primary btn-hero"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
              >
                Explore Platform
              </button>
              <button
                type="button"
                className="btn-secondary btn-hero"
                onClick={() => scrollToSection('impact')}
              >
                Environmental Impact
              </button>
            </div>

            <div className="hero-metrics-strip">
              <div className="hero-metric-item">
                <span className="hero-metric-val">7-Day</span>
                <span className="hero-metric-lbl">Prediction Horizon</span>
              </div>
              <div className="hero-metric-sep" />
              <div className="hero-metric-item">
                <span className="hero-metric-val">0 to 100</span>
                <span className="hero-metric-lbl">Risk Prioritization</span>
              </div>
              <div className="hero-metric-sep" />
              <div className="hero-metric-item">
                <span className="hero-metric-val">AWS CONNECTED</span>
                <span className="hero-metric-lbl">S3 • Athena • Bedrock</span>
              </div>
            </div>
          </div>

          {/* Signature 3D Hero System: Predictive Waste Intelligence Field */}
          <div className="landing-hero-3d-wrap">
            <IntelligenceField3D />
          </div>
        </div>
      </section>

      {/* 2.5 Architectural Transition into Operational Core */}
      <div className="landing-transition-rule-wrap" aria-hidden="true">
        <div className="landing-transition-rule" />
        <span className="landing-transition-label">OPERATIONAL CORE</span>
        <div className="landing-transition-rule" />
      </div>

      {/* 3. Hero Editorial Tagline Banner / Manifesto */}
      <section className="landing-statement-section">
        <div className="landing-statement-inner">
          <span className="landing-statement-meta">CORE OPERATIONAL DIRECTIVE</span>
          <h2 className="landing-statement-quote">
            Don't clean the next hotspot.<br />
            <span className="quote-accent">Predict it.</span>
          </h2>
        </div>
      </section>

      {/* 3.5 Section — Environmental Impact (Track 03: Waste & Energy) */}
      <section className="landing-section reveal-on-scroll" id="impact">
        <div className="landing-section-header">
          <div className="impact-track-badge">
            <span className="track-badge-dot" />
            <span>TRACK 03 • WASTE AND ENERGY • IDEA & IMPACT</span>
          </div>
          <h2 className="landing-section-title">
            Stopping waste disasters before they burn.
          </h2>
          <p className="landing-section-desc">
            A small problem solved well beats a big one solved vaguely. WasteSignal targets the critical 48-hour window between municipal waste accumulation and toxic environmental hazard.
          </p>
        </div>

        <div className="impact-grid">
          {/* Pillar 1: Environmental Fix */}
          <div className="impact-card">
            <div className="impact-card-header">
              <span className="impact-card-tag">THE ENVIRONMENTAL PROBLEM</span>
              <span className="impact-status-pill pill-alert">CRITICAL HAZARD</span>
            </div>
            <h3 className="impact-card-title">Landfill Methane & Toxic Open-Air Trash Fires</h3>
            <p className="impact-card-text">
              In urban centers, uncollected waste left over 48 hours ferments anaerobically, emitting potent <strong>methane (CH₄)</strong> and toxic leachate. Frustrated residents and illegal dumpers routinely torch stagnant trash heaps, releasing carcinogenic dioxins, furans, and heavy <strong>PM2.5 smoke</strong> across neighboring communities.
            </p>
            <div className="impact-card-solution">
              <span className="solution-prefix">THE WASTESIGNAL FIX:</span>
              <span>Predictive 7-day recurrence modeling directs municipal compactor routes 48 hours in advance, eradicating dump accumulation before fermentation and spontaneous combustion occur.</span>
            </div>
          </div>

          {/* Pillar 2: Human Outcome */}
          <div className="impact-card">
            <div className="impact-card-header">
              <span className="impact-card-tag">WHAT CHANGES FOR PEOPLE</span>
              <span className="impact-status-pill pill-success">HUMAN OUTCOME</span>
            </div>
            <h3 className="impact-card-title">Clean School Routes, Disease Control & Dignified Sanitation</h3>
            <p className="impact-card-text">
              Families living near chronic collection gaps endure noxious odors, groundwater contamination, and vector breeding grounds for dengue and malaria. Street workers suffer acute injury and respiratory disease handling decomposing, hazardous waste heaps.
            </p>
            <div className="impact-card-solution">
              <span className="solution-prefix">THE WASTESIGNAL FIX:</span>
              <span>Replaces reactive emergency cleanup scrambles with scheduled, daytime preventative loops — keeping residential streets clean, slashing mosquito vectors, and reducing worker overtime burnout.</span>
            </div>
          </div>

          {/* Pillar 3: Informal Recyclers & Circular Energy */}
          <div className="impact-card">
            <div className="impact-card-header">
              <span className="impact-card-tag">CIRCULAR RECOVERY</span>
              <span className="impact-status-pill pill-info">ENERGY & RECYCLING</span>
            </div>
            <h3 className="impact-card-title">Empowering Informal Recyclers Before Contamination</h3>
            <p className="impact-card-text">
              Over 80% of municipal plastic and dry recyclables are collected by informal waste pickers. Once mixed with decomposing wet organic matter and compressed in hydraulic trucks, valuable cardboard and plastics become soiled and unrecyclable.
            </p>
            <div className="impact-card-solution">
              <span className="solution-prefix">THE WASTESIGNAL FIX:</span>
              <span>Early volume warning signals alert decentralized recycling collectives to salvage segregated dry materials at source before wet contamination destroys their circular economic value.</span>
            </div>
          </div>
        </div>

        {/* Environmental Outcomes Ribbon */}
        <div className="impact-metrics-ribbon">
          <div className="impact-ribbon-item">
            <span className="ribbon-val">~18.4 T</span>
            <span className="ribbon-lbl">CO₂e & Toxic Smoke Prevented / Sector / Yr</span>
          </div>
          <div className="impact-ribbon-sep" />
          <div className="impact-ribbon-item">
            <span className="ribbon-val">-35%</span>
            <span className="ribbon-lbl">Collection Truck Diesel Consumption</span>
          </div>
          <div className="impact-ribbon-sep" />
          <div className="impact-ribbon-item">
            <span className="ribbon-val">60%</span>
            <span className="ribbon-lbl">Faster Hazard Resolution Before Escalation</span>
          </div>
          <div className="impact-ribbon-sep" />
          <div className="impact-ribbon-item">
            <span className="ribbon-val">100%</span>
            <span className="ribbon-lbl">AWS Serverless Traceability (ap-southeast-2)</span>
          </div>
        </div>
      </section>

      {/* 4. Section — The Problem (Sequential line-drawing reveals) */}
      <section className="landing-section reveal-on-scroll" id="problem">
        <div className="landing-section-header">
          <span className="landing-section-meta">OPERATIONAL REALITY</span>
          <h2 className="landing-section-title">Waste operations are still largely reactive.</h2>
          <p className="landing-section-desc">
            Municipal and commercial waste fleets have extensive cleanup capabilities, but operate with severe visibility lags.
          </p>
        </div>

        <div className="landing-signals-conduit">
          <div className="signal-node-block">
            <div className="signal-num-badge">01</div>
            <div className="signal-body">
              <h3 className="signal-title">Repeated hotspots</h3>
              <p className="signal-desc">
                The same municipal sectors repeatedly generate waste incidents, overflows, and citizen complaints across seasonal cycles.
              </p>
            </div>
          </div>

          <div className="signal-connector-line" aria-hidden="true" />

          <div className="signal-node-block">
            <div className="signal-num-badge">02</div>
            <div className="signal-body">
              <h3 className="signal-title">Delayed visibility</h3>
              <p className="signal-desc">
                Operational teams often identify the bottleneck only after overflow has materialized, triggering costly emergency dispatches.
              </p>
            </div>
          </div>

          <div className="signal-connector-line" aria-hidden="true" />

          <div className="signal-node-block">
            <div className="signal-num-badge">03</div>
            <div className="signal-body">
              <h3 className="signal-title">Disconnected signals</h3>
              <p className="signal-desc">
                Collection activity, delay telemetry, incident recurrence, and municipal context are rarely synthesized into one forward view.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section — The Shift (Animated Paradigm Transition) */}
      <section className="landing-section reveal-on-scroll" id="intelligence">
        <div className="landing-section-header">
          <span className="landing-section-meta">THE PARADIGM SHIFT</span>
          <h2 className="landing-section-title">From cleanup records to predictive signals.</h2>
          <p className="landing-section-desc">
            WasteSignal transitions operational supervisors from emergency responses to planned, scheduled preventative intervention.
          </p>
        </div>

        <div className="paradigm-shift-layout">
          {/* Traditional Reactive Flow */}
          <div className="paradigm-card reactive-card">
            <div className="paradigm-header">
              <span className="paradigm-tag">TRADITIONAL PARADIGM</span>
              <span className="paradigm-status-badge badge-neutral">REACTIVE</span>
            </div>
            
            <div className="paradigm-steps-pipeline">
              <div className="paradigm-step">
                <span className="step-point" />
                <span className="step-text">Incident occurs in field</span>
              </div>
              <div className="pipeline-trace" />
              <div className="paradigm-step">
                <span className="step-point" />
                <span className="step-text">Citizen complaints logged</span>
              </div>
              <div className="pipeline-trace" />
              <div className="paradigm-step">
                <span className="step-point" />
                <span className="step-text">Emergency cleanup dispatched</span>
              </div>
              <div className="pipeline-trace" />
              <div className="paradigm-step">
                <span className="step-point" />
                <span className="step-text">Cleanup performed & closed</span>
              </div>
              <div className="pipeline-trace" />
              <div className="paradigm-step is-loop">
                <span className="step-point is-danger" />
                <span className="step-text">Incident recurs next week</span>
              </div>
            </div>

            <div className="paradigm-footer">
              <span className="paradigm-footer-note">
                Causes unbudgeted overtime, localized environmental degradation, and persistent community friction.
              </span>
            </div>
          </div>

          {/* WasteSignal Predictive Flow with Animated Traveling Signal */}
          <div className="paradigm-card predictive-card">
            <div className="paradigm-header">
              <span className="paradigm-tag">WASTESIGNAL PARADIGM</span>
              <span className="paradigm-status-badge badge-predictive">PREDICTIVE</span>
            </div>

            <div className="paradigm-steps-pipeline predictive-pipeline">
              <div className="pipeline-conduit-line">
                <div className="pipeline-signal-runner" />
              </div>

              <div className="paradigm-step active-step">
                <span className="step-point is-glow" />
                <span className="step-text">Operational data connected</span>
              </div>
              <div className="paradigm-step active-step">
                <span className="step-point is-glow" />
                <span className="step-text">Signal detection & pattern analysis</span>
              </div>
              <div className="paradigm-step active-step">
                <span className="step-point is-glow" />
                <span className="step-text">Forward 7-day risk prioritization</span>
              </div>
              <div className="paradigm-step active-step">
                <span className="step-point is-glow" />
                <span className="step-text">Root cause explainability mapped</span>
              </div>
              <div className="paradigm-step is-highlight">
                <span className="step-point is-action" />
                <span className="step-text">Preventive intervention staged</span>
              </div>
            </div>

            <div className="paradigm-footer">
              <span className="paradigm-footer-note note-highlight">
                Mitigates unscheduled emergency runs, balances daily fleet routes, and halts localized accumulation cycles.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section — Operational Workflow Pipeline (INGEST ── INTERPRET ── PREDICT ── ACT) */}
      <section className="landing-section reveal-on-scroll" id="how-it-works">
        <div className="landing-section-header">
          <span className="landing-section-meta">OPERATIONAL WORKFLOW</span>
          <h2 className="landing-section-title">A continuous signal layer for waste operations.</h2>
          <p className="landing-section-desc">
            Four coordinated stages to turn raw records into scheduled preventative field actions.
          </p>
        </div>

        <div className="pipeline-conduit-wrap">
          {/* Signature Connected Stage Conduit: INGEST ── INTERPRET ── PREDICT ── ACT */}
          <div className="workflow-signature-line">
            <button
              type="button"
              className={`workflow-node-point ${activeWorkflowStage === 0 ? 'is-active' : ''}`}
              onClick={() => setActiveWorkflowStage(0)}
            >
              <span className="wf-bead" />
              <span className="wf-label">01 INGEST</span>
            </button>
            <div className="wf-connector">
              <div className={`wf-connector-fill ${activeWorkflowStage >= 1 ? 'is-filled' : ''}`} />
            </div>
            <button
              type="button"
              className={`workflow-node-point ${activeWorkflowStage === 1 ? 'is-active' : ''}`}
              onClick={() => setActiveWorkflowStage(1)}
            >
              <span className="wf-bead" />
              <span className="wf-label">02 INTERPRET</span>
            </button>
            <div className="wf-connector">
              <div className={`wf-connector-fill ${activeWorkflowStage >= 2 ? 'is-filled' : ''}`} />
            </div>
            <button
              type="button"
              className={`workflow-node-point ${activeWorkflowStage === 2 ? 'is-active' : ''}`}
              onClick={() => setActiveWorkflowStage(2)}
            >
              <span className="wf-bead" />
              <span className="wf-label">03 PREDICT</span>
            </button>
            <div className="wf-connector">
              <div className={`wf-connector-fill ${activeWorkflowStage >= 3 ? 'is-filled' : ''}`} />
            </div>
            <button
              type="button"
              className={`workflow-node-point ${activeWorkflowStage === 3 ? 'is-active' : ''}`}
              onClick={() => setActiveWorkflowStage(3)}
            >
              <span className="wf-bead" />
              <span className="wf-label">04 ACT</span>
            </button>
          </div>

          <div className="pipeline-stages-grid">
            <div className={`pipeline-stage-card ${activeWorkflowStage === 0 ? 'stage-active' : ''}`}>
              <div className="stage-num-tag">01</div>
              <h3 className="stage-name">Ingest</h3>
              <p className="stage-desc">
                Operational records and contextual signals enter the system via municipal CSV, JSON streams, or dispatch webhooks.
              </p>
              <div className="stage-footer-meta">
                <span>INGESTION PROTOCOL</span>
              </div>
            </div>

            <div className={`pipeline-stage-card ${activeWorkflowStage === 1 ? 'stage-active' : ''}`}>
              <div className="stage-num-tag">02</div>
              <h3 className="stage-name">Interpret</h3>
              <p className="stage-desc">
                WasteSignal automatically synthesizes recurrence patterns, collection delay telemetry, and volume spikes.
              </p>
              <div className="stage-footer-meta">
                <span>PATTERN SYNTHESIS</span>
              </div>
            </div>

            <div className={`pipeline-stage-card ${activeWorkflowStage === 2 ? 'stage-active' : ''}`}>
              <div className="stage-num-tag">03</div>
              <h3 className="stage-name">Predict</h3>
              <p className="stage-desc">
                Potential hotspot risk is scored from 0 to 100 across a forward-looking 7-day predictive operational window.
              </p>
              <div className="stage-footer-meta">
                <span>7-DAY HORIZON</span>
              </div>
            </div>

            <div className={`pipeline-stage-card highlight-stage ${activeWorkflowStage === 3 ? 'stage-active' : ''}`}>
              <div className="stage-num-tag is-terracotta">04</div>
              <h3 className="stage-name">Act</h3>
              <p className="stage-desc">
                Teams receive actionable intervention priorities, executive synthesis briefings, and automated dispatch triggers.
              </p>
              <div className="stage-footer-meta">
                <span style={{ color: 'var(--terracotta)' }}>PREVENTATIVE ACTION</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Section — Interactive Intelligence Console & Explainability */}
      <section className="landing-section reveal-on-scroll" id="platform">
        <div className="landing-section-header">
          <span className="landing-section-meta">THE PLATFORM</span>
          <h2 className="landing-section-title">One operational view. Multiple intelligence layers.</h2>
          <p className="landing-section-desc">
            Explore the specialized modules engineered into the WasteSignal enterprise platform.
          </p>
        </div>

        <div className="platform-console-box">
          {/* Console Tab Selector */}
          <div className="console-tabs-strip">
            {(['hotspots', 'predictions', 'operations', 'intelligence', 'reports', 'datasources'] as PlatformTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`console-tab-item ${activePlatformTab === tab ? 'active' : ''}`}
                onClick={() => setActivePlatformTab(tab)}
              >
                <span className="tab-indicator" />
                <span className="tab-label">
                  {tab === 'hotspots' && 'Hotspots'}
                  {tab === 'predictions' && 'Predictions'}
                  {tab === 'operations' && 'Operations'}
                  {tab === 'intelligence' && 'Intelligence'}
                  {tab === 'reports' && 'Reports'}
                  {tab === 'datasources' && 'Data Sources'}
                </span>
              </button>
            ))}
          </div>

          <div className="console-display-grid">
            {/* Left: Module Details */}
            <div className="console-info-pane">
              {activePlatformTab === 'hotspots' && (
                <>
                  <div className="console-meta-pill">SYSTEMIC HOTSPOT PRIORITIZATION</div>
                  <h3 className="console-headline">Continuous hotspot scoring & recurrence tracking</h3>
                  <p className="console-text">
                    Ranks monitored municipal zones from 0 to 100 based on verified incident frequency, collection delay telemetry, and historical recurrence signatures.
                  </p>
                  <ul className="console-spec-list">
                    <li>Calculated risk scores with transparent signal attribution</li>
                    <li>Detailed drawer inspection with signal strength telemetry</li>
                    <li>Zero black-box claims — scoring adapts dynamically to available fields</li>
                  </ul>
                </>
              )}

              {activePlatformTab === 'predictions' && (
                <>
                  <div className="console-meta-pill">FORWARD HORIZON MODELING</div>
                  <h3 className="console-headline">Forward 7-day predictive operational window</h3>
                  <p className="console-text">
                    Projects emerging overflow and contamination windows based on historical recurrence cycles, allowing supervisors to adjust route manifests proactively.
                  </p>
                  <ul className="console-spec-list">
                    <li>Temporal grouping across Day +1 through Day +7</li>
                    <li>Pre-emptive dispatch intervention recommendations</li>
                    <li>Transparent data limitations and synthetic demonstration disclaimers</li>
                  </ul>
                </>
              )}

              {activePlatformTab === 'operations' && (
                <>
                  <div className="console-meta-pill">FIELD FLEET TELEMETRY</div>
                  <h3 className="console-headline">Collection activity & delay impact tracking</h3>
                  <p className="console-text">
                    Aggregates scheduled, completed, delayed, and missed collections directly from operational records to isolate fleet volatility.
                  </p>
                  <ul className="console-spec-list">
                    <li>Actual completion rate calculations with zero simulated data</li>
                    <li>Quantified delay impact minutes on downstream routes</li>
                    <li>Prioritized field intervention queue for route balancing</li>
                  </ul>
                </>
              )}

              {activePlatformTab === 'intelligence' && (
                <>
                  <div className="console-meta-pill">AUTOMATED SYNTHESIS</div>
                  <h3 className="console-headline">System-generated pattern observations</h3>
                  <p className="console-text">
                    Translates multi-dimensional operational records into actionable observations with full provenance and signal attribution.
                  </p>
                  <ul className="console-spec-list">
                    <li>Severity-coded intelligence briefs generated via Amazon Bedrock</li>
                    <li>Documented signal origins, confidence scores, and timestamps</li>
                    <li>Pinpoints chronic bottleneck zones across shifts</li>
                  </ul>
                </>
              )}

              {activePlatformTab === 'reports' && (
                <>
                  <div className="console-meta-pill">EXECUTIVE DOCUMENT EXPORTS</div>
                  <h3 className="console-headline">Operational reports & manifest downloads</h3>
                  <p className="console-text">
                    Generates transparent briefings and dispatch manifests calculated directly from connected datasets in PDF, CSV, or JSON formats.
                  </p>
                  <ul className="console-spec-list">
                    <li>Hotspot recurrence executive briefings</li>
                    <li>Audited data limitation disclosures</li>
                    <li>Downloadable operational CSV manifests</li>
                  </ul>
                </>
              )}

              {activePlatformTab === 'datasources' && (
                <>
                  <div className="console-meta-pill">TRANSPARENT INGESTION</div>
                  <h3 className="console-headline">Flexible municipal schema validation</h3>
                  <p className="console-text">
                    Accommodates real municipal formats without rigid requirements. Missing columns are marked as unavailable rather than inventing fake data.
                  </p>
                  <ul className="console-spec-list">
                    <li>Instant client-side CSV / JSON schema validation</li>
                    <li>Pre-loaded synthetic demo baseline for zero-setup evaluation</li>
                    <li>One-click sample CSV download for operational testing</li>
                  </ul>
                </>
              )}

              <div className="console-actions-row">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() =>
                    navigate(
                      isAuthenticated
                        ? `/${activePlatformTab === 'hotspots' ? 'hotspots' : activePlatformTab === 'predictions' ? 'predictions' : activePlatformTab === 'operations' ? 'operations' : activePlatformTab === 'intelligence' ? 'intelligence' : activePlatformTab === 'reports' ? 'reports' : 'data-sources'}`
                        : '/login'
                    )
                  }
                >
                  Inspect in Workspace
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right: Live Module Visual Fragment & Explainability Breakdown */}
            <div className="console-interactive-screen">
              <div className="screen-header-bar">
                <span className="screen-code-tag">SYSTEM TELEMETRY • LIVE MODULE VIEW</span>
                <span className="badge-demo-clean">DEMO SIGNALS</span>
              </div>

              {/* Module Content */}
              {activePlatformTab === 'hotspots' && (
                <div className="console-module-body">
                  {/* Abstract Municipal Hotspot Map Fragment */}
                  <div className="abstract-zone-map">
                    <div className="map-zone-node node-critical" style={{ top: '28%', left: '32%' }}>
                      <span className="node-halo" />
                      <span className="node-dot" />
                      <div className="node-tooltip">
                        <strong>Z-07</strong>
                        <span>88 / 100 CRITICAL</span>
                      </div>
                    </div>
                    <div className="map-zone-node node-high" style={{ top: '60%', left: '68%' }}>
                      <span className="node-dot" />
                      <div className="node-tooltip">
                        <strong>Z-12</strong>
                        <span>72 / 100 HIGH</span>
                      </div>
                    </div>
                    <div className="map-zone-node node-stable" style={{ top: '45%', left: '18%' }}>
                      <span className="node-dot" />
                      <div className="node-tooltip">
                        <strong>Z-03</strong>
                        <span>34 / 100 STABLE</span>
                      </div>
                    </div>
                    <div className="map-watermark-text">MUNICIPAL ABSTRACT GRID • ZONE RELIEF</div>
                  </div>

                  {/* Explainability Breakdown (Section 15) */}
                  <div className="explainability-box">
                    <div className="explain-header">
                      <span className="explain-title">WHY ZONE Z-07 IS PRIORITIZED</span>
                      <span className="explain-score">88 / 100</span>
                    </div>
                    <div className="explain-metrics-grid">
                      <div className="explain-metric-row">
                        <span className="explain-lbl">RECURRENCE</span>
                        <div className="explain-bar-track">
                          <div className="explain-bar-fill" style={{ width: '92%' }} />
                        </div>
                        <span className="explain-val val-crit">HIGH</span>
                      </div>
                      <div className="explain-metric-row">
                        <span className="explain-lbl">RECENT ACTIVITY</span>
                        <div className="explain-bar-track">
                          <div className="explain-bar-fill" style={{ width: '84%' }} />
                        </div>
                        <span className="explain-val val-crit">HIGH</span>
                      </div>
                      <div className="explain-metric-row">
                        <span className="explain-lbl">RESPONSE DELAY</span>
                        <div className="explain-bar-track">
                          <div className="explain-bar-fill" style={{ width: '60%' }} />
                        </div>
                        <span className="explain-val val-med">MEDIUM</span>
                      </div>
                      <div className="explain-metric-row">
                        <span className="explain-lbl">COLLECTION GAP</span>
                        <div className="explain-bar-track">
                          <div className="explain-bar-fill" style={{ width: '80%' }} />
                        </div>
                        <span className="explain-val val-crit">HIGH</span>
                      </div>
                    </div>
                    <div className="explain-disclaimer">SYNTHETIC DEMONSTRATION DATA</div>
                  </div>
                </div>
              )}

              {/* Predictions Tab: 7-Day Timeline (Section 14) */}
              {activePlatformTab === 'predictions' && (
                <div className="console-module-body">
                  <div className="pred-timeline-container">
                    <div className="timeline-title-bar">
                      <span>PREDICTIVE TEMPORAL PROJECTION</span>
                      <span className="pred-range-tag">HORIZON: 7 DAYS</span>
                    </div>

                    <div className="pred-timeline-axis">
                      <div className="axis-segment past-segment">
                        <span className="axis-label">PAST (HISTORICAL)</span>
                        <div className="axis-line" />
                        <div className="axis-point point-hist" style={{ left: '30%' }}>
                          <span className="pt-bubble">3 Incidents</span>
                        </div>
                      </div>

                      <div className="axis-segment now-segment">
                        <div className="now-marker">
                          <span className="now-indicator" />
                          <span className="now-text">NOW</span>
                        </div>
                      </div>

                      <div className="axis-segment future-segment">
                        <span className="axis-label future-label">PREDICTED NEXT 7 DAYS</span>
                        <div className="axis-line future-line">
                          <div className="future-signal-pulse" />
                        </div>
                        <div className="axis-point point-pred" style={{ left: '40%' }}>
                          <span className="pt-bubble is-terracotta">Day +2 (Z-07)</span>
                        </div>
                        <div className="axis-point point-pred" style={{ left: '75%' }}>
                          <span className="pt-bubble">Day +5 (Z-12)</span>
                        </div>
                      </div>
                    </div>

                    <div className="pred-card-row">
                      <div className="pred-chip">
                        <div className="pred-chip-head">
                          <span className="text-mono">DAY +2 • ZONE Z-07</span>
                          <span className="badge-chip-crit">88 RISK</span>
                        </div>
                        <p className="pred-chip-body">
                          Bi-weekly commercial collection delay threshold crossed. Early overflow cycle projected.
                        </p>
                      </div>
                      <div className="pred-chip">
                        <div className="pred-chip-head">
                          <span className="text-mono">DAY +5 • ZONE Z-12</span>
                          <span className="badge-chip-high">72 RISK</span>
                        </div>
                        <p className="pred-chip-body">
                          Market corridor volume acceleration detected across evening shift cycles.
                        </p>
                      </div>
                    </div>
                    <div className="explain-disclaimer">SYNTHETIC DEMONSTRATION DATA</div>
                  </div>
                </div>
              )}

              {activePlatformTab === 'operations' && (
                <div className="console-module-body">
                  <div className="ops-kpi-grid">
                    <div className="ops-kpi-card">
                      <span className="ops-kpi-label">COMPLETED COLLECTION RATE</span>
                      <div className="ops-kpi-val text-olive">91.4%</div>
                      <span className="ops-kpi-sub">Calculated directly from operational logs</span>
                    </div>
                    <div className="ops-kpi-card">
                      <span className="ops-kpi-label">AVERAGE FLEET DELAY IMPACT</span>
                      <div className="ops-kpi-val text-terracotta">+38 min</div>
                      <span className="ops-kpi-sub">Downstream route volatility</span>
                    </div>
                  </div>
                  <div className="ops-intervention-card">
                    <div className="ops-inter-head">
                      <span className="text-mono">PREVENTATIVE DISPATCH TARGET</span>
                      <span className="badge-chip-crit">SCHEDULED FOR 06:00</span>
                    </div>
                    <p className="ops-inter-body">
                      Reallocate Route #4 vehicle to Industrial Corridor East prior to 08:00 delivery window.
                    </p>
                  </div>
                </div>
              )}

              {activePlatformTab === 'intelligence' && (
                <div className="console-module-body">
                  <div className="intel-brief-card">
                    <div className="intel-brief-head">
                      <span className="intel-brief-title">Zone Z-07 Recurrence Signature</span>
                      <span className="badge-chip-crit">CRITICAL OBSERVATION</span>
                    </div>
                    <p className="intel-brief-text">
                      Recurrence index is 3.4x municipal baseline across morning shift collections. Delayed reporting masks actual volume surges until next operational cycle.
                    </p>
                    <div className="intel-brief-meta">
                      <span>SYNTHESIZED VIA AMAZON BEDROCK • LATENCY: 312ms</span>
                    </div>
                  </div>
                </div>
              )}

              {activePlatformTab === 'reports' && (
                <div className="console-module-body">
                  <div className="report-card-preview">
                    <div className="report-card-info">
                      <span className="report-name">REP-2026-W41: Hotspot Prioritization Briefing</span>
                      <span className="report-meta">PDF • MUNICIPAL EXECUTIVE SYNTHESIS • 4 PAGES</span>
                    </div>
                    <span className="btn-secondary btn-sm">Download</span>
                  </div>
                  <div className="report-card-preview">
                    <div className="report-card-info">
                      <span className="report-name">MANIFEST: Preventative Route Adjustments</span>
                      <span className="report-meta">CSV • FIELD DISPATCH MANIFEST • 12 ZONES</span>
                    </div>
                    <span className="btn-secondary btn-sm">Download</span>
                  </div>
                </div>
              )}

              {activePlatformTab === 'datasources' && (
                <div className="console-module-body">
                  <div className="schema-card-box">
                    <div className="schema-head">
                      <span className="schema-tag">MUNICIPAL SCHEMA VALIDATION</span>
                      <span className="badge-chip-low">VERIFIED ACTIVE</span>
                    </div>
                    <div className="schema-fields-code">
                      <span>zone_id (string)</span>
                      <span>timestamp (ISO 8601)</span>
                      <span>incident_type (string)</span>
                      <span>collection_delay (minutes)</span>
                    </div>
                    <p className="schema-foot-note">
                      Zero black-box requirements: missing optional columns are gracefully handled as unavailable.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Section — Operational Impact */}
      <section className="landing-section reveal-on-scroll" id="impact">
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
            <h3 className="outcome-title">Focus attention where risk is emerging</h3>
            <p className="outcome-desc">
              Direct supervisors and fleet managers toward high-volatility sectors before containers overflow and trigger public escalation.
            </p>
          </div>

          <div className="outcome-card">
            <span className="outcome-tag">02 • PREVENT</span>
            <h3 className="outcome-title">Act before recurring waste becomes another cycle</h3>
            <p className="outcome-desc">
              Intervene with proactive container sizing, scheduled route reallocations, and targeted enforcement protocols.
            </p>
          </div>

          <div className="outcome-card">
            <span className="outcome-tag">03 • LEARN</span>
            <h3 className="outcome-title">Turn operational history into permanent capital</h3>
            <p className="outcome-desc">
              Transform passive incident logs into permanent analytical capital for municipal budgeting, route optimization, and contracting.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Section — AWS Cloud Architecture Pipeline (Section 16) */}
      <section className="landing-section reveal-on-scroll" id="technology">
        <div className="aws-arch-container">
          <div className="aws-arch-header">
            <span className="landing-section-meta">CLOUD INFRASTRUCTURE</span>
            <h2 className="landing-section-title">Built on enterprise AWS cloud primitives.</h2>
            <p className="landing-section-desc">
              WasteSignal's analytical layer is architected directly on AWS services for reliable, scalable municipal data processing.
            </p>
          </div>

          {/* Architecture Flow Pipeline */}
          <div className="arch-flow-diagram">
            <div className="arch-flow-rail">
              <div className="arch-flow-signal" />
            </div>

            <div className="arch-nodes-grid">
              {/* S3 */}
              <div className="arch-service-card">
                <div className="arch-service-top">
                  <span className="arch-service-name">Amazon S3</span>
                  <span className="arch-status-badge is-connected">CONNECTED</span>
                </div>
                <p className="arch-service-role">Scalable object storage for telemetry & CSV/JSON manifests</p>
                <span className="arch-service-bucket">ap-southeast-2</span>
              </div>

              {/* Glue */}
              <div className="arch-service-card">
                <div className="arch-service-top">
                  <span className="arch-service-name">AWS Glue</span>
                  <span className="arch-status-badge is-connected">CONNECTED</span>
                </div>
                <p className="arch-service-role">Automated ETL pipelines & schema cataloging</p>
                <span className="arch-service-bucket">wastesignal_db</span>
              </div>

              {/* Athena */}
              <div className="arch-service-card">
                <div className="arch-service-top">
                  <span className="arch-service-name">Amazon Athena</span>
                  <span className="arch-status-badge is-connected">CONNECTED</span>
                </div>
                <p className="arch-service-role">Serverless SQL analytics over historical municipal logs</p>
                <span className="arch-service-bucket">Workgroup: primary</span>
              </div>

              {/* SageMaker */}
              <div className="arch-service-card">
                <div className="arch-service-top">
                  <span className="arch-service-name">Amazon SageMaker</span>
                  <span className="arch-status-badge is-unconfigured">NOT CONFIGURED</span>
                </div>
                <p className="arch-service-role">Advanced ML training pipelines for high-dimensional risk modeling</p>
                <span className="arch-service-bucket">Optional enterprise upgrade</span>
              </div>

              {/* Bedrock */}
              <div className="arch-service-card">
                <div className="arch-service-top">
                  <span className="arch-service-name">Amazon Bedrock</span>
                  <span className="arch-status-badge is-connected">CONNECTED</span>
                </div>
                <p className="arch-service-role">LLM synthesis & automated operational briefings</p>
                <span className="arch-service-bucket">amazon.nova-micro-v1:0</span>
              </div>

              {/* Lambda */}
              <div className="arch-service-card">
                <div className="arch-service-top">
                  <span className="arch-service-name">AWS Lambda</span>
                  <span className="arch-status-badge is-connected">CONNECTED</span>
                </div>
                <p className="arch-service-role">Event-driven serverless dispatch & webhook processing</p>
                <span className="arch-service-bucket">Node.js 20.x runtime</span>
              </div>

              {/* API Gateway */}
              <div className="arch-service-card">
                <div className="arch-service-top">
                  <span className="arch-service-name">Amazon API Gateway</span>
                  <span className="arch-status-badge is-connected">CONNECTED</span>
                </div>
                <p className="arch-service-role">Secure municipal data ingestion endpoints & CORS proxy</p>
                <span className="arch-service-bucket">REST API Proxy</span>
              </div>

              {/* CloudWatch */}
              <div className="arch-service-card">
                <div className="arch-service-top">
                  <span className="arch-service-name">Amazon CloudWatch</span>
                  <span className="arch-status-badge is-connected">CONNECTED</span>
                </div>
                <p className="arch-service-role">Real-time pipeline monitoring, alarms & operational audit logs</p>
                <span className="arch-service-bucket">Audit & telemetry</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Final Call to Action (Section 17) */}
      <section className="landing-final-cta">
        <span className="landing-section-meta">GET STARTED TODAY</span>
        <h2 className="landing-final-title">
          See what your waste data can reveal.
        </h2>
        <p className="landing-final-desc">
          Connect operational records, identify recurring patterns, and move from reactive cleanup toward predictive intervention.
        </p>

        <div className="final-cta-buttons">
          <button
            type="button"
            className="btn-primary btn-cta-large"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
          >
            {isAuthenticated ? 'Enter Workspace' : 'Get Started'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          {!isAuthenticated && (
            <Link to="/login" className="btn-secondary btn-cta-large">
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
            <div className="footer-brand-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <strong>WASTESIGNAL</strong>
            </div>
            <p className="footer-brand-sub">
              Predictive operational intelligence for municipal waste management.
            </p>
          </div>

          <ul className="landing-footer-links">
            <li>
              <button type="button" className="footer-link-btn" onClick={() => scrollToSection('problem')}>
                Problem
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => scrollToSection('intelligence')}>
                Paradigm Shift
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => scrollToSection('how-it-works')}>
                Workflow
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => scrollToSection('platform')}>
                Platform
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => scrollToSection('technology')}>
                AWS Architecture
              </button>
            </li>
          </ul>
        </div>

        <div className="landing-footer-bottom">
          <span>© 2026 WasteSignal. Predictive operational intelligence for waste operations.</span>
          <span className="footer-classification">ENTERPRISE CLIMATE-TECH • HIGH-INTEGRITY DATA</span>
        </div>
      </footer>
    </div>
  );
}
