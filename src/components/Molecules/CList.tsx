import type { ReactNode, HTMLAttributes, CSSProperties } from 'react';

// Simple list component - native ul with styling
export interface CListProps extends HTMLAttributes<HTMLUListElement> {
  dense?: boolean;
  sx?: CSSProperties;
}

export const CList = ({ dense, sx, className, children, ...props }: CListProps) => (
  <ul
    {...props}
    className={className}
    style={{
      listStyle: 'none',
      margin: 0,
      padding: 0,
      ...sx,
    }}
  >
    {children}
  </ul>
);

export interface CListItemProps extends HTMLAttributes<HTMLLIElement> {
  button?: boolean;
  divider?: boolean;
  sx?: CSSProperties;
}

export const CListItem = ({ button, divider, sx, className, children, ...props }: CListItemProps) => (
  <li
    {...props}
    className={className}
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 16px',
      minHeight: 40,
      borderBottom: divider ? '1px solid var(--orb-border)' : undefined,
      cursor: button ? 'pointer' : undefined,
      transition: 'var(--orb-t-fast)',
      ...sx,
    }}
    onMouseEnter={button ? (e) => { e.currentTarget.style.background = 'var(--orb-hover)'; } : undefined}
    onMouseLeave={button ? (e) => { e.currentTarget.style.background = ''; } : undefined}
  >
    {children}
  </li>
);

export interface CListItemButtonProps extends HTMLAttributes<HTMLButtonElement> {
  sx?: CSSProperties;
}

export const CListItemButton = ({ sx, className, children, ...props }: CListItemButtonProps) => (
  <button
    {...props}
    type="button"
    className={className}
    style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      padding: '8px 16px',
      border: 'none',
      background: 'transparent',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'var(--orb-t-fast)',
      ...sx,
    }}
  >
    {children}
  </button>
);

export interface CListItemIconProps {
  children: ReactNode;
  sx?: CSSProperties;
}

export const CListItemIcon = ({ children, sx }: CListItemIconProps) => (
  <div style={{ marginRight: 16, display: 'flex', alignItems: 'center', minWidth: 40, ...sx }}>
    {children}
  </div>
);

export interface CListItemTextProps {
  primary: ReactNode;
  secondary?: ReactNode;
  sx?: CSSProperties;
}

export const CListItemText = ({ primary, secondary, sx }: CListItemTextProps) => (
  <div style={{ flex: 1, minWidth: 0, ...sx }}>
    <div className="orb-body" style={{ fontWeight: 500 }}>{primary}</div>
    {secondary && <div className="orb-meta" style={{ marginTop: 2 }}>{secondary}</div>}
  </div>
);

export interface CListSubheaderProps extends HTMLAttributes<HTMLLIElement> {
  sx?: CSSProperties;
}

export const CListSubheader = ({ sx, className, children, ...props }: CListSubheaderProps) => (
  <li
    {...props}
    className={className}
    style={{
      padding: '8px 16px',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--orb-muted)',
      ...sx,
    }}
  >
    {children}
  </li>
);

export interface CListItemAvatarProps {
  children: ReactNode;
  sx?: CSSProperties;
}

export const CListItemAvatar = ({ children, sx }: CListItemAvatarProps) => (
  <div style={{ marginRight: 12, display: 'flex', alignItems: 'center', ...sx }}>
    {children}
  </div>
);
