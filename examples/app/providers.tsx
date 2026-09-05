'use client';

import React, { useEffect, useState } from 'react';
import { GlobalMessage, OrbisModeProvider } from 'orbcafe-ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Providers({ children }: { children: any }) {
  const modeStorageKey = 'orbcafe:page-layout-mode';
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedMode = window.localStorage.getItem(modeStorageKey);
      if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
        // Hydrate the persisted mode before rendering the examples shell.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMode(savedMode);
      }
    } catch {
      // ignore storage access failures
    }
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  return (
    <OrbisModeProvider mode={mode}>
      <GlobalMessage />
      {children}
    </OrbisModeProvider>
  );
}
