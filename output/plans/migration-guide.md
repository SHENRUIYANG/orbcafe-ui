# ORBCAFE × ORBIS — MUI Removal Migration Guide (for migration agents)

You are migrating files in `/Users/shenruiyang/AI/ORBCAFE/src` from MUI (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`) to the new in-house ORBIS primitives. This is both a **dependency removal** and a **brand adaptation** (color/typography only — never change layout structure, interactions, behavior, copy, or public props unless the prop itself is MUI-typed).

## Non-negotiable rules

1. **ZERO `@mui/*` imports may remain** in your assigned files when done — including `import type`.
2. **No behavior changes**: keep all state logic, callbacks, event handlers, drag & drop, keyboard handling, i18n keys, controlled/uncontrolled patterns exactly as they are.
3. **Public component props stay the same names**; only re-type MUI-specific types:
   - `SxProps<Theme>` / `sx` objects → `React.CSSProperties` (apply via `style={...}`)
   - Responsive sx objects (`{xs:…, md:…}`) and sx callbacks `(theme)=>…` must be flattened: pick sensible static values or CSS `var(--orb-*)`; if responsive behavior is essential, add a small CSS class to `src/styles/orbis.css` with media queries.
   - MUI spacing numbers: `p: 2` → `padding: 16` (×8). `pt/pb/pl/pr/m/mt/…` same ×8 rule. `gap: 1.5` → `12`.
4. **Colors**: never invent hex values. Use CSS vars `var(--orb-*)` or tokens from `src/config/orbis-tokens.ts` (via `useOrbTokens()` hook for SVG/canvas JS contexts). Legacy MUI blue `#1976d2/#90caf9/#e3f2fd` → ORBIS `var(--orb-primary)` / dark `var(--orb-p300)`. Status discipline: success/info → blue family, warning → `var(--orb-accent)` (#fc4c02, small signals only), error → `var(--orb-err)`. NO green/cyan/purple/red anywhere.
5. **Typography**: Montserrat stack is global via `.orb-root`; use the type scale classes (`.orb-h1/h2/h3`, `.orb-subtitle`, `.orb-body`, `.orb-body-dense`, `.orb-label`, `.orb-meta`, `.orb-overline`) or the `CTypography` atom. Numbers in data contexts: `fontVariantNumeric: 'tabular-nums'` (`.orb-num`).
6. **Radius** is `var(--orb-r)` (10px); legacy `borderRadius: 3` (24px MUI units) or `borderRadius: 2` → `var(--orb-r)`. Shadows → `var(--orb-shadow-1/2/3)`.
7. **Dark mode**: components must NOT branch on mode for standard surfaces — the CSS vars flip automatically under `.orb-dark`. Use `useOrbMode()` only when JS truly needs the mode (chart JS colors → prefer `useOrbTokens()`).
8. Keep every file's existing exports (names & paths) unchanged.
9. Do not edit files outside your assigned list (except adding shared classes to `src/styles/orbis.css` — append at the end under a marked comment with your module name).
10. Replace `@mui/icons-material/*` with `lucide-react` per the icon map below; sizes: `fontSize="small"` → `size={15}`, medium → 18, large → 22; use `strokeWidth={1.8}`.

## Available primitives (`src/components/Atoms/`, import from relative path or `../Atoms`)

| Need | Import | Key props |
|---|---|---|
| Button | `CButton` | `variant: 'primary'\|'secondary'\|'ghost'\|'neutral'`, `size: 'small'\|'medium'\|'large'`, `block`, `loading`, `startIcon/endIcon`, `sx: CSSProperties`. Legacy variants auto-map (contained/outlined/text). |
| Icon button | `CIconButton` | `tooltip`, `size`, `active`, standard button props |
| Text field | `CTextField` | `label`, `value`, `onChange`, `type`, `error: string\|boolean`, `helperText`, `dense` (36px; default 44px), `startAdornment/endAdornment` (also accepts legacy `InputProps={{startAdornment}}`), `fullWidth` |
| Text area | `CTextArea` | `label`, `rows/minRows`, `error`, `helperText` |
| Select | `CSelect` | `label`, `options: {value,label,disabled}[]` **or** `<option>` children, `value/onChange` (native event), `dense` default true, `minWidth`, `placeholder` |
| Checkbox | `CCheckbox` | `label?`, `checked/onChange/disabled/indeterminate` |
| Radio group | `CRadioGroup` | `label?`, `options: {value,label}[]`, `value/onChange(event, value)`, `row` |
| Switch | `CSwitch` | `label?`, `checked/onChange(event, checked)` |
| Chip | `CChip` | `label` or children, `tone: 'blue'\|'gray'\|'orange'\|'outline'` (legacy `color` auto-maps: success/info/primary→blue, warning/error→orange), `icon`, `onDelete`, `onClick` |
| Badge | `CBadge` | `badgeContent`, `color: 'primary'\|'error'\|'muted'`, wraps children or standalone |
| Avatar | `CAvatar` | `src/alt` or children (initials), `size` (default 28) |
| Alert | `CAlert` | `severity: 'info'\|'success'\|'warning'\|'error'` (blue/blue/orange/deep-orange), `title`, `onClose` |
| Progress | `CProgress` (`value` 0-100 or omit for indeterminate), `CSkeleton` (`variant: 'text'\|'rectangular'\|'circular'`), `CSpinner` (`size`, `onPrimary`) |
| Paper/Card | `CPaper` | `elevation` (0=flat border, >0=shadow-1), `sx` |
| Divider | `CDivider` | `orientation` |
| Typography | `CTypography` | `variant: 'h1'..'h6'\|'subtitle1/2'\|'body1/2'\|'label'\|'caption'\|'overline'`, `muted`, `numeric`, `component` |
| Stack | `CStack` | `direction`, `spacing` (×8px number or CSS length), `alignItems/justifyContent/flexWrap`, `sx` |
| Dialog | `CDialog` | `open`, `onClose`, `title`, `actions` (footer), `maxWidth`, `fullWidth`, `hideCloseButton` |
| Popover | `CPopover` | `open/onOpenChange`, `trigger` (anchor element), `align/side/sideOffset`, `matchTriggerWidth` |
| Menu | `CMenu` | `triggerLabel`, `items: {label,onClick,disabled,icon}[]`, `trigger?`, `align` |
| Tooltip | `CTooltip` | `title`, wraps single child, `side/align/enterDelay` |
| Tabs | `CTabs` | `items: {value,label,icon?,disabled?}[]`, `value/defaultValue/onChange` |
| Calendar | `CCalendar` | `value` (Dayjs) or `rangeStart/rangeEnd`, `onChange(day)`, `month/onMonthChange`, `minDate/maxDate`, `locale` |
| Date picker | `CDatePicker` | `value/defaultValue` (Dayjs), `onChange(Dayjs\|null)`, `format`, `minDate/maxDate`, `label`, `error`, `dense` |
| File upload | `CFileUpload` | unchanged API |

Raw Radix (if a primitive doesn't fit): `@radix-ui/react-dialog`, `react-popover`, `react-dropdown-menu`, `react-tooltip` are installed — use the same `orb-pop`/`orb-menu`/`orb-menu-item`/`orb-dialog` CSS classes.

Hooks/helpers: `useOrbMode()` / `useOrbTokens()` from `src/lib/theme` (relative import, e.g. `../../lib/theme`); `orbAlpha(hex, a)` replaces MUI `alpha()`; `useMediaQuery(query)` from `src/lib/hooks/useMediaQuery` (accepts `'(min-width:900px)'` or `'up:900'`/`'down:900'`).

## orbis.css classes available (src/styles/orbis.css)

Buttons: `orb-btn orb-btn-primary|secondary|ghost|neutral`, `orb-btn-lg`, `orb-btn-sm`, `orb-btn-block`, `orb-icon-btn(-sm)` · Fields: `orb-fld`, `orb-inp`, `orb-inp-dense`, `orb-inp-adornment-wrap`, `orb-inp-adornment(-end)`, `orb-fld-label`, `orb-fld-msg`, `orb-is-error` · Selection: `orb-chk`, `orb-rdo`, `orb-sw` · Feedback: `orb-chip-blue|gray|orange|outline`, `orb-badge(-err|-muted)`, `orb-alert-info|success|warning|error`, `orb-prog`, `orb-skel`, `orb-spin(-light)`, `orb-snack` · Surfaces: `orb-card`, `orb-card-raised`, `orb-surface` · Table: `orb-tbl` (+`orb-num`, `orb-is-selected`, `orb-tbl-sort`, `orb-pager`) · Tabs: `orb-tabs`, `orb-tab orb-is-active` · Overlay: `orb-overlay`, `orb-dialog`, `orb-dialog-title`, `orb-dialog-actions`, `orb-pop`, `orb-menu`, `orb-menu-item`, `orb-menu-sep`, `orb-menu-label`, `orb-tooltip` · Calendar: `orb-cal*` · Charts: `orb-axis-lbl`, `orb-grid-ln`, `orb-c1..c4`, `orb-l1/l2`, `orb-legend` · Type: `orb-h1/h2/h3`, `orb-subtitle`, `orb-body`, `orb-body-dense`, `orb-label`, `orb-meta`, `orb-overline`, `orb-num`, `orb-link`, `orb-divider(-v)` · Auth: `orb-auth-*` (don't touch, done) · Utility: `orb-root`, `orb-float-search`, `orb-logo-slot`, `orb-visually-hidden`.

CSS variables (all under `:root` / `.orb-dark`): `--orb-canvas`, `--orb-surface(-2,-3)`, `--orb-fg`, `--orb-muted`, `--orb-border`, `--orb-primary`, `--orb-on-primary`, `--orb-link`, `--orb-p50/p100/p200/p300/p600/p700`, `--orb-accent`, `--orb-err`, `--orb-err-bg`, `--orb-warn-bg`, `--orb-hover`, `--orb-selected`, `--orb-focus-ring`, `--orb-focus-solid`, `--orb-disabled-fg`, `--orb-disabled-bg`, `--orb-chart-grid`, `--orb-chart-text`, `--orb-track`, `--orb-shadow-1/2/3`, `--orb-r`, `--orb-font`, `--orb-t-fast`.

## MUI → replacement quick map

`Box` → `div` + style · `Stack` → `CStack` · `Paper` → `CPaper` · `Typography` → `CTypography` or span+p class · `Button` → `CButton` · `IconButton` → `CIconButton` · `TextField/InputBase` → `CTextField` · `InputAdornment` → `startAdornment/endAdornment` props · `FormControl/InputLabel/FormControlLabel/FormHelperText/FormLabel/FormGroup` → the atom's own `label`/`helperText` or `orb-fld` wrapper · `Select/MenuItem` → `CSelect` (native select) · `Checkbox/Radio/Switch` → atoms · `Chip` → `CChip` · `Badge` → `CBadge` · `Avatar` → `CAvatar` · `Alert` → `CAlert` · `LinearProgress` → `CProgress` · `CircularProgress` → `CSpinner` · `Skeleton` → `CSkeleton` · `Dialog(+Title/Content/Actions)` → `CDialog` · `Popover/Popper/ClickAwayListener` → `CPopover` · `Menu/MenuList` → `CMenu` or raw `@radix-ui/react-dropdown-menu` with `orb-menu` classes · `Tooltip` → `CTooltip` · `Tabs/Tab` → `CTabs` · `Table*` → native table with `orb-tbl` classes · `TableSortLabel` → button `orb-tbl-sort` + lucide ArrowUp/ArrowDown · `TablePagination` → custom pager using `orb-pager` + `CIconButton` · `Collapse` → conditional render or CSS max-height transition · `Link` → `a`/`button` with `orb-link` · `Grid` → div with `display:grid` inline style · `useTheme()` → `useOrbMode()`/`useOrbTokens()` · `useMediaQuery` → `src/lib/hooks/useMediaQuery` · `alpha()` → `orbAlpha()` or `var(--orb-hover/selected)` · `styled()` → plain component + orbis classes · `createTheme/ThemeProvider/CssBaseline/GlobalStyles` → delete (OrbisModeProvider lives in the layouts; already done) · `x-date-pickers` → `CCalendar`/`CDatePicker` (Dayjs stays).

## Icon map (MUI → lucide-react)

Close/Clear/ClearAll→X · Search→Search · Save→Save · Delete/DeleteOutline→Trash2 · Add/AddRounded→Plus · DragIndicator(Rounded)→GripVertical · KeyboardArrowDown/Up/Left/Right→ChevronDown/Up/Left/Right · KeyboardDoubleArrow*→ChevronsLeft/Right (direction) · ExpandMore(Rounded)/ArrowDropDown→ChevronDown · ChevronRightRounded→ChevronRight · Check(Rounded/Outlined)→Check · CheckCircle→CircleCheck · Error(Outline)→CircleAlert · Warning→TriangleAlert · Info→Info · Settings(Outlined)→Settings · ViewColumn/ViewQuilt→Columns3/LayoutGrid · Star(Border)→Star · AccountTree→Network · Functions→Sigma · Send(Outlined/Rounded)→SendHorizontal · Mic(None/Off/Rounded)→Mic/MicOff · Menu(Rounded)/MenuOpenRounded→Menu/PanelLeftOpen · Logout→LogOut · LightMode/DarkMode→Sun/Moon · FilterList→ListFilter · QrCodeScanner(Rounded)→ScanLine · Backspace(Rounded)→Delete · CalendarMonth→Calendar · CloudUpload→UploadCloud · ContentCopy(Outlined)→Copy · Edit→Pencil · Download→Download · Person(Outline)→User · Lock(Outlined)/LockReset→Lock/KeyRound · Mail(Outline)→Mail · Visibility(Off)→Eye/EyeOff · Translate/Language→Languages · Sort→ArrowUpDown · ArrowUpward/ArrowDownward→ArrowUp/ArrowDown · ArrowForward/ArrowRightAlt→ArrowRight · PlayArrow→Play · UnfoldMore/UnfoldLess→ChevronsUpDown/ChevronsDownUp · CameraAlt(Rounded)→Camera · DesktopWindows→Monitor · Layers(Clear)→Layers · Insights→TrendingUp · TableRows→Rows3 · Hardware(Rounded)→Wrench · VpnKey(Outlined)→KeyRound · Splitscreen(Outlined)→Columns2 · InsertDriveFile→FileText. Anything unlisted: pick the closest lucide equivalent.

## Reference designs (for visual fidelity)

The design handoff is at `/tmp/orbis-adaptation/` (orbis-reference.css + 3 HTML files). Read the relevant section of `orbcafe-orbis-modules-reference.html` for your module (charts / kanban / gantt / pad / agent) and `orbcafe-orbis-design-reference.html` (tables, buttons, inputs, status). Match colors, radii, type sizes, and state styles — but keep the component's existing DOM structure and interactions.

## Verification

After your edits: `cd /Users/shenruiyang/AI/ORBCAFE && npx tsc --noEmit 2>&1 | grep "<YourModuleDir>"` must produce ZERO errors, and `grep -rn "@mui" src/components/<YourModuleDir>` must be empty. Other modules' pre-existing errors are not your concern — do not touch them.
