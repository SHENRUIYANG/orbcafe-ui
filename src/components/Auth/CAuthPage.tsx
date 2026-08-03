'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Lock, Mail, User } from '@/components/Icons';
import { CAlert } from '../Atoms/CAlert';
import { CButton } from '../Atoms/CButton';
import { CCheckbox } from '../Atoms/CCheckbox';
import { CTextField } from '../Atoms/CTextField';
import type {
  AuthForgotPasswordPayload,
  AuthLoginPayload,
  AuthPageMode,
  AuthRegisterPayload,
  CAuthPageProps,
} from './types';

const DEFAULT_COPY = {
  productName: 'ORBCAFE — Enterprise suite',
  headline: 'We digitalize you.',
  subheadline: 'One sign-in for planning, production and analytics across your value chain.',
  brandMeta: 'ORBCAFE · Enterprise manufacturing suite',
  loginTitle: 'Sign in',
  loginSubtitle: 'Use your corporate account to continue.',
  registerTitle: 'Create account',
  registerSubtitle: 'Request a demo workspace user for evaluation.',
  forgotTitle: 'Reset password',
  forgotSubtitle: 'Send a password reset request to your email address.',
};

/**
 * ORBIS login page (per orbcafe-orbis-login-reference.html):
 * dark campaign brand panel (#01091a, CSS diamond lattice, one 2px orange
 * rule) beside a quiet form surface. All form logic, modes, callbacks and
 * breakpoints of the previous implementation are retained — this is a
 * color/type/texture pass. The logo slot stays host-supplied.
 */
