'use client';

import React, { createContext, useContext, useMemo } from 'react';
import {
  ORBCAFE_I18N_MESSAGES,
  type OrbcafeLocale,
  type OrbcafeMessageKey,
  type OrbcafeMessageParams,
  type OrbcafeLocaleMessages,
} from './messages';

export interface OrbcafeI18nContextValue {
  locale: OrbcafeLocale;
  t: (key: OrbcafeMessageKey, params?: OrbcafeMessageParams) => string;
}

export interface OrbcafeI18nProviderProps {
  locale?: OrbcafeLocale;
  messages?: Partial<Record<OrbcafeLocale, Partial<OrbcafeLocaleMessages>>>;
  children: React.ReactNode;
}

const interpolate = (template: string, params?: OrbcafeMessageParams): string => {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, token: string) => {
    const value = params[token];
    return value === undefined || value === null ? '' : String(value);
  });
};

const defaultContext: OrbcafeI18nContextValue = {
  locale: 'en',
  t: (key, params) => interpolate(ORBCAFE_I18N_MESSAGES.en[key] || key, params),
};

const OrbcafeI18nContext = createContext<OrbcafeI18nContextValue>(defaultContext);

export const OrbcafeI18nProvider = ({
  locale = 'en',
  messages,
  children,
}: OrbcafeI18nProviderProps) => {
  const value = useMemo<OrbcafeI18nContextValue>(() => {
    const localeMessages = ORBCAFE_I18N_MESSAGES[locale] || ORBCAFE_I18N_MESSAGES.en;
    const localeOverrides = messages?.[locale] || {};
    const merged = { ...ORBCAFE_I18N_MESSAGES.en, ...localeMessages, ...localeOverrides };

    return {
      locale,
      t: (key, params) => interpolate(merged[key] || key, params),
    };
  }, [locale, messages]);

  return <OrbcafeI18nContext.Provider value={value}>{children}</OrbcafeI18nContext.Provider>;
};

export const useOrbcafeI18n = (): OrbcafeI18nContextValue => useContext(OrbcafeI18nContext);

