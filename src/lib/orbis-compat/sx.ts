import type { CSSProperties } from 'react';

export type OrbSxPrimitive = string | number | null | undefined | boolean;
export type OrbSxPropertyFunction = (theme: OrbCompatTheme) => OrbSxPrimitive | OrbSxObject;
export interface OrbSxObject {
  [key: string]: OrbSxPrimitive | OrbSxObject | OrbSxPropertyFunction;
}
export type OrbSxValue = OrbSxObject | ((theme: OrbCompatTheme) => OrbSxObject);
export type OrbSxProps = OrbSxValue | readonly OrbSxValue[];

export interface OrbCompatTheme {
  palette: {
    mode: 'light' | 'dark';
    primary: { main: string; light: string; dark: string; contrastText: string };
    secondary: { main: string; contrastText: string };
    error: { main: string; contrastText: string };
    warning: { main: string; contrastText: string };
    info: { main: string; contrastText: string };
    success: { main: string; contrastText: string };
    text: { primary: string; secondary: string; disabled: string };
    background: { default: string; paper: string };
    action: { hover: string; selected: string; focus: string; disabled: string; disabledBackground: string; active: string };
    divider: string;
    common: { white: string; black: string };
    grey: Record<number, string>;
  };
  shape: { borderRadius: number };
  breakpoints: {
    up: (key: OrbBreakpoint) => string;
    down: (key: OrbBreakpoint) => string;
  };
  spacing: (...values: number[]) => string;
  transitions: {
    create: (properties?: string | string[], options?: { duration?: number; easing?: string }) => string;
    duration: { shortest: number; shorter: number; short: number; standard: number };
  };
  zIndex: { modal: number; drawer: number; appBar: number; tooltip: number };
}

export type OrbBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type OrbResponsive<T> = T | Partial<Record<OrbBreakpoint, T>>;

const BREAKPOINTS: Record<OrbBreakpoint, number> = { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 };

const cssVarTheme = (mode: 'light' | 'dark'): OrbCompatTheme => {
  return {
    palette: {
      mode,
      primary: { main: 'var(--orb-primary)', light: 'var(--orb-p300)', dark: 'var(--orb-p700)', contrastText: 'var(--orb-on-primary)' },
      secondary: { main: mode === 'dark' ? 'var(--orb-p300)' : 'var(--orb-fg)', contrastText: mode === 'dark' ? 'var(--orb-canvas)' : 'var(--orb-on-primary)' },
      error: { main: 'var(--orb-err)', contrastText: 'var(--orb-on-primary)' },
      warning: { main: 'var(--orb-accent)', contrastText: 'var(--orb-on-primary)' },
      info: { main: mode === 'dark' ? 'var(--orb-p300)' : 'var(--orb-primary)', contrastText: 'var(--orb-on-primary)' },
      success: { main: mode === 'dark' ? 'var(--orb-p300)' : 'var(--orb-primary)', contrastText: 'var(--orb-on-primary)' },
      text: { primary: 'var(--orb-fg)', secondary: 'var(--orb-muted)', disabled: 'var(--orb-disabled-fg)' },
      background: { default: 'var(--orb-canvas)', paper: 'var(--orb-surface)' },
      action: {
        hover: 'var(--orb-hover)',
        selected: 'var(--orb-selected)',
        focus: 'var(--orb-focus-ring)',
        disabled: 'var(--orb-disabled-fg)',
        disabledBackground: 'var(--orb-disabled-bg)',
        active: mode === 'dark' ? 'var(--orb-p300)' : 'var(--orb-primary)',
      },
      divider: 'var(--orb-border)',
      common: { white: '#ffffff', black: '#01091a' },
      grey: {
        50: 'var(--orb-surface)', 100: 'var(--orb-surface)', 200: 'var(--orb-border)',
        300: 'var(--orb-border)', 400: 'var(--orb-muted)', 500: 'var(--orb-muted)',
        600: 'var(--orb-fg)', 700: 'var(--orb-fg)', 800: 'var(--orb-surface-3)', 900: 'var(--orb-canvas)',
      },
    },
    shape: { borderRadius: 10 },
    breakpoints: {
      up: (key) => `@media (min-width:${BREAKPOINTS[key]}px)`,
      down: (key) => `@media (max-width:${Math.max(0, BREAKPOINTS[key] - 0.05)}px)`,
    },
    spacing: (...values) => values.map((value) => `${value * 8}px`).join(' '),
    transitions: {
      create: (properties = 'all', options = {}) => {
        const list = Array.isArray(properties) ? properties : [properties];
        return list.map((property) => `${property} ${options.duration ?? 200}ms ${options.easing ?? 'ease'}`).join(', ');
      },
      duration: { shortest: 150, shorter: 180, short: 200, standard: 300 },
    },
    zIndex: { modal: 1300, drawer: 1200, appBar: 1100, tooltip: 1500 },
  };
};

