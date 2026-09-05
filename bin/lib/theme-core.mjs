/**
 * theme-core.mjs — Open Design preset → ORBCAFE theme pack. Core library.
 *
 * Zero-dependency, side-effect-free helpers used by both the published
 * `orbcafe-theme` CLI (bin/orbcafe-theme.mjs) and the repo-internal
 * scripts/build-theme.mjs.
 *
 * Open Design stores design systems on the developer's machine at:
 *   <app-support>/Open Design/namespaces/<ns>/data/design-systems/<slug>/
 *     ├── metadata.json / brand.json
 *     ├── system/tokens.default.json   (Ant-Design-style tokens, light)
 *     ├── system/tokens.dark.json      (same keys, dark)
 *     └── fonts/ + fonts.css           (optional brand fonts)
 *
 * Only BASE --orb-* tokens are overridden; every derived token re-derives
 * through color-mix() inside orbis.css.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, copyFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { homedir, platform } from 'node:os'

/* ----------------------------------------------------- Open Design discovery */

/** Candidate Open Design data roots for the current platform (existing only). */
export const findOpenDesignRoots = () => {
  const home = homedir()
  const os = platform()
  const candidates = []
  if (process.env.OPEN_DESIGN_HOME) candidates.push(process.env.OPEN_DESIGN_HOME)
  if (os === 'darwin') candidates.push(join(home, 'Library', 'Application Support', 'Open Design'))
  if (os === 'win32') candidates.push(join(process.env.APPDATA ?? join(home, 'AppData', 'Roaming'), 'Open Design'))
  if (os === 'linux') candidates.push(join(process.env.XDG_CONFIG_HOME ?? join(home, '.config'), 'Open Design'))
  return [...new Set(candidates.map((p) => resolve(p)))].filter((p) => existsSync(p))
}

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

/**
 * Scan all roots for design-system presets.
 * Returns [{ slug, title, updatedAt, dir }] sorted by title; duplicate slugs
 * across namespaces resolve to the newest updatedAt.
 */
export const listPresets = (roots = findOpenDesignRoots()) => {
  const bySlug = new Map()
  for (const root of roots) {
    const nsDir = join(root, 'namespaces')
    if (!existsSync(nsDir)) continue
    for (const ns of readdirSync(nsDir)) {
      const dsDir = join(nsDir, ns, 'data', 'design-systems')
      if (!existsSync(dsDir)) continue
      for (const slug of readdirSync(dsDir)) {
        const dir = join(dsDir, slug)
        if (!existsSync(join(dir, 'system', 'tokens.default.json'))) continue
        const brand = readJson(join(dir, 'brand.json'))
        const meta = readJson(join(dir, 'metadata.json'))
        const entry = {
          slug,
          title: brand?.name ?? meta?.title ?? slug,
          updatedAt: meta?.updatedAt ?? null,
          dir,
        }
        const prev = bySlug.get(slug)
        if (!prev || String(entry.updatedAt) > String(prev.updatedAt)) bySlug.set(slug, entry)
      }
    }
  }
  return [...bySlug.values()].sort((a, b) => a.title.localeCompare(b.title))
}

/* --------------------------------------------------------- color utilities */

/** sRGB hex → [r,g,b] 0..1 */
const hexToRgb = (hex) => {
  const h = hex.replace('#', '')
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255)
}
const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
const linearToSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)

/** sRGB hex → OKLCh [L, C, h] */
export const hexToOklch = (hex) => {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear)
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
  const C = Math.sqrt(a * a + bb * bb)
  let h = (Math.atan2(bb, a) * 180) / Math.PI
  if (h < 0) h += 360
  return [L, C, h]
}

/** OKLCh [L, C, h] → sRGB hex (gamut-clamped) */
const oklchToHex = ([L, C, h]) => {
  const hr = (h * Math.PI) / 180
  const a = C * Math.cos(hr)
  const bb = C * Math.sin(hr)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * bb
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bb
  const s_ = L - 0.0894841775 * a - 1.291485548 * bb
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  const to255 = (x) => Math.round(Math.min(1, Math.max(0, linearToSrgb(x))) * 255)
  return `#${[r, g, b].map((x) => to255(x).toString(16).padStart(2, '0')).join('')}`
}

