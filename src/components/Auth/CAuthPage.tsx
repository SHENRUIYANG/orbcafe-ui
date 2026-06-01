'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Divider,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import { CButton } from '../Atoms/CButton';
import { CCheckbox } from '../Atoms/CCheckbox';
import { CPaper } from '../Atoms/CPaper';
import { CTextField } from '../Atoms/CTextField';
import type {
  AuthForgotPasswordPayload,
  AuthLoginPayload,
  AuthPageMode,
  AuthRegisterPayload,
  CAuthPageProps,
} from './types';

const DEFAULT_COPY = {
  productName: 'ORBCAFE',
  headline: 'Operational workbench',
  subheadline: 'A focused entry point for reports, planning, agent workflows, and enterprise operations.',
  loginTitle: 'Sign in',
  loginSubtitle: 'Use your workspace account to continue.',
  registerTitle: 'Create account',
  registerSubtitle: 'Request a demo workspace user for evaluation.',
  forgotTitle: 'Reset password',
  forgotSubtitle: 'Send a password reset request to your email address.',
};

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
  const theme = useTheme();
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(320px, 0.9fr) minmax(420px, 1.1fr)' },
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #071018 0%, #151515 48%, #101827 100%)'
            : 'linear-gradient(135deg, #eef3f8 0%, #ffffff 52%, #e8f2f0 100%)',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { md: 6, lg: 8 },
          borderRight: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack spacing={4}>
          <Box>{logo}</Box>
          <Stack spacing={2}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'primary.main', textTransform: 'uppercase' }}>
              {text.productName}
            </Typography>
            <Typography sx={{ fontSize: { md: 34, lg: 42 }, lineHeight: 1.06, fontWeight: 800 }}>
              {text.headline}
            </Typography>
            <Typography sx={{ maxWidth: 460, color: 'text.secondary', fontSize: 16, lineHeight: 1.7 }}>
              {text.subheadline}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', fontSize: 13 }}>
          <Typography variant="caption">Reports</Typography>
          <Typography variant="caption">Planning</Typography>
          <Typography variant="caption">Agent UI</Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <CPaper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 460,
            m: 0,
            p: { xs: 2.5, sm: 4 },
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.86)' : 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(18px)',
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 24px 80px rgba(0,0,0,0.34)'
                : '0 24px 80px rgba(15,23,42,0.10)',
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 1 }}>{logo}</Box>
              <Typography sx={{ fontSize: 28, fontWeight: 800 }}>{title}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{subtitle}</Typography>
            </Stack>

            {notice && <Alert severity="success">{notice}</Alert>}

            {activeMode === 'login' && (
              <Box component="form" onSubmit={submitLogin}>
                <Stack spacing={2}>
                  <CTextField
                    label="Email or user ID"
                    value={loginPayload.username}
                    onChange={(event) => setLoginPayload((prev) => ({ ...prev, username: event.target.value }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <CTextField
                    label="Password"
                    type="password"
                    value={loginPayload.password}
                    onChange={(event) => setLoginPayload((prev) => ({ ...prev, password: event.target.value }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <CCheckbox
                      label="Remember me"
                      checked={loginPayload.remember}
                      onChange={(event) => setLoginPayload((prev) => ({ ...prev, remember: event.target.checked }))}
                    />
                    <CButton type="button" variant="text" size="small" onClick={() => setMode('forgot')}>
                      Forgot?
                    </CButton>
                  </Box>
                  <CButton type="submit" size="large" disabled={loading}>
                    Sign in
                  </CButton>
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                    New user?{' '}
                    <CButton type="button" variant="text" size="small" onClick={() => setMode('register')} sx={{ minWidth: 0, p: 0 }}>
                      Register
                    </CButton>
                  </Typography>
                </Stack>
              </Box>
            )}

            {activeMode === 'register' && (
              <Box component="form" onSubmit={submitRegister}>
                <Stack spacing={2}>
                  <CTextField
                    label="Full name"
                    value={registerPayload.name}
                    onChange={(event) => setRegisterPayload((prev) => ({ ...prev, name: event.target.value }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <CTextField
                    label="Work email"
                    type="email"
                    value={registerPayload.email}
                    onChange={(event) => setRegisterPayload((prev) => ({ ...prev, email: event.target.value }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MailOutlineIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <CTextField
                    label="Password"
                    type="password"
                    value={registerPayload.password}
                    onChange={(event) => setRegisterPayload((prev) => ({ ...prev, password: event.target.value }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKeyOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <CTextField
                    label="Confirm password"
                    type="password"
                    value={registerPayload.confirmPassword}
                    onChange={(event) => setRegisterPayload((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  />
                  <CCheckbox
                    label="I accept the demo workspace terms"
                    checked={registerPayload.acceptedTerms}
                    onChange={(event) => setRegisterPayload((prev) => ({ ...prev, acceptedTerms: event.target.checked }))}
                  />
                  <CButton type="submit" size="large" disabled={loading}>
                    Create demo account
                  </CButton>
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                    Already have an account?{' '}
                    <CButton type="button" variant="text" size="small" onClick={() => setMode('login')} sx={{ minWidth: 0, p: 0 }}>
                      Sign in
                    </CButton>
                  </Typography>
                </Stack>
              </Box>
            )}

            {activeMode === 'forgot' && (
              <Box component="form" onSubmit={submitForgot}>
                <Stack spacing={2}>
                  <CTextField
                    label="Work email"
                    type="email"
                    value={forgotPayload.email}
                    onChange={(event) => setForgotPayload({ email: event.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MailOutlineIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <CButton type="submit" size="large" disabled={loading}>
                    Send reset request
                  </CButton>
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                    Remember your password?{' '}
                    <CButton type="button" variant="text" size="small" onClick={() => setMode('login')} sx={{ minWidth: 0, p: 0 }}>
                      Back to sign in
                    </CButton>
                  </Typography>
                </Stack>
              </Box>
            )}

            <Divider />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Demo credentials: demo@orbcafe.local / orbcafe-demo
            </Typography>
          </Stack>
        </CPaper>
      </Box>
    </Box>
  );
};
