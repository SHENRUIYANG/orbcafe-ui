'use client';

import type {
  ChangeEvent,
  CSSProperties,
  ElementType,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react';
import { Children, cloneElement, forwardRef, isValidElement, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Dayjs } from 'dayjs';

import {
  CAlert,
  CAvatar,
  CBadge,
  CButton,
  CCheckbox,
  CChip,
  CDialog,
  CDivider,
  CIconButton,
  CMenu,
  CPaper,
  CProgress,
  CSelect,
  CSpinner,
  CStack,
  CSwitch,
  CTextField,
  CTooltip,
  CTypography,
} from '../../components/Atoms';
import { CCalendar } from '../../components/Atoms/CCalendar';
import { SapIcon } from '../../components/Icons';
import { orbAlpha } from '../theme/orbAlpha';
import { useMediaQuery as useOrbMediaQuery } from '../hooks/useMediaQuery';
import { getOrbCompatTheme, resolveOrbSx } from './sx';
import type { OrbCompatTheme, OrbSxProps } from './sx';

export type SxProps<T = OrbCompatTheme> = OrbSxProps | ((theme: T) => import('./sx').OrbSxObject);
export type Theme = OrbCompatTheme;
export const alpha = orbAlpha;

interface LooseProps {
  [key: string]: unknown;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  sx?: OrbSxProps;
  component?: ElementType;
}

const primitive = (defaultTag: ElementType, baseClass?: string) => forwardRef<HTMLElement, LooseProps>(
  ({ component, sx, className, style, children, ...props }, ref) => {
    const Tag = (component ?? defaultTag) as ElementType;
    const resolved = resolveOrbSx(sx as OrbSxProps | undefined, [baseClass, className].filter(Boolean).join(' '), style as CSSProperties | undefined);
    return <Tag ref={ref as never} className={resolved.className} style={resolved.style} {...props}>{children}</Tag>;
  },
);

export const Box = primitive('div');
export const Link = primitive('a', 'orb-link');
export const Paper = CPaper;
export const Stack = CStack;
export const Typography = CTypography;
export const Button = CButton;
export const IconButton = CIconButton;
export const Tooltip = CTooltip;
export const Divider = CDivider;
export const Alert = CAlert;
export const Avatar = CAvatar;
export const Badge = CBadge;
export const Chip = CChip;
export const Checkbox = CCheckbox;
export const Switch = CSwitch;
export const CircularProgress = CSpinner;
export const LinearProgress = ({ value, variant, color, sx }: { value?: number; variant?: 'determinate' | 'indeterminate'; color?: string; sx?: OrbSxProps }) => (
  <CProgress value={variant === 'determinate' ? value : undefined} color={color} sx={sx} />
);

export const Table = primitive('table', 'orb-tbl');
export const TableBody = primitive('tbody');
export const TableCell = primitive('td');
export const TableContainer = primitive('div', 'orb-table-container');
export const TableHead = primitive('thead');
export const TableRow = primitive('tr');
export const TableFooter = primitive('tfoot');
export type TableCellProps = LooseProps & { align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'; padding?: 'normal' | 'checkbox' | 'none' };
export type TextFieldProps = Parameters<typeof CTextField>[0] & { size?: 'small' | 'medium'; select?: boolean; children?: ReactNode };

export const Dialog = ({ PaperProps, maxWidth, className, open, onClose, fullWidth, children, ...dialogProps }: LooseProps & { open: boolean; onClose?: () => void; fullWidth?: boolean; maxWidth?: string | number; PaperProps?: { sx?: OrbSxProps; elevation?: number; style?: CSSProperties } }) => {
  const resolved = resolveOrbSx(PaperProps?.sx, className);
  return (
    <CDialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      className={resolved.className}
      maxWidth={typeof maxWidth === 'string' ? ({ xs: 360, sm: 600, md: 900, lg: 1200, xl: 1536 }[maxWidth] ?? maxWidth) : maxWidth}
      {...dialogProps}
    >
      {children}
    </CDialog>
  );
};
export const DialogTitle = primitive('div', 'orb-dialog-title');
export const DialogContent = primitive('div', 'orb-dialog-content');
export const DialogActions = primitive('div', 'orb-dialog-actions');
export const DialogContentText = primitive('p', 'orb-body-dense');

export const InputAdornment = primitive('span', 'orb-input-adornment');
export const InputBase = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { sx?: OrbSxProps; fullWidth?: boolean }>(
  ({ sx, fullWidth, className, style, ...props }, ref) => {
    const resolved = resolveOrbSx(sx, ['orb-input-base', className].filter(Boolean).join(' '), style);
    return <input ref={ref} className={resolved.className} style={{ width: fullWidth ? '100%' : undefined, ...resolved.style }} {...props} />;
  },
);
export const TextField = CTextField;

export const FormControl = primitive('div', 'orb-form-control');
export const FormControlLabel = ({ control, label, ...props }: LooseProps & { control: ReactNode; label: ReactNode }) => (
  <label className="orb-form-control-label" {...props}>{control}<span>{label}</span></label>
);
export const ListItemText = ({ primary, secondary, children, primaryTypographyProps: _primaryTypographyProps, secondaryTypographyProps: _secondaryTypographyProps, ...props }: LooseProps & { primary?: ReactNode; secondary?: ReactNode; primaryTypographyProps?: unknown; secondaryTypographyProps?: unknown }) => (
  <span className="orb-list-item-text" {...props}>{primary ?? children}{secondary ? <small>{secondary}</small> : null}</span>
);
export const ListItemIcon = primitive('span', 'orb-list-item-icon');
export const CListItemText = ListItemText;
export const CListItemIcon = ListItemIcon;
export const ListSubheader = primitive('div', 'orb-list-subheader');

export const Select = CSelect;
export const MenuItem = ({ value, children, disabled, ...props }: LooseProps & { value?: string | number; disabled?: boolean }) => (
  <option value={value} disabled={disabled} {...props}>{children}</option>
);

export const Grid = ({ container, item, spacing, xs, sm, md, lg, xl, sx, ...props }: LooseProps & {
  container?: boolean; item?: boolean; spacing?: number; xs?: number | boolean; sm?: number | boolean; md?: number | boolean; lg?: number | boolean; xl?: number | boolean;
}) => {
  const responsive: Record<string, unknown> = {};
  const widthFor = (value: number | boolean | undefined) => typeof value === 'number' ? `${(value / 12) * 100}%` : value ? '100%' : undefined;
  if (xs !== undefined) responsive.xs = widthFor(xs);
  if (sm !== undefined) responsive.sm = widthFor(sm);
  if (md !== undefined) responsive.md = widthFor(md);
  if (lg !== undefined) responsive.lg = widthFor(lg);
  if (xl !== undefined) responsive.xl = widthFor(xl);
  return <Box {...props} sx={{ display: container ? 'flex' : undefined, flexWrap: container ? 'wrap' : undefined, gap: container && spacing ? spacing : undefined, width: item ? responsive : undefined, ...((sx ?? {}) as Record<string, unknown>) }} />;
};

export const Collapse = ({ in: open, children, unmountOnExit, ...props }: LooseProps & { in?: boolean; unmountOnExit?: boolean }) => {
  if (!open && unmountOnExit) return null;
  return <div hidden={!open} {...props}>{children}</div>;
};

export const Portal = ({ children, container }: { children?: ReactNode; container?: Element | DocumentFragment | null }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(children, container ?? document.body);
};

export const Toolbar = primitive('div', 'orb-toolbar');

export const TableSortLabel = ({ active, direction = 'asc', children, sx, className, style, ...props }: LooseProps & { active?: boolean; direction?: 'asc' | 'desc' }) => {
  const resolved = resolveOrbSx(sx, ['orb-table-sort-label', active ? 'orb-is-active' : '', className].filter(Boolean).join(' '), style);
  return (
    <button type="button" className={resolved.className} style={resolved.style} data-direction={direction} {...props}>
      <span className="orb-table-sort-content">{children}</span>
      <SapIcon className="orb-table-sort-icon" name={direction === 'desc' ? 'down' : 'up'} size={11} />
    </button>
  );
};

export const Popover = ({ open, anchorEl, onClose, children, anchorOrigin, transformOrigin, slotProps, PaperProps, sx, className, style, ...props }: LooseProps & {
  open?: boolean;
  anchorEl?: HTMLElement | null;
  onClose?: () => void;
  anchorOrigin?: unknown;
  transformOrigin?: unknown;
  slotProps?: { paper?: { sx?: OrbSxProps; style?: CSSProperties; className?: string } };
  PaperProps?: { sx?: OrbSxProps; style?: CSSProperties; className?: string };
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const path = event.composedPath();
      if (popoverRef.current && path.includes(popoverRef.current)) return;
      if (anchorEl && path.includes(anchorEl)) return;
      onClose?.();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [anchorEl, onClose, open]);

  if (!open || typeof document === 'undefined') return null;
  const rect = anchorEl?.getBoundingClientRect();
  const paper = slotProps?.paper ?? PaperProps;
  const resolvedSx = [
    ...(Array.isArray(paper?.sx) ? paper.sx : paper?.sx ? [paper.sx] : []),
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ];
  const resolved = resolveOrbSx(
    resolvedSx,
    ['orb-pop', paper?.className, className].filter(Boolean).join(' '),
    { ...paper?.style, ...style },
  );
  return createPortal(
    <div
      {...props}
      ref={popoverRef}
      className={resolved.className}
      style={{
        position: 'fixed',
        left: rect?.left ?? 16,
        top: (rect?.bottom ?? 16) + 6,
        zIndex: 1301,
        ...resolved.style,
      }}
    >
      {children}
    </div>,
    document.body,
  );
};

export const Drawer = ({ open, onClose, anchor = 'left', children, PaperProps }: LooseProps & { open?: boolean; onClose?: () => void; anchor?: 'left' | 'right' | 'top' | 'bottom'; PaperProps?: { sx?: OrbSxProps } }) => {
  if (!open || typeof document === 'undefined') return null;
  const position: CSSProperties = anchor === 'right' ? { right: 0, top: 0, bottom: 0 } : anchor === 'top' ? { left: 0, right: 0, top: 0 } : anchor === 'bottom' ? { left: 0, right: 0, bottom: 0 } : { left: 0, top: 0, bottom: 0 };
  const resolved = resolveOrbSx(PaperProps?.sx, 'orb-drawer');
  return createPortal(<><button type="button" className="orb-overlay" aria-label="Close drawer" onClick={onClose} /><aside className={resolved.className} style={{ position: 'fixed', zIndex: 1201, ...position }}>{children}</aside></>, document.body);
};

export const Tabs = ({ value, onChange, children, variant: _variant, scrollButtons: _scrollButtons, ...props }: LooseProps & { value?: unknown; onChange?: (event: unknown, value: unknown) => void; variant?: string; scrollButtons?: string | boolean }) => (
  <div role="tablist" className="orb-tabs" {...props}>
    {Children.map(children, (child) => isValidElement(child) ? cloneElement(child as ReactElement<Record<string, unknown>>, { selected: child.props.value === value, onSelect: (next: unknown) => onChange?.(null, next) }) : child)}
  </div>
);
export const Tab = ({ value, label, children, selected, onSelect, ...props }: LooseProps & { value?: unknown; label?: ReactNode; selected?: boolean; onSelect?: (value: unknown) => void }) => (
  <button type="button" role="tab" aria-selected={selected} className={`orb-tab ${selected ? 'orb-is-active' : ''}`} onClick={() => onSelect?.(value)} {...props}>{label ?? children}</button>
);

export const Autocomplete = <T,>({ options = [], value, inputValue, getOptionLabel = String, onChange, onInputChange, renderInput, noOptionsText, sx }: {
  options?: T[]; value?: T | null; inputValue?: string; getOptionLabel?: (option: T) => string; onChange?: (event: unknown, value: T | null) => void; onInputChange?: (event: unknown, value: string) => void; renderInput?: (params: { inputProps: InputHTMLAttributes<HTMLInputElement>; InputProps: Record<string, unknown> }) => ReactNode; renderOption?: (props: React.HTMLAttributes<HTMLLIElement> & { key: string }, option: T) => ReactNode; noOptionsText?: ReactNode; size?: string; sx?: OrbSxProps;
}) => {
  const listId = `orb-autocomplete-${useId()}`;
  const current = inputValue ?? (value ? getOptionLabel(value) : '');
  const resolved = resolveOrbSx(sx, 'orb-autocomplete');
  const input = renderInput?.({ InputProps: {}, inputProps: { list: listId, value: current, onChange: (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    onInputChange?.(event, next);
    const match = options.find((option) => getOptionLabel(option) === next) ?? null;
    if (match) onChange?.(event, match);
  } } });
  return <div className={resolved.className} style={resolved.style}>{input}<datalist id={listId}>{options.map((option, index) => <option key={index} value={getOptionLabel(option)} />)}</datalist>{options.length === 0 && noOptionsText ? <span className="orb-autocomplete-empty">{noOptionsText}</span> : null}</div>;
};

export const useTheme = (): Theme => getOrbCompatTheme();
export const useMediaQuery = (query: string, _options?: unknown) => useOrbMediaQuery(query);
export const createTheme = (base?: unknown, overrides?: unknown): Theme => ({ ...getOrbCompatTheme(), ...(base as object), ...(overrides as object) } as Theme);
export const ThemeProvider = ({ children }: { theme?: Theme; children?: ReactNode }) => <>{children}</>;
export const useColorScheme = () => {
  const [mode, setModeState] = useState<'light' | 'dark' | 'system'>(() => typeof document === 'undefined' ? 'system' : (document.documentElement.dataset.orbMode as 'light' | 'dark' | undefined) ?? 'system');
  const setMode = (next: 'light' | 'dark' | 'system') => {
    setModeState(next);
    if (typeof document !== 'undefined') {
      const effective = next === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : next;
      document.documentElement.dataset.orbMode = effective;
      document.documentElement.classList.toggle('orb-dark', effective === 'dark');
    }
  };
  return { mode, setMode, systemMode: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' };
};

export type PickersDayProps<TDate = Dayjs> = { day: TDate; selected?: boolean; outsideCurrentMonth?: boolean; onDaySelect?: (day: TDate) => void; onMouseEnter?: () => void; disableMargin?: boolean; sx?: OrbSxProps };
export const PickersDay = ({ day, onDaySelect, selected, outsideCurrentMonth, disableMargin: _disableMargin, sx, className, ...props }: PickersDayProps<Dayjs> & { className?: string }) => {
  void _disableMargin;
  const resolved = resolveOrbSx(sx, `orb-cal-day ${selected ? 'orb-is-selected' : ''} ${outsideCurrentMonth ? 'orb-is-outside' : ''} ${className ?? ''}`);
  return <button type="button" className={resolved.className} style={resolved.style} onClick={() => onDaySelect?.(day)} {...props}>{day.date()}</button>;
};

export const DateCalendar = ({ value, referenceDate, onChange, onMonthChange, onYearChange, minDate, maxDate, slots, ...props }: { value?: Dayjs | null; referenceDate?: Dayjs; onChange?: (value: Dayjs | null) => void; onMonthChange?: (value: Dayjs) => void; onYearChange?: (value: Dayjs) => void; minDate?: Dayjs; maxDate?: Dayjs; slots?: { day?: (props: PickersDayProps<Dayjs>) => ReactNode } } & LooseProps) => (
  <CCalendar
    value={value}
    month={referenceDate}
    onChange={(next) => onChange?.(next)}
    onMonthChange={(next) => { onMonthChange?.(next); onYearChange?.(next); }}
    minDate={minDate}
    maxDate={maxDate}
    renderDay={slots?.day ? (day, state) => slots.day?.({ day, selected: state.selected, outsideCurrentMonth: state.outsideCurrentMonth, onDaySelect: (next) => onChange?.(next) }) : undefined}
    {...props}
  />
);
export const LocalizationProvider = ({ children }: { dateAdapter?: unknown; adapterLocale?: string; children?: ReactNode }) => <>{children}</>;
export class AdapterDayjs {}

export const styled = <P extends object = Record<string, unknown>>(Component: ElementType, _options?: unknown) => (_styles: unknown) => {
  const Styled = (props: P) => <Component {...props} />;
  return Styled;
};

export {
  CAlert,
  CAvatar,
  CBadge,
  CButton,
  CCheckbox,
  CChip,
  CDialog,
  CDivider,
  CIconButton,
  CMenu,
  CPaper,
  CProgress,
  CSelect,
  CSpinner,
  CStack,
  CSwitch,
  CTextField,
  CTooltip,
  CTypography,
};
