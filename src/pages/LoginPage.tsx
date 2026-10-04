import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Auth.css';

export default function LoginPage() {
  const { login, fillDemoCredentials } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal for Forgot Password disclosure
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Return to the route user originally tried to access, or /dashboard
  const fromLocation = (location.state as { from?: { pathname: string; search: string } })?.from;
  const destination = fromLocation ? `${fromLocation.pathname}${fromLocation.search || ''}` : '/dashboard';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        navigate(destination, { replace: true });
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } catch {
      setErrorMessage('An unexpected authentication error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleQuickFillDemo() {
    const creds = fillDemoCredentials();
    setEmail(creds.email);
    setPassword(creds.password);
    setErrorMessage(null);
  }

  return (
    <div className="auth-container animate-fade-in">
      {/* Left Column: Visual & Product Story (~55%) */}
      <div className="auth-story-col">
        <div className="auth-story-top">
          <Link to="/" className="auth-brand-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            WASTESIGNAL
          </Link>

          <h1 className="auth-story-heading">
            Waste intelligence,<br />
            before the cleanup.
          </h1>

          <div className="auth-story-bullets">
            <div className="auth-bullet-item">
              <span className="auth-bullet-dot" />
              <span>Predict recurring hotspots before overflow cycles happen.</span>
            </div>
            <div className="auth-bullet-item">
              <span className="auth-bullet-dot" />
              <span>Prioritize preventive dispatch interventions.</span>
            </div>
            <div className="auth-bullet-item">
              <span className="auth-bullet-dot" />
              <span>Operate with unified telemetry and contextual signals.</span>
            </div>
          </div>
        </div>

        {/* Restrained Analytical Visualization */}
        <div className="auth-visualization">
          <div className="auth-viz-header">
            <span className="text-meta">OPERATIONAL SIGNAL RADAR</span>
            <span className="badge badge-demo">DEMO SIGNALS</span>
          </div>

          <div className="auth-viz-grid">
            <div className="auth-viz-cell">
              <span className="text-meta" style={{ fontSize: '9px' }}>MONITORED SECTOR</span>
              <span className="text-mono text-small" style={{ fontWeight: 600 }}>ZONE Z-07</span>
              <span className="text-small" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>88 / 100 RISK</span>
            </div>
            <div className="auth-viz-cell">
              <span className="text-meta" style={{ fontSize: '9px' }}>RECURRENCE PATTERN</span>
              <span className="text-mono text-small" style={{ fontWeight: 600 }}>HIGH (WEEKLY)</span>
              <span className="text-small" style={{ color: 'var(--olive)', fontWeight: 600 }}>ACTIVE SIGNAL</span>
            </div>
            <div className="auth-viz-cell">
              <span className="text-meta" style={{ fontSize: '9px' }}>RECOMMENDATION</span>
              <span className="text-mono text-small" style={{ fontWeight: 600 }}>PREVENTIVE RUN</span>
              <span className="text-small" style={{ color: 'var(--text-secondary)' }}>DAY +2 WINDOW</span>
            </div>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-meta" style={{ fontSize: '9px' }}>INTELLIGENCE STREAM ACTIVE</span>
            <span className="text-meta text-mono" style={{ fontSize: '10px' }}>LAT 42.3601° N • LON 71.0589° W</span>
          </div>
        </div>

        <div className="auth-story-footer">
          <span>WasteSignal Operational Intelligence Platform</span>
          <span>© 2026 WasteSignal</span>
        </div>
      </div>

      {/* Right Column: Authentication Form (~45%) */}
      <div className="auth-form-col">
        <div className="auth-form-wrapper">
          <div className="auth-header-block">
            <div className="auth-logo-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span className="text-meta" style={{ letterSpacing: '0.12em', color: 'var(--deep-graphite)' }}>WASTESIGNAL</span>
            </div>
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to your intelligence workspace.</p>
          </div>

          {/* Quick-fill demo account for evaluation ease */}
          <div className="auth-demo-banner">
            <div className="auth-demo-text">
              <strong>Evaluation demo credentials:</strong><br />
              <span className="text-mono">operator@wastesignal.io</span> • <span className="text-mono">Password123!</span>
            </div>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={handleQuickFillDemo}
              title="Click to populate credentials"
            >
              Autofill
            </button>
          </div>

          {errorMessage && (
            <div className="auth-error-banner animate-slide-up" role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="work-email">Work Email</label>
              <div className="auth-input-wrap">
                <input
                  id="work-email"
                  type="email"
                  className="auth-input"
                  placeholder="operator@organization.gov"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="auth-options-row">
              <label className="auth-remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--deep-graphite)', cursor: 'pointer' }}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="auth-forgot-btn"
                onClick={() => { setForgotSent(false); setShowForgotModal(true); }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className={`btn-primary ${isSubmitting ? 'btn-loading' : ''}`}
              style={{ width: '100%' }}
              disabled={isSubmitting}
            >
              {!isSubmitting && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              )}
              {isSubmitting ? 'Verifying Workspace…' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer-link">
            <span>Don't have an account?</span>
            <Link to="/signup">Create account</Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Disclosure Modal */}
      {showForgotModal && (
        <div className="auth-modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="auth-modal-card animate-slide-up" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="heading-section">Password Reset Protocol</h3>
              <button className="btn-ghost" onClick={() => setShowForgotModal(false)}>✕</button>
            </div>

            {forgotSent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="auth-success-icon" style={{ margin: '0 auto' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-body" style={{ textAlign: 'center' }}>
                  Reset instructions have been dispatched to <strong>{forgotEmail || email || 'your email'}</strong> if an active municipal account exists.
                </p>
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <button className="btn-primary" onClick={() => setShowForgotModal(false)}>
                    Return to Login
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p className="text-small text-secondary">
                  Enter your registered work email address. In local prototype mode, default workspace access is preconfigured for <code>operator@wastesignal.io</code>.
                </p>
                <div className="auth-field">
                  <label className="auth-label">Work Email</label>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="operator@organization.gov"
                    value={forgotEmail || email}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                </div>
                <div className="btn-group" style={{ justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button className="btn-secondary" onClick={() => setShowForgotModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={() => setForgotSent(true)}>
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