export const getOrbCompatMode = (): 'light' | 'dark' => {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.orbMode === 'dark' || document.documentElement.classList.contains('orb-dark')
    ? 'dark'
    : 'light';
};

export const getOrbCompatTheme = (): OrbCompatTheme => cssVarTheme(getOrbCompatMode());

const SX_ALIASES: Record<string, string[]> = {
  m: ['margin'], mt: ['marginTop'], mr: ['marginRight'], mb: ['marginBottom'], ml: ['marginLeft'], mx: ['marginLeft', 'marginRight'], my: ['marginTop', 'marginBottom'],
  p: ['padding'], pt: ['paddingTop'], pr: ['paddingRight'], pb: ['paddingBottom'], pl: ['paddingLeft'], px: ['paddingLeft', 'paddingRight'], py: ['paddingTop', 'paddingBottom'],
  bgcolor: ['backgroundColor'],
};

const UNITLESS = new Set([
  'animationIterationCount', 'borderImageOutset', 'borderImageSlice', 'borderImageWidth', 'boxFlex', 'boxFlexGroup',
  'boxOrdinalGroup', 'columnCount', 'columns', 'flex', 'flexGrow', 'flexPositive', 'flexShrink', 'flexNegative',
  'flexOrder', 'gridArea', 'gridColumn', 'gridColumnEnd', 'gridColumnSpan', 'gridColumnStart', 'gridRow', 'gridRowEnd',
  'gridRowSpan', 'gridRowStart', 'fontWeight', 'lineClamp', 'lineHeight', 'opacity', 'order', 'orphans', 'scale',
  'tabSize', 'widows', 'zIndex', 'zoom',
]);

const resolveToken = (property: string, value: OrbSxPrimitive): OrbSxPrimitive => {
  if (typeof value !== 'string') return value;
  const tokens: Record<string, string> = {
    'background.default': 'var(--orb-canvas)', 'background.paper': 'var(--orb-surface)',
    'text.primary': 'var(--orb-fg)', 'text.secondary': 'var(--orb-muted)', 'text.disabled': 'var(--orb-disabled-fg)',
    'primary.main': 'var(--orb-primary)', 'primary.light': 'var(--orb-p300)', 'primary.dark': 'var(--orb-p700)',
    'secondary.main': 'var(--orb-muted)', 'divider': 'var(--orb-border)',
    'error.main': 'var(--orb-err)', 'warning.main': 'var(--orb-accent)', 'success.main': 'var(--orb-primary)', 'info.main': 'var(--orb-primary)',
    'action.hover': 'var(--orb-hover)', 'action.selected': 'var(--orb-selected)', 'action.disabled': 'var(--orb-disabled-fg)',
  };
  if (tokens[value]) return tokens[value];
  if ((property === 'borderColor' || property === 'color' || property === 'backgroundColor') && value === 'transparent') return value;
  return value;
};

