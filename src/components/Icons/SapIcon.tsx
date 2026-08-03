'use client';

import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';

/**
 * SAP-icons v5.13 codepoints from the official SAP theming base-content
 * metadata. The matching font files are shipped in dist/fonts, so rendering
 * is completely offline and does not call UI5 or any SAP service at runtime.
 */
const SAP_ICON_CODEPOINTS = {
  accept: 0xe05b,
  activate: 0xe208,
  activity: 0xe1a9,
  add: 0xe058,
  barChart: 0xe049,
  calendar: 0xe046,
  camera: 0xe045,
  checklist: 0xe260,
  collapseAll: 0xe284,
  command: 0xe28d,
  copy: 0xe245,
  darkMode: 0xe30a,
  decline: 0xe03e,
  delete: 0xe03d,
  dimension: 0xe176,
  document: 0xe1b4,
  down: 0xe1e3,
  download: 0xe03a,
  duplicate: 0xe039,
  edit: 0xe038,
  email: 0xe037,
  employee: 0xe036,
  error: 0xe1ec,
  expandAll: 0xe283,
  factory: 0xe078,
  favorite: 0xe065,
  filter: 0xe076,
  fullScreen: 0xe166,
  grid: 0xe071,
  hide: 0xe1ea,
  home: 0xe070,
  information: 0xe289,
  inventory: 0xe15d,
  ipad: 0xe093,
  lightMode: 0xe309,
  lightbulb: 0xe024,
  lineChart: 0xe18c,
  locked: 0xe153,
  log: 0xe022,
  map: 0xe021,
  menu: 0xe1de,
  message: 0xe21c,
  microphone: 0xe0f2,
  move: 0xe1e8,
  navigationLeft: 0xe067,
  navigationRight: 0xe066,
  overflow: 0xe1f2,
  overview: 0xe0cf,
  paperPlane: 0xe0cc,
  picture: 0xe016,
  pieChart: 0xe015,
  play: 0xe09b,
  process: 0xe0c7,
  product: 0xe011,
  pushpin: 0xe09f,
  qrCode: 0xe28f,
  receipt: 0xe0c5,
  refresh: 0xe010,
  save: 0xe09a,
  search: 0xe00d,
  show: 0xe1e9,
  shipping: 0xe0b3,
  slimDown: 0xe1ef,
  slimUp: 0xe1f0,
  sort: 0xe1fd,
  sound: 0xe227,
  splitOne: 0xe23f,
  splitTwo: 0xe240,
  stop: 0xe205,
  sum: 0xe28e,
  synchronize: 0xe00a,
  table: 0xe0ba,
  tableColumn: 0xe27f,
  tableRow: 0xe27e,
  thumbDown: 0xe223,
  thumbUp: 0xe222,
  time: 0xe0a4,
  translate: 0xe28b,
  tree: 0xe0f4,
  trendDown: 0xe24b,
  up: 0xe1e4,
  upload: 0xe219,
  warning: 0xe094,
  world: 0xe091,
  wrench: 0xe002,
} as const;

export type SapIconName = keyof typeof SAP_ICON_CODEPOINTS;

export interface SapIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  name: SapIconName;
  size?: number | string;
  title?: string;
  /** Accepted for drop-in compatibility with SVG outline icon libraries. */
  strokeWidth?: number | string;
  fill?: string;
}

const normalizeSize = (size: number | string): number | string =>
  typeof size === 'number' ? `${size}px` : size;

const TAILWIND_ICON_SIZES: Record<string, number> = {
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '10': 40,
  '12': 48,
};

const inferSizeFromClassName = (className?: string): number | undefined => {
  if (!className) return undefined;
  const match = className.match(/(?:^|\s)(?:h|w)-(2\.5|3(?:\.5)?|4|5|6|7|8|10|12)(?:\s|$)/);
  return match ? TAILWIND_ICON_SIZES[match[1]] : undefined;
};

export const SapIcon = forwardRef<HTMLSpanElement, SapIconProps>(
  ({ name, size, title, className, style, strokeWidth: _strokeWidth, fill: _fill, ...props }, ref) => {
    const accessibleName = props['aria-label'] ?? title;
    const normalizedSize = normalizeSize(size ?? inferSizeFromClassName(className) ?? '1em');
    const mergedStyle: CSSProperties = {
      fontFamily: 'SAP-icons',
      fontSize: normalizedSize,
      fontStyle: 'normal',
      fontWeight: 'normal',
      lineHeight: 1,
      width: normalizedSize,
      height: normalizedSize,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      ...style,
    };

    return (
      <span
        ref={ref}
        role={accessibleName ? 'img' : undefined}
        aria-hidden={accessibleName ? undefined : true}
        title={title}
        className={className}
        data-sap-icon={name}
        style={mergedStyle}
        {...props}
      >
        {String.fromCodePoint(SAP_ICON_CODEPOINTS[name])}
      </span>
    );
  },
);

SapIcon.displayName = 'SapIcon';

export const createSapIcon = (name: SapIconName, displayName?: string) => {
  const Component = forwardRef<HTMLSpanElement, Omit<SapIconProps, 'name'>>((props, ref) => (
    <SapIcon ref={ref} name={name} {...props} />
  ));
  Component.displayName = displayName ?? `SapIcon(${name})`;
  return Component;
};
