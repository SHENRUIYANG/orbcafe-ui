import { Fragment, jsx as reactJsx, jsxs as reactJsxs } from 'react/jsx-runtime';
import type React from 'react';
import type { ElementType } from 'react';

import { resolveOrbSx } from './sx';
import type { OrbSxProps } from './sx';

interface OrbIntrinsicCompatibilityProps {
  [key: string]: unknown;
  sx?: OrbSxProps;
  component?: ElementType;
  noWrap?: boolean;
  hover?: boolean;
  selected?: boolean;
  stickyHeader?: boolean;
  padding?: 'normal' | 'checkbox' | 'none';
  flexItem?: boolean;
  item?: boolean;
  container?: boolean;
  xs?: number | boolean | 'auto';
  sm?: number | boolean | 'auto';
  md?: number | boolean | 'auto';
  lg?: number | boolean | 'auto';
  xl?: number | boolean | 'auto';
}

export namespace JSX {
  export type Element = React.JSX.Element;
  export type ElementType = React.JSX.ElementType;
  export interface ElementClass extends React.JSX.ElementClass {}
  export interface ElementAttributesProperty extends React.JSX.ElementAttributesProperty {}
  export interface ElementChildrenAttribute extends React.JSX.ElementChildrenAttribute {}
  export type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>;
  export type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
  export type IntrinsicClassAttributes<T> = React.JSX.IntrinsicClassAttributes<T>;
  export type IntrinsicElements = {
    [K in keyof React.JSX.IntrinsicElements]: React.JSX.IntrinsicElements[K] & OrbIntrinsicCompatibilityProps;
  };
}

const transformProps = (type: unknown, rawProps: Record<string, unknown> | null): [unknown, Record<string, unknown> | null] => {
  if (!rawProps || typeof type !== 'string') return [type, rawProps];
  const props = { ...rawProps };
  const resolvedType = props.component ?? type;
  delete props.component;

  const sx = props.sx as OrbSxProps | undefined;
  delete props.sx;
  const resolved = resolveOrbSx(sx, props.className as string | undefined, props.style as React.CSSProperties | undefined);
  props.className = [
    resolved.className,
    props.hover ? 'orb-hoverable' : undefined,
    props.selected ? 'orb-selected' : undefined,
    props.noWrap ? 'orb-nowrap' : undefined,
    props.padding === 'checkbox' ? 'orb-cell-checkbox' : undefined,
  ].filter(Boolean).join(' ') || undefined;
  props.style = resolved.style;

  ['hover', 'selected', 'noWrap', 'stickyHeader', 'padding', 'flexItem', 'item', 'container', 'xs', 'sm', 'md', 'lg', 'xl', 'sortDirection', 'scrollButtons', 'disableSticky', 'columns', 'primaryTypographyProps', 'secondaryTypographyProps', 'position'].forEach((key) => delete props[key]);
  return [resolvedType, props];
};

export const jsx = (type: unknown, props: Record<string, unknown> | null, key?: React.Key) => {
  const [nextType, nextProps] = transformProps(type, props);
  return reactJsx(nextType as React.ElementType, nextProps, key);
};

export const jsxs = (type: unknown, props: Record<string, unknown> | null, key?: React.Key) => {
  const [nextType, nextProps] = transformProps(type, props);
  return reactJsxs(nextType as React.ElementType, nextProps, key);
};

export { Fragment };