/** Replicates CSS `color-mix(in oklch, A p%, B)` — shorter-arc hue, p in 0..1. */
const mix = (hexA, p, hexB) => {
  const [L1, C1, h1] = hexToOklch(hexA)
  const [L2, C2, h2] = hexToOklch(hexB)
  let dh = h2 - h1
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360
  // achromatic hues are "powerless": take the chromatic one's hue
  const h = C1 < 1e-4 ? h2 : C2 < 1e-4 ? h1 : (h1 + dh * (1 - p) + 360) % 360
  return oklchToHex([L1 * p + L2 * (1 - p), C1 * p + C2 * (1 - p), h])
}

/** rgba() string from a hex + alpha (mirrors primary-alpha tokens in JS). */
const rgbaOf = (hex, alpha) => {
  const [r, g, b] = hexToRgb(hex).map((x) => Math.round(x * 255))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** First family of a CSS font stack, unquoted. */
const firstFamily = (stack) => {
  const first = String(stack ?? '').split(',')[0].trim().replace(/^['"]|['"]$/g, '')
  return first || null
}

/* ----------------------------------------------------------------- mapping */

const BLACK = '#000000'
const WHITE = '#ffffff'

/**
 * Base-token overrides for one mode. Colors + fonts by default; `full` also
 * maps borderRadius → --orb-r.
 */
const mapMode = (t, mode, { full = false } = {}) => {
  const o = {}
  const put = (k, v) => {
    if (v !== undefined && v !== null && v !== '') o[k] = v
  }
  if (mode === 'light') {
    put('--orb-primary', t.colorPrimary)
    put('--orb-accent', t.colorWarning)
    if (t.colorError && t.colorError !== t.colorWarning) put('--orb-err', t.colorError)
    put('--orb-fg', t.colorText)
    put('--orb-fg-strong', t.colorText)
    put('--orb-muted', t.colorTextSecondary)
    put('--orb-canvas', t.colorBgContainer)
    put('--orb-surface', t.colorFillSecondary)
    put('--orb-border', t.colorBorder)
    if (t.colorLink && t.colorLink !== t.colorPrimary) put('--orb-link', t.colorLink)
  } else {
    put('--orb-primary', t.colorPrimary)
    put('--orb-accent', t.colorWarning)
    if (t.colorError && t.colorError !== t.colorWarning) put('--orb-err', t.colorError)
    put('--orb-fg', t.colorText)
    put('--orb-fg-strong', t.colorText)
    put('--orb-muted', t.colorTextSecondary)
    put('--orb-canvas', t.colorBgLayout)
    put('--orb-surface', t.colorBgContainer)
    put('--orb-surface-2', t.colorBgElevated)
    put('--orb-border', t.colorBorder)
    put('--orb-link', t.colorPrimaryText ?? t.colorLink)
  }
  const brand0 = firstFamily(t.fontFamily)
  if (brand0) put('--orb-font-brand', `"${brand0}"`)
  if (full && typeof t.borderRadius === 'number') put('--orb-r', `${t.borderRadius}px`)
  return o
}

const emitBlock = (selector, vars, indent = '  ') =>
  `${selector} {\n${Object.entries(vars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join('\n')}\n}\n`

/** Replicates orbis.css derivation formulas for a full OrbTokens-shaped object. */
const deriveTokens = (t, mode) => {
  const isLight = mode === 'light'
  const canvas = isLight ? t.colorBgContainer : t.colorBgLayout
  const surface = isLight ? t.colorFillSecondary : t.colorBgContainer
  const primary = t.colorPrimary
  const accent = t.colorWarning
  const fg = t.colorText
  const muted = t.colorTextSecondary
  const border = t.colorBorder
  const p50 = mix(primary, isLight ? 0.06 : 0.22, canvas)
  const p100 = mix(primary, isLight ? 0.14 : 0.32, canvas)
  const p200 = mix(primary, 0.28, WHITE)
  const p300 = mix(primary, 0.45, WHITE)
  const p600 = mix(primary, 0.85, isLight ? BLACK : WHITE)
  const p700 = mix(primary, isLight ? 0.7 : 0.6, isLight ? BLACK : WHITE)
  const err =
    t.colorError && t.colorError !== t.colorWarning
      ? t.colorError
      : mix(accent, isLight ? 0.75 : 0.88, BLACK)
  return {
    canvas,
    surface,
    surface2: isLight ? surface : t.colorBgElevated,
    surface3: isLight ? surface : mix(WHITE, 0.09, canvas),
    fg,
    muted,
    border,
    primary,
    onPrimary: WHITE,
    link: isLight ? (t.colorLink ?? primary) : (t.colorPrimaryText ?? t.colorLink ?? p300),
    p50,
    p100,
    p200,
    p300,
    p600,
    p700,
    accent,
    err,
    errBg: mix(accent, isLight ? 0.07 : 0.16, canvas),
    warnBg: mix(accent, isLight ? 0.08 : 0.18, canvas),
    hover: isLight ? rgbaOf(primary, 0.06) : 'rgba(255, 255, 255, 0.08)',
    selected: rgbaOf(primary, isLight ? 0.1 : 0.45),
    focusRing: isLight ? rgbaOf(primary, 0.18) : rgbaOf(p300.slice(0, 7), 0.45),
    focusSolid: isLight ? primary : p300,
    disabledFg: isLight ? mix(fg, 0.45, canvas) : 'rgba(255, 255, 255, 0.38)',
    disabledBg: isLight ? mix(fg, 0.08, canvas) : 'rgba(255, 255, 255, 0.07)',
    chartGrid: isLight ? border : 'rgba(255, 255, 255, 0.12)',
    chartText: isLight ? muted : 'rgba(255, 255, 255, 0.7)',
    track: isLight ? surface : 'rgba(255, 255, 255, 0.1)',
    shadow1: isLight
      ? '0 1px 2px rgba(1,9,26,.05),0 2px 6px rgba(1,9,26,.06)'
      : '0 1px 2px rgba(0,0,0,.4),0 2px 8px rgba(0,0,0,.35)',
    shadow2: isLight ? '0 4px 14px rgba(1,9,26,.10)' : '0 4px 16px rgba(0,0,0,.5)',
    shadow3: isLight ? '0 12px 32px rgba(1,9,26,.16)' : '0 12px 32px rgba(0,0,0,.55)',
    fontBrand: firstFamily(t.fontFamily) ?? 'Montserrat',
    inverseSurface: '#01091a',
    inverseFg: WHITE,
    inverseLink: p300,
    aiAccent: '#21bcff',
    // status hues stay brand-neutral (not owned by the preset)
    statusFg: isLight ? '#475569' : '#94a3b8',
    statusPrimary: isLight ? '#1d4ed8' : '#60a5fa',
    statusSuccess: isLight ? '#047857' : '#34d399',
    statusWarning: isLight ? '#b45309' : '#fbbf24',
    statusError: isLight ? '#b91c1c' : '#f87171',
    statusInfo: isLight ? '#0369a1' : '#38bdf8',
    chart1: primary,
    chart2: p300,
    chart3: muted,
    chart4: p700,
    chart5: accent,
    chart6: p200,
    chartPositive: '#66bb6a',
    chartNegative: '#ef5350',
  }
}

const toJsObject = (obj, indent = '  ') =>
  `{\n${Object.entries(obj)
    .map(([k, v]) => `${indent}${k}: ${typeof v === 'number' ? v : `'${String(v).replace(/'/g, "\\'")}'`},`)
    .join('\n')}\n}`

/* -------------------------------------------------------------- generation */

const FONT_FILE_RE = /\.(otf|ttf|woff2?)$/i

const FONT_WEIGHT_WORDS = [
  [/hairline|thin/i, 100],
  [/xtra[\s_-]?light|extra[\s_-]?light|ultra[\s_-]?light/i, 200],
  [/light/i, 300],
  [/regular|book|normal|roman/i, 400],
  [/medium|\bmed\b|\bmd\b/i, 500],
  [/semi[\s_-]?b(ol)?d|demi[\s_-]?bold|\bsmbd\b|\bsb\b/i, 600],
  [/xtra[\s_-]?b(ol)?d|extra[\s_-]?bold|ultra[\s_-]?bold|\bxb\b/i, 800],
  [/bold|\bbd\b/i, 700],
  [/black|heavy/i, 900],
]

/**
 * Parse a font filename like "NespressoLucas-SemiBd.woff2" or "roboto-300.woff2"
 * into { weight, italic }.
 */
const parseFontFileName = (file) => {
  const stem = file.replace(FONT_FILE_RE, '')
  const italic = /italic|oblique/i.test(stem)
  const numeric = stem.match(/(?:^|[^0-9])([1-9])00(?:[^0-9]|$)/)
  if (numeric) return { weight: Number(numeric[1]) * 100, italic }
  for (const [re, weight] of FONT_WEIGHT_WORDS) {
    if (re.test(stem.replace(/[-_]/g, ' ')) || re.test(stem)) return { weight, italic }
  }
  return { weight: 400, italic }
}

/**
 * Some presets ship font files without a fonts.css. Synthesize @font-face rules
 * using the preset's own fontFamily token as the family name so the generated
 * --orb-font-brand stack resolves to these files.
 */
const synthesizeFontsCss = (fontFiles, family) =>
  fontFiles
    .map((file) => {
      const { weight, italic } = parseFontFileName(file)
      const format = file.endsWith('.woff2') ? 'woff2' : file.endsWith('.woff') ? 'woff' : file.endsWith('.otf') ? 'opentype' : 'truetype'
      return `@font-face {
  font-family: "${family}";
  src: url("./${file}") format("${format}");
  font-weight: ${weight};
  font-style: ${italic ? 'italic' : 'normal'};
  font-display: swap;
}`
    })
    .join('\n')

/**
 * Build the theme-pack contents for a preset without writing anything.
 * Returns { brand, light, dark, css, tokensMjs, tokensTs, fontsCss, warning }.
 */
export const buildTheme = (presetDir, { brand, tsImportFrom = 'orbcafe-ui', full = false } = {}) => {
  const systemDir = existsSync(join(presetDir, 'system')) ? join(presetDir, 'system') : presetDir
  const lightPath = join(systemDir, 'tokens.default.json')
  if (!existsSync(lightPath)) throw new Error(`tokens.default.json not found in ${systemDir}`)
  const light = readJson(lightPath)
  const darkPath = join(systemDir, 'tokens.dark.json')
  const dark = existsSync(darkPath) ? readJson(darkPath) : null
  const name = brand ?? 'theme'

  let warning = null
  const lum = hexToOklch(light.colorPrimary ?? '#000000')[0]
  if (lum > 0.65) {
    warning =
      `primary ${light.colorPrimary} is bright (oklch L=${lum.toFixed(2)}): white --orb-on-primary text ` +
      `may be low-contrast. Consider adding '--orb-on-primary: #000000' to the :root block of ${name}.css.`
  }

  const lightVars = mapMode(light, 'light', { full })
  const darkVars = dark ? mapMode(dark, 'dark', { full }) : {}

  // brand fonts: rewrite fonts.css urls to ./<brand>/fonts/
  // presets without fonts.css get @font-face synthesized from their font files
  const presetFontsDir = join(presetDir, 'fonts')
  const fontsCssPath = join(presetFontsDir, 'fonts.css')
  let rawFontsCss = null
  if (existsSync(fontsCssPath)) {
    rawFontsCss = readFileSync(fontsCssPath, 'utf8')
  } else if (existsSync(presetFontsDir)) {
    const fontFiles = readdirSync(presetFontsDir).filter((f) => FONT_FILE_RE.test(f)).sort()
    const family = firstFamily(light.fontFamily)
    if (fontFiles.length && family) rawFontsCss = synthesizeFontsCss(fontFiles, family)
  }
  const fontsCss = rawFontsCss
    ? rawFontsCss.replace(/url\((['"]?)\.\//g, `url($1./${name}/fonts/`)
    : null

  const css = `/* ${name}.css — generated from the local Open Design preset "${name}". Do not edit.
   Regenerate with: npx orbcafe-theme apply ${name}
   Import AFTER the base styles (import 'orbcafe-ui/styles.css').
   Only base tokens are overridden; all derived tokens re-derive via color-mix. */
${fontsCss ? `\n${fontsCss.trim()}\n` : ''}
${emitBlock(':root', lightVars)}${
    dark ? `\n${emitBlock('.orb-dark,\n[data-orb-mode="dark"]', darkVars)}` : ''
  }`

  const lightTokens = deriveTokens(light, 'light')
  const darkTokens = dark ? deriveTokens(dark, 'dark') : lightTokens

  const tokensMjs = `/**
 * ORBCAFE × ${name} theme tokens (JS side) — generated. Do not edit.
 * Mirrors ${name}.css for consumers that cannot read CSS variables
 * (SVG charts, canvas, inline-style computations).
 * Shape matches OrbTokens from 'orbcafe-ui'.
 */
export const ORB_LIGHT = ${toJsObject(lightTokens)};

export const ORB_DARK = ${toJsObject(darkTokens)};

export const ORB_TOKENS = { light: ORB_LIGHT, dark: ORB_DARK };

export default ORB_TOKENS;
`

  const tokensTs = `/**
 * ORBCAFE × ${name} theme tokens (JS side) — generated. Do not edit.
 * Mirrors ${name}.css for consumers that cannot read CSS variables
 * (SVG charts, canvas, inline-style computations).
 */
import type { OrbMode, OrbTokens } from '${tsImportFrom}';

export const ORB_LIGHT: OrbTokens = ${toJsObject(lightTokens)};

export const ORB_DARK: OrbTokens = ${toJsObject(darkTokens)};

export const ORB_TOKENS: Record<OrbMode, OrbTokens> = { light: ORB_LIGHT, dark: ORB_DARK };

export default ORB_TOKENS;
`

  return { brand: name, light, dark, css, tokensMjs, tokensTs, fontsCss, warning }
}

/**
 * Write a theme pack to disk:
 *   <outDir>/<brand>.css
 *   <outDir>/<brand>.tokens.mjs
 *   <outDir>/<brand>.tokens.ts        (or to tokensTsPath when given)
 *   <outDir>/<brand>/fonts/*          (when the preset ships fonts)
 */
export const generateTheme = (presetDir, { brand, outDir, tsImportFrom, full = false, tokensTsPath } = {}) => {
  const built = buildTheme(presetDir, { brand, tsImportFrom, full })
  const name = built.brand
  mkdirSync(outDir, { recursive: true })
  const cssPath = join(outDir, `${name}.css`)
  const mjsPath = join(outDir, `${name}.tokens.mjs`)
  const tsPath = tokensTsPath ?? join(outDir, `${name}.tokens.ts`)
  writeFileSync(cssPath, built.css)
  writeFileSync(mjsPath, built.tokensMjs)
  writeFileSync(tsPath, built.tokensTs)
  let fonts = []
  const presetFontsDir = join(presetDir, 'fonts')
  if (built.fontsCss && existsSync(presetFontsDir)) {
    const fontsDir = join(outDir, name, 'fonts')
    mkdirSync(fontsDir, { recursive: true })
    for (const f of readdirSync(presetFontsDir)) {
      if (!FONT_FILE_RE.test(f)) continue
      copyFileSync(join(presetFontsDir, f), join(fontsDir, f))
      fonts.push(join(fontsDir, f))
    }
  }
  return { ...built, cssPath, mjsPath, tsPath, fonts }
}
