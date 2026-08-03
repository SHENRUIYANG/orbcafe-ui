'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ORB_TOKENS } from '../../config/orbis-tokens';
import type { OrbMode, OrbTokens } from '../../config/orbis-tokens';

export type OrbModeSetting = OrbMode | 'system';

interface OrbisModeContextValue {
  /** Effective mode after resolving `system`. */
  mode: OrbMode;
  /** The configured setting (may be `system`). */
  setting: OrbModeSetting;
}

const OrbisModeContext = createContext<OrbisModeContextValue>({ mode: 'light', setting: 'light' });

export interface OrbisModeProviderProps {
  /** Controlled mode setting. Defaults to 'light'. */
  mode?: OrbModeSetting;
  /** Default mode for uncontrolled usage. */
  defaultMode?: OrbModeSetting;
  children: ReactNode;
}

const applyModeToDocument = (mode: OrbMode) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('orb-dark', mode === 'dark');
  root.dataset.orbMode = mode;
  root.style.colorScheme = mode;
};

/**
 * Provides the ORBIS light/dark mode to all ORBCAFE components.
 *
 * Central color-mode provider: it toggles the `orb-dark` class and
 * `data-orb-mode` attribute on `<html>` so the CSS variables in `orbis.css`
 * switch, and exposes the resolved mode through `useOrbMode()`.
 *
 * `CAppPageLayout` and `PAppPageLayout` already render this provider with
 * their persisted mode setting, so app-level usage is only needed for
 * standalone surfaces (e.g. a login page without the app shell).
 */
export const OrbisModeProvider = ({ mode, defaultMode = 'light', children }: OrbisModeProviderProps) => {
  const setting = mode ?? defaultMode;
  const [systemMode, setSystemMode] = useState<OrbMode>('light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemMode(media.matches ? 'dark' : 'light');
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const effectiveMode: OrbMode = setting === 'system' ? (hydrated ? systemMode : 'light') : setting;

  useEffect(() => {
    applyModeToDocument(effectiveMode);
  }, [effectiveMode]);

  const value = useMemo<OrbisModeContextValue>(
    () => ({ mode: effectiveMode, setting }),
    [effectiveMode, setting],
  );

  return <OrbisModeContext.Provider value={value}>{children}</OrbisModeContext.Provider>;
};

/** Effective ORBIS mode resolved from the nearest OrbisModeProvider (defaults to light). */
export const useOrbMode = (): OrbMode => useContext(OrbisModeContext).mode;

/** ORBIS token hex values for the current mode — for JS-driven rendering (SVG charts, canvas). */
export const useOrbTokens = (): OrbTokens => ORB_TOKENS[useOrbMode()];
