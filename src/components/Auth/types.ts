import type { CSSProperties, ReactNode } from 'react';

export type AuthPageMode = 'login' | 'register' | 'forgot';

export interface AuthLoginPayload {
  username: string;
  password: string;
  remember: boolean;
}

export interface AuthRegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export interface AuthForgotPasswordPayload {
  email: string;
}

export interface AuthPageCopy {
  productName?: string;
  headline?: string;
  subheadline?: string;
  /** Small uppercase line at the bottom of the brand panel. */
  brandMeta?: string;
  loginTitle?: string;
  loginSubtitle?: string;
  registerTitle?: string;
  registerSubtitle?: string;
  forgotTitle?: string;
  forgotSubtitle?: string;
}

export interface CAuthPageProps {
  mode?: AuthPageMode;
  defaultMode?: AuthPageMode;
  onModeChange?: (mode: AuthPageMode) => void;
  onLogin?: (payload: AuthLoginPayload) => void | Promise<void>;
  onRegister?: (payload: AuthRegisterPayload) => void | Promise<void>;
  onForgotPassword?: (payload: AuthForgotPasswordPayload) => void | Promise<void>;
  loading?: boolean;
  logo?: ReactNode;
  copy?: AuthPageCopy;
  /** Inline style override on the root frame. */
  sx?: CSSProperties;
}