export const CAuthPage = ({
  mode,
  defaultMode = 'login',
  onModeChange,
  onLogin,
  onRegister,
  onForgotPassword,
  loading = false,
  logo,
  copy,
  sx,
}: CAuthPageProps) => {
  const isControlled = mode !== undefined;
  const [internalMode, setInternalMode] = useState<AuthPageMode>(defaultMode);
  const activeMode = mode ?? internalMode;
  const text = useMemo(() => ({ ...DEFAULT_COPY, ...copy }), [copy]);

  const [loginPayload, setLoginPayload] = useState<AuthLoginPayload>({
    username: 'demo@orbcafe.local',
    password: 'orbcafe-demo',
    remember: true,
  });
  const [registerPayload, setRegisterPayload] = useState<AuthRegisterPayload>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });
  const [forgotPayload, setForgotPayload] = useState<AuthForgotPasswordPayload>({
    email: '',
  });
  const [notice, setNotice] = useState<string>('');

  const setMode = (nextMode: AuthPageMode) => {
    if (!isControlled) {
      setInternalMode(nextMode);
    }
    setNotice('');
    onModeChange?.(nextMode);
  };

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onLogin?.(loginPayload);
    setNotice('Demo login accepted. No real authentication request was sent.');
  };

  const submitRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onRegister?.(registerPayload);
    setNotice('Demo registration saved locally for this screen.');
  };

  const submitForgot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onForgotPassword?.(forgotPayload);
    setNotice('Demo reset link request created. No email was sent.');
  };

  const title =
    activeMode === 'login'
      ? text.loginTitle
      : activeMode === 'register'
        ? text.registerTitle
        : text.forgotTitle;
  const subtitle =
    activeMode === 'login'
      ? text.loginSubtitle
      : activeMode === 'register'
        ? text.registerSubtitle
        : text.forgotSubtitle;

  return (
    <div className="orb-auth-frame orb-root" style={sx}>
      {/* ---- Brand panel: #01091a + diamond lattice + one 2px orange rule ---- */}
      <div className="orb-auth-brand">
        <span
          className="orb-auth-dia"
          style={{ width: 230, height: 230, right: -70, bottom: -60 }}
        />
        <span
          className="orb-auth-dia orb-auth-dia-sm-hide"
          style={{ width: 140, height: 140, right: 120, bottom: 80, borderColor: 'rgba(255,255,255,.09)' }}
        />
        <span
          className="orb-auth-dia orb-auth-dia-sm-hide"
          style={{
            width: 76,
            height: 76,
            right: 60,
            bottom: 170,
            background: 'rgba(21,65,148,.35)',
            borderColor: 'rgba(255,255,255,.2)',
          }}
        />
        {logo ? (
          <span style={{ alignSelf: 'flex-start', position: 'relative' }}>{logo}</span>
        ) : (
          <span className="orb-logo-slot">Host logo</span>
        )}
        <div className="orb-auth-claim">
          <div className="orb-auth-rule" />
          <h2>{text.headline}</h2>
          <p>{text.subheadline}</p>
        </div>
        <div className="orb-auth-meta">{text.brandMeta}</div>
      </div>

      {/* ---- Form surface ---- */}
      <div className="orb-auth-form">
        <div className="orb-auth-card">
          <span className="orb-overline" style={{ letterSpacing: '0.12em' }}>
            {text.productName}
          </span>
          <h1 className="orb-h2" style={{ margin: 0 }}>
            {title}
          </h1>
          <p className="orb-body-dense" style={{ color: 'var(--orb-muted)', margin: '-10px 0 0' }}>
            {subtitle}
          </p>

          {notice && <CAlert severity="success">{notice}</CAlert>}

          {activeMode === 'login' && (
            <form onSubmit={submitLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CTextField
                label="Email"
                type="email"
                autoComplete="username"
                value={loginPayload.username}
                onChange={(event) => setLoginPayload((prev) => ({ ...prev, username: event.target.value }))}
                startAdornment={<User size={15} strokeWidth={1.8} />}
              />
              <CTextField
                label="Password"
                type="password"
                autoComplete="current-password"
                value={loginPayload.password}
                onChange={(event) => setLoginPayload((prev) => ({ ...prev, password: event.target.value }))}
                startAdornment={<Lock size={15} strokeWidth={1.8} />}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <CCheckbox
                  label="Remember me"
                  checked={loginPayload.remember}
                  onChange={(event) => setLoginPayload((prev) => ({ ...prev, remember: event.target.checked }))}
                />
                <button type="button" className="orb-link" onClick={() => setMode('forgot')}>
                  Forgot password?
                </button>
              </div>
              <CButton type="submit" size="large" block loading={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </CButton>
              <p className="orb-meta" style={{ textAlign: 'center', margin: 0 }}>
                New user?{' '}
                <button type="button" className="orb-link" onClick={() => setMode('register')}>
                  Register
                </button>
              </p>
            </form>
          )}

          {activeMode === 'register' && (
            <form onSubmit={submitRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CTextField
                label="Full name"
                value={registerPayload.name}
                onChange={(event) => setRegisterPayload((prev) => ({ ...prev, name: event.target.value }))}
                startAdornment={<User size={15} strokeWidth={1.8} />}
              />
              <CTextField
                label="Work email"
                type="email"
                autoComplete="username"
                value={registerPayload.email}
                onChange={(event) => setRegisterPayload((prev) => ({ ...prev, email: event.target.value }))}
                startAdornment={<Mail size={15} strokeWidth={1.8} />}
              />
              <CTextField
                label="Password"
                type="password"
                autoComplete="new-password"
                value={registerPayload.password}
                onChange={(event) => setRegisterPayload((prev) => ({ ...prev, password: event.target.value }))}
                startAdornment={<Lock size={15} strokeWidth={1.8} />}
              />
              <CTextField
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                value={registerPayload.confirmPassword}
                onChange={(event) => setRegisterPayload((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              />
              <CCheckbox
                label="I accept the demo workspace terms"
                checked={registerPayload.acceptedTerms}
                onChange={(event) => setRegisterPayload((prev) => ({ ...prev, acceptedTerms: event.target.checked }))}
              />
              <CButton type="submit" size="large" block loading={loading}>
                Create demo account
              </CButton>
              <p className="orb-meta" style={{ textAlign: 'center', margin: 0 }}>
                Already have an account?{' '}
                <button type="button" className="orb-link" onClick={() => setMode('login')}>
                  Sign in
                </button>
              </p>
            </form>
          )}

          {activeMode === 'forgot' && (
            <form onSubmit={submitForgot} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CTextField
                label="Work email"
                type="email"
                autoComplete="username"
                value={forgotPayload.email}
                onChange={(event) => setForgotPayload({ email: event.target.value })}
                startAdornment={<Mail size={15} strokeWidth={1.8} />}
              />
              <CButton type="submit" size="large" block loading={loading}>
                Send reset request
              </CButton>
              <p className="orb-meta" style={{ textAlign: 'center', margin: 0 }}>
                Remember your password?{' '}
                <button type="button" className="orb-link" onClick={() => setMode('login')}>
                  Back to sign in
                </button>
              </p>
            </form>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              font: '500 10px/1 var(--orb-font)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--orb-muted)',
            }}
          >
            <span style={{ flex: 1, height: 1, background: 'var(--orb-border)' }} />
            or
            <span style={{ flex: 1, height: 1, background: 'var(--orb-border)' }} />
          </div>
          <CButton variant="neutral" size="large" block>
            Continue with corporate SSO
          </CButton>
          <p className="orb-meta" style={{ textAlign: 'center', fontWeight: 300, margin: 0 }}>
            Protected by corporate single sign-on.
            <br />
            Demo credentials: demo@orbcafe.local / orbcafe-demo
          </p>
        </div>
      </div>
    </div>
  );
};
