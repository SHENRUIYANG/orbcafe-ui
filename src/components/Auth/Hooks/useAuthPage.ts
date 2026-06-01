'use client';

import { useCallback, useMemo, useState } from 'react';
import type {
  AuthForgotPasswordPayload,
  AuthLoginPayload,
  AuthPageMode,
  AuthRegisterPayload,
  CAuthPageProps,
} from '../types';

export interface UseAuthPageOptions {
  defaultMode?: AuthPageMode;
  onLogin?: (payload: AuthLoginPayload) => void | Promise<void>;
  onRegister?: (payload: AuthRegisterPayload) => void | Promise<void>;
  onForgotPassword?: (payload: AuthForgotPasswordPayload) => void | Promise<void>;
}

export interface UseAuthPageResult {
  mode: AuthPageMode;
  loading: boolean;
  setMode: (mode: AuthPageMode) => void;
  authPageProps: Pick<CAuthPageProps, 'mode' | 'loading' | 'onModeChange' | 'onLogin' | 'onRegister' | 'onForgotPassword'>;
}

export const useAuthPage = ({
  defaultMode = 'login',
  onLogin,
  onRegister,
  onForgotPassword,
}: UseAuthPageOptions = {}): UseAuthPageResult => {
  const [mode, setMode] = useState<AuthPageMode>(defaultMode);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (task?: () => void | Promise<void>) => {
    setLoading(true);
    try {
      await task?.();
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = useCallback((payload: AuthLoginPayload) => run(() => onLogin?.(payload)), [onLogin, run]);
  const handleRegister = useCallback((payload: AuthRegisterPayload) => run(() => onRegister?.(payload)), [onRegister, run]);
  const handleForgotPassword = useCallback(
    (payload: AuthForgotPasswordPayload) => run(() => onForgotPassword?.(payload)),
    [onForgotPassword, run],
  );

  const authPageProps = useMemo<UseAuthPageResult['authPageProps']>(
    () => ({
      mode,
      loading,
      onModeChange: setMode,
      onLogin: handleLogin,
      onRegister: handleRegister,
      onForgotPassword: handleForgotPassword,
    }),
    [handleForgotPassword, handleLogin, handleRegister, loading, mode],
  );

  return {
    mode,
    loading,
    setMode,
    authPageProps,
  };
};
