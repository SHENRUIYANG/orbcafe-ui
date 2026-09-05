'use client';

import { useEffect, useState } from 'react';
import { CMenu, Check } from 'orbcafe-ui';

/**
 * Brand theme switcher for the examples header. Lists the design systems
 * published in the developer's local Open Design app (served live by
 * /api/brand-themes) and applies one by injecting its generated theme-pack
 * CSS as a <link> appended after the base styles, so every --orb-* override
 * wins the cascade. Selection persists in localStorage. Renders nothing when
 * Open Design is not installed or no preset is published.
 */

const LINK_ID = 'orbcafe-brand-theme';
const STORAGE_KEY = 'orbcafe-examples:brand-theme';

interface BrandThemePreset {
  slug: string;
  title: string;
  updatedAt: string | null;
}

const applyTheme = (slug: string, presets: BrandThemePreset[]) => {
  let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (!slug) {
    link?.remove();
    return;
  }
  const preset = presets.find((p) => p.slug === slug);
  if (!preset) return;
  if (!link) {
    link = document.createElement('link');
    link.id = LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  const version = preset.updatedAt ? `?v=${encodeURIComponent(preset.updatedAt)}` : '';
  link.href = `/api/brand-themes/${slug}${version}`;
};

// No palette glyph exists in the bundled SAP-icons set, so the trigger uses
// this inline outline icon instead.
const PaletteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22a10 10 0 1 1 10-10c0 4.9-3.5 5.5-5.5 5.5h-1.7c-.8 0-1.3.7-1.3 1.5 0 .7.3 1.1.3 1.7 0 .7-.6 1.3-1.8 1.3z" />
    <circle cx="7.5" cy="11.5" r="0.5" fill="currentColor" />
    <circle cx="10.5" cy="7.5" r="0.5" fill="currentColor" />
    <circle cx="15" cy="7.5" r="0.5" fill="currentColor" />
    <circle cx="17.5" cy="11.5" r="0.5" fill="currentColor" />
  </svg>
);

export const BrandThemeSwitcher = () => {
  const [presets, setPresets] = useState<BrandThemePreset[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/brand-themes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { presets?: BrandThemePreset[] } | null) => {
        if (cancelled || !data?.presets?.length) return;
        setPresets(data.presets);
        const stored = window.localStorage.getItem(STORAGE_KEY) ?? '';
        if (stored && data.presets.some((p) => p.slug === stored)) {
          setActive(stored);
          applyTheme(stored, data.presets);
        } else if (stored) {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (presets.length === 0) return null;

  const select = (slug: string) => {
    setActive(slug);
    applyTheme(slug, presets);
    if (slug) window.localStorage.setItem(STORAGE_KEY, slug);
    else window.localStorage.removeItem(STORAGE_KEY);
  };

  const activeCheck = <Check size={13} style={{ color: 'var(--orb-primary)' }} />;
  const activeTitle = presets.find((p) => p.slug === active)?.title;

  return (
    <CMenu
      triggerLabel="Brand theme"
      trigger={
        <button
          type="button"
          className="orb-icon-btn"
          title={activeTitle ? `Brand theme: ${activeTitle}` : 'Brand theme (Open Design)'}
          aria-label="Brand theme (Open Design)"
        >
          <PaletteIcon />
        </button>
      }
      items={[
        {
          label: 'Default (ORBIS)',
          icon: active === '' ? activeCheck : undefined,
          onClick: () => select(''),
        },
        ...presets.map((p) => ({
          label: p.title,
          icon: active === p.slug ? activeCheck : undefined,
          onClick: () => select(p.slug),
        })),
      ]}
      align="end"
    />
  );
};