const toCssProperty = (property: string): string => property.startsWith('--')
  ? property
  : property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const toCssValue = (property: string, value: OrbSxPrimitive): string | null => {
  if (value === null || value === undefined || value === false) return null;
  const resolved = resolveToken(property, value);
  if (typeof resolved === 'number' && resolved !== 0 && !UNITLESS.has(property)) {
    if (['margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'gap', 'rowGap', 'columnGap'].includes(property)) {
      return `${resolved * 8}px`;
    }
    return `${resolved}px`;
  }
  return String(resolved);
};

const mergeSx = (sx: OrbSxProps | undefined): OrbSxObject => {
  if (!sx) return {};
  const values = Array.isArray(sx) ? sx : [sx];
  return values.reduce<OrbSxObject>((merged, value) => {
    if (!value) return merged;
    const next = typeof value === 'function' ? value(getOrbCompatTheme()) : value;
    return { ...merged, ...next };
  }, {});
};

const stableSerialize = (value: unknown): string => {
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize((value as Record<string, unknown>)[key])}`).join(',')}}`;
};

const hash = (input: string): string => {
  let value = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0).toString(36);
};

const emittedRules = new Set<string>();

const emitRule = (rule: string): void => {
  if (typeof document === 'undefined' || emittedRules.has(rule)) return;
  emittedRules.add(rule);
  let sheet = document.querySelector<HTMLStyleElement>('style[data-orb-sx]');
  if (!sheet) {
    sheet = document.createElement('style');
    sheet.dataset.orbSx = 'true';
    document.head.appendChild(sheet);
  }
  sheet.appendChild(document.createTextNode(rule));
};

const buildCss = (selector: string, object: OrbSxObject): string => {
  const declarations: string[] = [];
  const nested: string[] = [];

  Object.entries(object).forEach(([rawProperty, unresolvedValue]) => {
    const rawValue = typeof unresolvedValue === 'function' ? unresolvedValue(getOrbCompatTheme()) : unresolvedValue;
    if (rawValue === null || rawValue === undefined || rawValue === false) return;

    if (rawProperty.startsWith('@media') && typeof rawValue === 'object') {
      nested.push(`${rawProperty}{${buildCss(selector, rawValue as OrbSxObject)}}`);
      return;
    }

    if (rawProperty.startsWith('&') && typeof rawValue === 'object') {
      nested.push(buildCss(rawProperty.split('&').join(selector), rawValue as OrbSxObject));
      return;
    }

    if ((rawProperty.startsWith(':') || rawProperty.startsWith('>') || rawProperty.startsWith('[')) && typeof rawValue === 'object') {
      nested.push(buildCss(`${selector}${rawProperty}`, rawValue as OrbSxObject));
      return;
    }

    if (typeof rawValue === 'object') {
      const responsive = rawValue as OrbSxObject;
      const responsiveKeys = Object.keys(responsive).filter((key): key is OrbBreakpoint => key in BREAKPOINTS);
      if (responsiveKeys.length > 0) {
        responsiveKeys.forEach((key) => {
          const propertyNames = SX_ALIASES[rawProperty] ?? [rawProperty];
          const body = propertyNames.map((property) => {
            const value = toCssValue(property, responsive[key] as OrbSxPrimitive);
            return value === null ? '' : `${toCssProperty(property)}:${value};`;
          }).join('');
          if (!body) return;
          if (key === 'xs') nested.push(`${selector}{${body}}`);
          else nested.push(`@media (min-width:${BREAKPOINTS[key]}px){${selector}{${body}}}`);
        });
      } else {
        nested.push(buildCss(`${selector} ${rawProperty}`, responsive));
      }
      return;
    }

    const propertyNames = SX_ALIASES[rawProperty] ?? [rawProperty];
    propertyNames.forEach((property) => {
      const value = toCssValue(property, rawValue as OrbSxPrimitive);
      if (value !== null) declarations.push(`${toCssProperty(property)}:${value};`);
    });
  });

  return `${declarations.length ? `${selector}{${declarations.join('')}}` : ''}${nested.join('')}`;
};

export interface OrbResolvedSx {
  className?: string;
  style?: CSSProperties;
}

export const resolveOrbSx = (sx: OrbSxProps | undefined, className?: string, style?: CSSProperties): OrbResolvedSx => {
  const object = mergeSx(sx);
  if (Object.keys(object).length === 0) return { className, style };
  const generatedClass = `orb-sx-${hash(stableSerialize(object))}`;
  emitRule(buildCss(`.${generatedClass}`, object));
  return { className: [generatedClass, className].filter(Boolean).join(' '), style };
};
