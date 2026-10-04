import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Auth.css';

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<{ name: string; email: string; workspace: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }
    if (!organization.trim()) {
      setErrorMessage('Organization or municipality name is required.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signup({
        name,
        email,
        organization,
        password,
      });

      if (res.success && res.user) {
        setCreatedUser({
          name: res.user.name,
          email: res.user.email,
          workspace: res.user.workspace,
        });
      } else {
        setErrorMessage(res.error || 'Failed to create workspace account.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during account creation.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-container animate-fade-in">
      {/* Left Column: Story (~55%) */}
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
            Operational foresight<br />
            from your existing records.
          </h1>

          <div className="auth-story-bullets">
            <div className="auth-bullet-item">
              <span className="auth-bullet-dot" />
              <span>Connect municipal records, telemetry, or synthetic demo logs.</span>
            </div>
            <div className="auth-bullet-item">
              <span className="auth-bullet-dot" />
              <span>Transparent signal weighting with zero black-box metrics.</span>
            </div>
            <div className="auth-bullet-item">
              <span className="auth-bullet-dot" />
              <span>Staged dispatch recommendations for field operations.</span>
            </div>
          </div>
        </div>

        {/* Visual Architecture Representation */}
        <div className="auth-visualization">
          <div className="auth-viz-header">
            <span className="text-meta">ENTERPRISE ONBOARDING PIPELINE</span>
            <span className="badge badge-low">READY TO INGEST</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span className="text-small" style={{ fontWeight: 500 }}>01. Dataset Schema Detection</span>
              <span className="text-meta text-mono" style={{ color: 'var(--olive)' }}>CSV / JSON</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span className="text-small" style={{ fontWeight: 500 }}>02. Recurrence & Risk Scoring</span>
              <span className="text-meta text-mono">0–100 INDEX</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span className="text-small" style={{ fontWeight: 500 }}>03. Dispatch Staging & Webhooks</span>
              <span className="text-meta text-mono" style={{ color: 'var(--terracotta)' }}>STANDBY</span>
            </div>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-meta" style={{ fontSize: '9px' }}>SECURITY POSTURE</span>
            <span className="text-meta text-mono" style={{ fontSize: '10px' }}>AES-256 TELEMETRY ISOLATION</span>
          </div>
        </div>

        <div className="auth-story-footer">
          <span>WasteSignal Operational Intelligence Platform</span>
          <span>© 2026 WasteSignal</span>
        </div>
      </div>

      {/* Right Column: Sign Up Form (~45%) */}
      <div className="auth-form-col">
        <div className="auth-form-wrapper">
          {createdUser ? (
            /* Success confirmation card */
            <div className="auth-success-card animate-slide-up">
              <div className="auth-success-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div>
                <span className="text-meta" style={{ color: 'var(--olive)' }}>REGISTRATION COMPLETE</span>
                <h2 className="heading-section" style={{ fontSize: 'var(--text-2xl)', marginTop: '4px' }}>
                  Workspace created.
                </h2>
                <p className="text-body text-secondary" style={{ marginTop: '6px' }}>
                  Your WasteSignal workspace is ready for <strong>{createdUser.name}</strong>.
                </p>
              </div>

              <div style={{ width: '100%', padding: '12px 16px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="text-meta" style={{ fontSize: '9px' }}>WORKSPACE NAME</span>
                  <span className="text-small text-mono" style={{ fontWeight: 600 }}>{createdUser.workspace}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-meta" style={{ fontSize: '9px' }}>PRIMARY SEED</span>
                  <span className="text-small text-mono">SYNTHETIC DEMO PRE-LOADED</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={() => navigate('/dashboard')}
              >
                Enter Workspace
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <div className="auth-header-block">
                <div className="auth-logo-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <span className="text-meta" style={{ letterSpacing: '0.12em', color: 'var(--deep-graphite)' }}>WASTESIGNAL</span>
                </div>
                <h2 className="auth-title">Build your WasteSignal workspace.</h2>
                <p className="auth-subtitle">Configure predictive intelligence for your waste operations.</p>
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
                  <label className="auth-label" htmlFor="full-name">Full Name</label>
                  <input
                    id="full-name"
                    type="text"
                    className="auth-input"
                    placeholder="Elena Rostova"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="signup-email">Work Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    className="auth-input"
                    placeholder="elena@metrowaste.gov"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="organization">Organization / Municipality</label>
                  <input
                    id="organization"
                    type="text"
                    className="auth-input"
                    placeholder="Metropolitan Public Works"
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="auth-label" htmlFor="signup-password">Password</label>
                    <span className="text-meta" style={{ fontSize: '9px' }}>8+ CHARACTERS</span>
                  </div>
                  <div className="auth-input-wrap">
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password"
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

                <div className="auth-field">
                  <label className="auth-label" htmlFor="confirm-password">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`btn-primary ${isSubmitting ? 'btn-loading' : ''}`}
                  style={{ width: '100%', marginTop: '4px' }}
                  disabled={isSubmitting}
                >
                  {!isSubmitting && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                  {isSubmitting ? 'Configuring Workspace…' : 'Create Workspace'}
                </button>
              </form>

              <div className="auth-footer-link">
                <span>Already have an account?</span>
                <Link to="/login">Sign In</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
