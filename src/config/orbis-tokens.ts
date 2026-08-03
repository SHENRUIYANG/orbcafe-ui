/**
 * ORBCAFE × ORBIS design tokens (TypeScript side).
 *
 * Single source of truth for JS/TS consumers that cannot read CSS variables
 * (SVG charts, canvas, inline-style computations). Values are the registered
 * ORBIS brand palette plus derived OKLCh mixes — keep in sync with
 * `src/styles/orbis.css`, which is adapted from the official
 * `orbis-reference.css` design handoff.
 *
 * Brand literals: #ffffff #f5f5f5 #555555 #8c8c8c #dbdbdb #154194 #fc4c02
 * Dark literals:  #01091a #0a1526
 */

export type OrbMode = 'light' | 'dark';

export interface OrbTokens {
  canvas: string;
  surface: string;
  surface2: string;
  surface3: string;
  fg: string;
  muted: string;
  border: string;
  primary: string;
  onPrimary: string;
  link: string;
  p50: string;
  p100: string;
  p200: string;
  p300: string;
  p600: string;
  p700: string;
  accent: string;
  err: string;
  errBg: string;
  warnBg: string;
  hover: string;
  selected: string;
  focusRing: string;
  focusSolid: string;
  disabledFg: string;
  disabledBg: string;
  chartGrid: string;
  chartText: string;
  track: string;
  shadow1: string;
  shadow2: string;
  shadow3: string;
}

/**
 * Light mode. Derived tints documented with their OKLCh mix formula from the
 * handoff; computed hex values are used so charts render identically in
 * environments where we cannot resolve color-mix() from JS.
 */
export const ORB_LIGHT: OrbTokens = {
  canvas: '#ffffff',
  surface: '#f5f5f5',
  surface2: '#f5f5f5',
  surface3: '#f5f5f5',
  fg: '#555555',
  muted: '#8c8c8c',
  border: '#dbdbdb',
  primary: '#154194',
  onPrimary: '#ffffff',
  link: '#154194',
  // primary mixes on white: 6% / 14% / 28% / 45%
  p50: '#f0f3f9',
  p100: '#dce4f1',
  p200: '#bac9e3',
  p300: '#91a8d1',
  // primary mixes toward black: 85% / 70% primary
  p600: '#0f3276',
  p700: '#08255a',
  accent: '#fc4c02',
  // error = orange + black 25%; errBg = orange 7% on white; warnBg = orange 8%
  err: '#ac3101',
  errBg: '#fbf1ee',
  warnBg: '#fef3ef',
  hover: 'rgba(21, 65, 148, 0.06)',
  selected: 'rgba(21, 65, 148, 0.10)',
  focusRing: 'rgba(21, 65, 148, 0.18)',
  focusSolid: '#154194',
  disabledFg: '#a3a3a3', // fg 45% on white
  disabledBg: '#ececec', // fg 8% on white
  chartGrid: '#dbdbdb',
  chartText: '#8c8c8c',
  track: '#f5f5f5',
  shadow1: '0 1px 2px rgba(1,9,26,.05),0 2px 6px rgba(1,9,26,.06)',
  shadow2: '0 4px 14px rgba(1,9,26,.10)',
  shadow3: '0 12px 32px rgba(1,9,26,.16)',
};

/** Dark mode per handoff (canvas #01091a, surface #0a1526). */
export const ORB_DARK: OrbTokens = {
  canvas: '#01091a',
  surface: '#0a1526',
  surface2: '#061324', // +white 5%
  surface3: '#0e1b2b', // +white 9%
  fg: '#ffffff',
  muted: 'rgba(255,255,255,0.7)',
  border: 'rgba(255,255,255,0.12)',
  primary: '#154194',
  onPrimary: '#ffffff',
  link: '#91a8d1', // primary-300 equivalent for text accents
  p50: '#0d1f42', // primary 22% on #01091a
  p100: '#12305f', // primary 32% on #01091a
  p200: '#bac9e3', // primary 28% on white
  p300: '#91a8d1', // primary 45% on white
  p600: '#c1cee7', // primary 85% on white (lightened for dark bg)
  p700: '#a4b8dd', // primary 60% on white
  accent: '#fc4c02',
  err: '#d53f01', // orange + black 12%
  errBg: '#2a150c', // orange 16% on #01091a
  warnBg: '#2b170d', // orange 18% on #01091a
  hover: 'rgba(255,255,255,0.08)',
  selected: 'rgba(21, 65, 148, 0.45)',
  focusRing: 'rgba(145, 168, 209, 0.45)',
  focusSolid: '#91a8d1',
  disabledFg: 'rgba(255,255,255,0.38)',
  disabledBg: 'rgba(255,255,255,0.07)',
  chartGrid: 'rgba(255,255,255,0.12)',
  chartText: 'rgba(255,255,255,0.7)',
  track: 'rgba(255,255,255,0.1)',
  shadow1: '0 1px 2px rgba(0,0,0,.4),0 2px 8px rgba(0,0,0,.35)',
  shadow2: '0 4px 16px rgba(0,0,0,.5)',
  shadow3: '0 12px 32px rgba(0,0,0,.55)',
};

export const ORB_TOKENS: Record<OrbMode, OrbTokens> = {
  light: ORB_LIGHT,
  dark: ORB_DARK,
};

/** Montserrat-first font stack per handoff. */
export const ORB_FONT_STACK =
  '"Montserrat", system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

/** Chart series order mandated by the handoff: primary → p300 → muted → p700, repeat. */
export const orbChartSeries = (mode: OrbMode): string[] => {
  const t = ORB_TOKENS[mode];
  return [t.primary, t.p300, t.muted, t.p700];
};

/** Radius / motion constants shared by JS-driven components. */
export const ORB_RADIUS = 10;
export const ORB_TRANSITION_FAST = '0.2s ease';
