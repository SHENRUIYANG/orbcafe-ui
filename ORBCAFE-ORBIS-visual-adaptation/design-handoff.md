# ORBCAFE × ORBIS — Design handoff

**Scope:** color & typography adaptation of the ORBCAFE UI component library to the ORBIS light corporate surface system + its dark mode, plus a focused restyle of the standalone auth entry page. Design stage only — no production code shipped from this project.

**References (normative visuals):**
- `orbcafe-orbis-design-reference.html` — tokens, typography, shell/nav, buttons, inputs, tables/pivot, status/feedback
- `orbcafe-orbis-modules-reference.html` — charts, Kanban, planning/Gantt, pad surfaces, agent UI
- `orbcafe-orbis-login-reference.html` — auth page, desktop + 390px mobile + state matrix
- `orbis-reference.css` — the token layer as CSS variables (`.mode-light` / `.mode-dark` scopes)

---

## 0. Invariants — do not break

1. **Interactions, component APIs, hierarchy, copy, forms and layout behavior are unchanged.** This is a reskin: props, callbacks, event names, drag mechanics, streaming, persistence keys and breakpoints stay exactly as they are.
2. The broad library pass is **color and typography only**. Only the auth page gets layout-adjacent texture (CSS background pattern) — and even there every form element, validation state, callback and mode is retained.
3. **Palette discipline.** The only color literals allowed in shipped code are the registered ORBIS set — `#ffffff #f5f5f5 #555555 #8c8c8c #dbdbdb #154194 #fc4c02` — plus the two dark-mode tokens `#01091a #0a1526`. Everything else is a documented derivation (§2). **No cyan, indigo, purple, green, pure-black text, generic gradients, or large orange fields.**
4. Orange `#fc4c02` is a **small signal color**: ≤ 2px lines/caps/markers, small chips and badges, warning/error derivations. Never fills, panels, or large washes.
5. Radius **10px** on containers/controls, border **1px**, 8px baseline grid, primary controls ≥ **44px**, motion = **0.2s color transitions** (no hover transforms, no animated glow).
6. No imagery: no stock, no generated images, no placeholder photos, no substitute logos. The logo slot stays host-supplied.
7. Montserrat only: **300** body, **500** labels/metadata, **600** headings, **700** reserved for rare emphasis.

---

## 1. Core tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `canvas` | `#ffffff` | `#01091a` | app background |
| `surface` | `#f5f5f5` | `#0a1526` | cards, headers, columns, wells |
| `surface-2` | `#f5f5f5` | `#061324` | sunken/track areas (dark: white 5% on canvas) |
| `surface-3` | `#f5f5f5` | `#0e1b2b` | raised dark surfaces (white 9% on canvas) |
| `foreground` | `#555555` | `#ffffff` | primary text — never pure black on light |
| `muted` | `#8c8c8c` | `rgba(255,255,255,.7)` | secondary text, axis labels, icons |
| `border` | `#dbdbdb` | `rgba(255,255,255,.12)` (solid eq. `#192536`) | 1px hairlines, dividers |
| `primary` | `#154194` | `#154194` | primary fills, links (light), active states |
| `on-primary` | `#ffffff` | `#ffffff` | text on primary fills |
| `link` | `#154194` | `#91a8d1` (= primary-300) | text links |
| `accent` | `#fc4c02` | `#fc4c02` | signal orange — ≤2px use only |

### Derived primary scale (OKLCh mixes)

| Step | Light formula | Light hex | Dark formula | Dark hex |
|---|---|---|---|---|
| `p50` | primary 6% on `#ffffff` | `#f0f3f9` | primary 22% on `#01091a` | `#0d1830` |
| `p100` | primary 14% on `#ffffff` | `#dce4f1` | primary 32% on `#01091a` | `#12223f` |
| `p200` | primary 28% on `#ffffff` | `#bac9e3` | primary 28% on `#ffffff` | `#bac9e3` |
| `p300` | primary 45% on `#ffffff` | `#91a8d1` | primary 45% on `#ffffff` | `#91a8d1` |
| `p600` | primary 85% + black 15% | `#0f3276` | primary 85% + white 15% | `#4360a8` |
| `p700` | primary 70% + black 30% | `#08255a` | primary 60% + white 40% | `#7186bc` |

CSS source of truth: `color-mix(in oklch, …)` exactly as in `orbis-reference.css`. Hex values above are precomputed fallbacks for environments without `color-mix`.

### Semantic / action tokens

| Token | Light | Dark | Used for |
|---|---|---|---|
| `hover` | primary 6% transparent | `rgba(255,255,255,.08)` | row/nav/ghost hover fills |
| `selected` | primary 10% transparent | primary 45% transparent | selected rows, text selection |
| `focus-ring` | primary 18% transparent | primary 45% + white 25% | 3px outer ring on inputs/buttons |
| `focus-solid` | `#154194` | `#91a8d1` | 2px `:focus-visible` outline |
| `disabled-fg` | `#555555` 45% on white ≈ `#9f9f9f` | `rgba(255,255,255,.38)` | disabled text |
| `disabled-bg` | `#555555` 8% on white ≈ `#ededed` | `rgba(255,255,255,.07)` | disabled fills |
| `error` | `#ac3101` (orange + black 25%) | `#d53f01` (orange + black 12%) | error text/borders — deepened orange, never pure red |
| `error-bg` | `#fbf1ee` (orange 7%) | orange 16% on `#01091a` | error alert/chip fill |
| `warn-bg` | orange 8% on white | orange 18% on `#01091a` | warning alert fill |
| `track` | `#f5f5f5` | `rgba(255,255,255,.1)` | progress/skeleton track |
| `chart-grid` | `#dbdbdb` | `rgba(255,255,255,.12)` | chart grid lines |
| `chart-text` | `#8c8c8c` | `rgba(255,255,255,.7)` | axis/legend labels |

**Status mapping discipline:** success **and** info use ORBIS blue (`primary` on `p50`); warning uses orange on `warn-bg`; error uses deepened orange. There is no green anywhere.

### Elevation (quiet, tinted — never color washes)

- Light: `shadow-1: 0 1px 2px rgba(1,9,26,.05), 0 2px 6px rgba(1,9,26,.06)` · `shadow-2: 0 4px 14px rgba(1,9,26,.10)` · `shadow-3: 0 12px 32px rgba(1,9,26,.16)`
- Dark: `shadow-1: 0 1px 2px rgba(0,0,0,.4), 0 2px 8px rgba(0,0,0,.35)` · `shadow-2: 0 4px 16px rgba(0,0,0,.5)` · `shadow-3: 0 12px 32px rgba(0,0,0,.55)`

---

## 2. Typography

Family: `"Montserrat", system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif` — one family for display and body (matches the brand registration). Weights loaded: 300/500/600/700. Data numerals: `font-variant-numeric: tabular-nums`.

| Role | Size / weight | Line height | MUI variant |
|---|---|---|---|
| Display / page title | 32 / 600 | 1.25 | `h1` |
| Section heading | 24 / 600 | 1.3 | `h2` |
| Card heading | 19 / 600 | 1.3 | `h3` |
| Subtitle / strong label | 16 / 500 | 1.4 | `subtitle1` |
| Body | 16 / 300 | 1.5 | `body1` |
| Body dense (UI, tables) | 14 / 300 | 1.5 | `body2` |
| Label / metadata | 13–12 / 500 | 1.4 | `caption` |
| Overline / table header | 11 / 500, caps, +0.06em | 1.4 | `overline` |
| Button | 14 / 500 (15 lg, 13 sm) | 1 | `button` (keep `text-transform: none`) |
| Data numerals | any / 600 + tabular-nums | 1.2 | — |

---

## 3. Replacement map (current → ORBIS)

Every recommendation replaces the current cyan/indigo/purple/slate treatment explicitly:

| Current (to remove) | Replace with | Context |
|---|---|---|
| cyan / sky (`#06b6d4`, `#0ea5e9`, cyan-500…) | `primary #154194` | primary buttons, links, active nav/tabs, focus |
| indigo (`#6366f1`, indigo-500/600…) | `primary #154194` | accents, selected states, badges |
| purple / violet / fuchsia | `p300 #91a8d1` (light) | secondary series, decorative accents |
| slate-50 / gray-50 backgrounds | `surface #f5f5f5` | page wells, table headers |
| slate-100/200 borders | `border #dbdbdb` | hairlines, dividers |
| slate-500/600 text | `muted #8c8c8c` / `foreground #555555` | secondary / body text |
| slate-900 / `#0f172a` dark bg | `canvas #01091a`, `surface #0a1526` | dark mode surfaces |
| green / emerald success | `primary #154194` on `p50` | success alerts, "confirmed" chips |
| red / rose error | `error #ac3101` (dark: `#d53f01`) | error text, borders, alerts |
| amber/yellow warning | `accent #fc4c02` on `warn-bg` | warning alerts, at-risk chips |
| glassmorphism (blur panels, white 10% cards) | solid `surface` + 1px `border` + `shadow-1` | all cards/panels |
| neon glows / animated gradients | `shadow-2` + 0.2s color transitions | focus/active emphasis |

Chart series (first 8): `#154194` → `#91a8d1` → `#8c8c8c` → `#08255a` → `#bac9e3` → `#555555` → `#0f3276` → `#dbdbdb`. (Dark mode identical — the scale is cross-mode safe; grid/labels switch per mode.) Orange is **never** a series color.

---

## 4. MUI theme mapping

```ts
// palette (light)
{
  mode: 'light',
  primary:   { main: '#154194', dark: '#0f3276', light: '#91a8d1', contrastText: '#ffffff' },
  secondary: { main: '#555555', contrastText: '#ffffff' },
  error:     { main: '#ac3101', contrastText: '#ffffff' },
  warning:   { main: '#fc4c02', contrastText: '#ffffff' },
  info:      { main: '#154194', contrastText: '#ffffff' },
  success:   { main: '#154194', contrastText: '#ffffff' }, // blue, not green — deliberate
  text:      { primary: '#555555', secondary: '#8c8c8c', disabled: '#9f9f9f' },
  divider:   '#dbdbdb',
  background:{ default: '#ffffff', paper: '#f5f5f5' },
  action: {
    hover: 'rgba(21,65,148,.06)', selected: 'rgba(21,65,148,.10)',
    focus: 'rgba(21,65,148,.18)', disabled: '#9f9f9f',
    disabledBackground: '#ededed', active: '#154194',
  },
}

// palette (dark)
{
  mode: 'dark',
  primary:   { main: '#154194', dark: '#08255a', light: '#91a8d1', contrastText: '#ffffff' },
  secondary: { main: '#91a8d1', contrastText: '#01091a' },
  error:     { main: '#d53f01' }, warning: { main: '#fc4c02' },
  info:      { main: '#91a8d1' }, success: { main: '#91a8d1' },
  text:      { primary: '#ffffff', secondary: 'rgba(255,255,255,.7)', disabled: 'rgba(255,255,255,.38)' },
  divider:   'rgba(255,255,255,.12)',
  background:{ default: '#01091a', paper: '#0a1526' },
  action: {
    hover: 'rgba(255,255,255,.08)', selected: 'rgba(21,65,148,.45)',
    focus: 'rgba(145,168,209,.30)', disabled: 'rgba(255,255,255,.38)',
    disabledBackground: 'rgba(255,255,255,.07)', active: '#91a8d1',
  },
}

// shape / typography
shape: { borderRadius: 10 }
typography: {
  fontFamily: '"Montserrat", system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  h1: { fontSize: 32, fontWeight: 600, lineHeight: 1.25 },
  h2: { fontSize: 24, fontWeight: 600, lineHeight: 1.3 },
  h3: { fontSize: 19, fontWeight: 600, lineHeight: 1.3 },
  subtitle1: { fontSize: 16, fontWeight: 500 },
  body1: { fontSize: 16, fontWeight: 300, lineHeight: 1.5 },
  body2: { fontSize: 14, fontWeight: 300, lineHeight: 1.5 },
  caption: { fontSize: 12, fontWeight: 500 },
  overline: { fontSize: 11, fontWeight: 500, letterSpacing: '.06em' },
  button: { fontSize: 14, fontWeight: 500, textTransform: 'none' },
}
```

**Component overrides (styleOverrides, both modes):**

| Component | Override |
|---|---|
| `MuiButton` | radius 10; sizes: lg 44px / md 36px / sm 32px min-height; `containedPrimary` bg `#154194` hover `#0f3276` active `#08255a`; `outlined` 1px primary border, text primary; `text` primary label, hover `action.hover`; disabled uses `action.disabled*`; drop default uppercase |
| `MuiIconButton` | 36px, radius 10, color `text.secondary`, hover `action.hover` + `text.primary` |
| `MuiOutlinedInput` | radius 10, min-height 44 (36 dense), border `divider`, hover border `text.secondary`, focused border `primary.main` + `box-shadow: 0 0 0 3px action.focus`; error border `error.main`; disabled per `action.disabled*` |
| `MuiInputLabel` / `MuiFormHelperText` | 13px/500 `text.primary`; helper 12px/500 `text.secondary`, error → `error.main` |
| `MuiCheckbox` / `MuiRadio` / `MuiSwitch` | checked color `primary.main`; radius per control (5px checkbox); focus ring = 2px `focus-solid` |
| `MuiTableHead` / `MuiTableCell` | head cell: 11px/500 caps +0.06em, `text.secondary`, bg `background.paper`, 1px `divider` bottom; body cell 14px/300; numeric columns right-aligned + tabular-nums |
| `MuiTableRow` | hover `action.hover`; `selected` `action.selected` |
| `MuiChip` | radius 10, 26px height, 12px/500; info/success → `p50` bg + primary text; warning → `warn-bg` + `error`-family text; default → `surface` + 1px `divider` |
| `MuiAlert` | radius 10, 1px border, 2px left bar (icon slot or `::before`): info/success = blue, warning = orange, error = deepened orange; backgrounds per §1 |
| `MuiTabs` | indicator 2px `primary.main`; active label primary 500; inactive `text.secondary`; no elevation |
| `MuiDrawer` / `MuiAppBar` | bg `background.default`, 1px `divider` edge, no shadow (use `shadow-1` only for floating overlays) |
| `MuiDialog` / `MuiPopover` / `MuiMenu` | radius 10, bg `background.default` (dark: `surface-3 #0e1b2b`), `shadow-3` |
| `MuiTooltip` | bg `#01091a`, text `#ffffff`, radius 10, 12px/500 (both modes) |
| `MuiSnackbar` | bg `#01091a`, text `#ffffff`, radius 10, `shadow-2`; action link `#91a8d1` |
| `MuiLinearProgress` | 4px, radius 2, bar `primary.main`, track `track` |
| `MuiSkeleton` | bg `track` (wave tint `surface-3`) |
| `MuiBadge` | dot/standard bg `primary.main`; over-limit variant bg `error.main` |

**Charts (MUI X):** `colorScheme` = series list from §3; `axis.line`/`ticks` = `chart-grid`; `axis.label`/`legend.text` = 11px/500 `chart-text`; tooltip = the `MuiTooltip` spec; grid on y only, 1px. **DataGrid:** header per `MuiTableHead`, row hover/selected per `action.*`, cell border `divider`, focus outline `primary.main`, pinned-column shadow `shadow-1`.

---

## 5. Component & state specs

**Shell / navigation** — top bar 52px, 1px bottom border; search well: surface bg, 32px, radius 10. Sidebar item: 13px/500, radius 8, hover `action.hover`; active = primary text + `p50` fill + 2px primary edge bar (left, inset 8px). Tabs: 2px primary underline on active. Breadcrumb 12px/500 muted, current segment `foreground`. Logo slot: dashed-border placeholder, host asset drops in at ≤150px width.

**Buttons** — radius 10, 1px borders, 0.2s color transitions; lg 44 / md 36 / sm 32. Primary: fill `#154194`, hover `#0f3276`, active `#08255a`, `shadow-1` at rest (none when active/disabled). Secondary: 1px primary border, primary text, hover `action.hover`. Ghost: primary text, hover `action.hover`. Neutral: 1px `border`, `foreground` text, hover `action.hover` + border `muted`. Disabled: `disabled-bg`/`disabled-fg`, no border/shadow. Focus-visible: 2px `focus-solid` outline + 1px offset (all interactive elements).

**Inputs** — 44px (36 dense), radius 10, canvas bg, 1px `border`; hover border `muted`; focus border primary + 3px `focus-ring`; error border `error` + message 12px/500 `error`; disabled `disabled-bg`. Select chevron: two 5px CSS triangles, `muted`. Checkbox 18px radius 5, radio 18px, switch 38×22 — checked = primary fill.

**Tables / pivot** — header row on surface, 11px/500 caps; 1px row dividers; hover `action.hover`; selected `p50`; numeric cells right + tabular-nums; row height ~44px; pager 12px/500 muted with 36px icon buttons. Pivot field chips: draggable, `p50` bg + primary text for row/column fields, surface+	border for measures, outline for add-field — geometry and drag behavior unchanged.

**Charts** — see §3/§4: series order, grid/labels, fills only, donut via stroke segments (24px stroke, butt caps), line charts 2px with 3.5px canvas-filled markers, plan/comparison series = muted dashed, area fill = `selected` (primary 10%). No gradients, no orange series.

**Kanban** — column: surface bg, 1px border, radius 10, 10px padding; header 13px/600 + count badge (over-WIP → `error` bg). Card: canvas, 1px border, radius 10, 12px padding, `shadow-1`; title 13px/500, meta 11px/500 muted. Drag ghost: 2px primary outline (inset) + `shadow-2`. Drop indicator: 2px primary line. Columns collapse to vertical stack ≤560px.

**Planning / Gantt** — rows 42px, label column 170px; bars 18px, radius 4 (data marks); done = muted, in progress = primary (white 10px/500 label), planned = `p200` fill + `p700` label, at risk = primary + 2px orange end cap; milestone = 12px primary diamond (45° rotated, 2px radius); today line = 2px orange full height + 10px/500 orange label; week header 10px/500 caps muted on surface; gridlines 1px `border` at each column boundary. Pane resize + row drag hit areas unchanged.

**Pad surfaces** — same tokens, larger geometry: value-help input 48px + 48px button; list rows 52px, 13px/300 with 500 leading id + 15px/600 tabular qty; tiles 1px border radius 10, value 22px/600 tabular; scan action 56px primary; keypad keys ≥52px, canvas on surface well; bottom nav items 64×48px, active = primary icon+label. Pad grid stacks single-column ≤560px.

**Agent UI** — panel max-width 480px, radius 10, 1px border. Header: avatar 28px + 14px/600 name + 11px/500 status with 7px pulsing primary dot (opacity pulse only). User bubble: `p50` bg, 1px `p100` border, right-aligned. Agent bubble: surface bg, 1px border, left-aligned; both 13px/300, radius 10, max-width 85%. Working status: 11px/500 muted + 12px spinner (2px ring, `p100` track, primary arc, 1s rotation). Streaming caret: 2×13px primary, 1s blink. Suggestion chips: outline variant. Input 44px + 44px primary send. AIBrowserGlow replacement: 2px primary edge line on the viewport while running — no animated color wash.

**Status / feedback** — alerts: 1px border + 2px left bar, radius 10, 13–16px padding; info/success = `p50` bg + primary bar (blue = confirmation), warning = `warn-bg` + orange bar, error = `error-bg` + `error` bar; title 600, body 300. Badges 18px min, primary fill (error variant `error`). Progress 4px primary on track. Skeleton = shimmer across `track`→`surface-3`. Snackbar: `#01091a` bg, white text, action link `#91a8d1`, `shadow-2` (both modes).

---

## 6. CSS formulas

```css
/* diamond lattice — login brand panel (also reusable for campaign headers) */
background-color: #01091a;
background-image:
  repeating-linear-gradient( 45deg, rgba(255,255,255,.05) 0 1px, transparent 1px 64px),
  repeating-linear-gradient(-45deg, rgba(255,255,255,.05) 0 1px, transparent 1px 64px);

/* free diamonds — 45°-rotated squares, 1px white borders at 9–20% alpha;
   one accent diamond filled rgba(21,65,148,.35) */
.diamond { transform: rotate(45deg); border: 1px solid rgba(255,255,255,.14); border-radius: 6px; }

/* the single orange gesture */
.rule { width: 48px; height: 2px; background: #fc4c02; border-radius: 2px; }

/* focus ring (inputs, buttons) */
:focus { border-color: #154194; box-shadow: 0 0 0 3px rgba(21,65,148,.18); }
:focus-visible { outline: 2px solid #154194; outline-offset: 1px; } /* dark: #91a8d1 */

/* gantt week gridlines */
background: repeating-linear-gradient(90deg,
  transparent 0 calc(100%/6 - 1px), var(--border) calc(100%/6 - 1px) calc(100%/6));

/* motion — everywhere */
transition: background .2s ease, color .2s ease, border-color .2s ease, box-shadow .2s ease;
```

---

## 7. Auth page spec

**Layout (unchanged structure):** desktop = two columns — brand panel (5fr) + form panel (7fr), min-height ~620px viewport-flexed; ≤900px the brand panel collapses to a compact header strip (dark, 22–24px padding, claim 18px with inline 2px orange rule, lattice pitch 56px) above the centered form. Form column: centered, max-width 360px, gap 16px.

**Brand panel:** `#01091a` + diamond lattice (§6) + 3 free diamonds bottom-right (230/140/76px) + logo slot top-left + claim block bottom ("We digitalize you." 30px/600 white, subcopy 14px/300 white-70%, meta 10px/500 caps white-45%) + the one 2px orange rule above the claim. No photography, no video, no gradients.

**Form surface:** white (light mode). Overline 10px/500 caps muted → H1 24px/600 → subcopy 14px/300 muted → notice slot (alerts per §5) → fields (email, password; 44px, §5 states) → row: remember-me checkbox + forgot link 13px/500 primary → primary submit full-width 44px → 1px divider "or" → neutral SSO button 44px → footer 11px muted. Register/forgot modes reuse this skin exactly — only the existing field sets swap.

**States:** normal / hover / focus (3px ring) / error (field + message + alert) / disabled / loading (spinner + label, fixed width) — all demonstrated in `orbcafe-orbis-login-reference.html` §3.

**Dark-mode login variant:** form surface `#0a1526` on `#01091a`; fields bg `surface-3 #0e1b2b`, border `rgba(255,255,255,.12)`; headings `#ffffff`, body `rgba(255,255,255,.7)`; links `#91a8d1`; primary button unchanged (`#154194` fill, white label); notice alerts use the dark token set. Brand panel is already dark — unchanged.

---

## 8. Responsive behavior

- Content max-width 1280px centered; doc/page padding 32px → 16px ≤560px.
- Sidebar collapses to drawer < 900px (existing behavior); top bar keeps logo slot, search affordance, avatar.
- Light/dark specimen pairs: side-by-side → stacked ≤560px (reference pages only).
- Login breakpoint 900px per §7; form targets stay ≥44px at all widths.
- Pad grid 2-col → 1-col ≤560px; Kanban 3-col → 1-col ≤560px.
- No horizontal scroll at 360/390/430/600/768/820/1024/1366/1440/1920px.

---

## 9. File-level implementation map (for Codex)

| File (ORBCAFE library) | Change — colors/typography only |
|---|---|
| `theme/palette.ts` (+ `palette.dark.ts`) | Replace with §4 palettes; delete cyan/indigo/purple/slate scales |
| `theme/typography.ts` | Montserrat stack + §2 variant table; `textTransform: 'none'` on button |
| `theme/shape.ts`, `theme/shadows.ts` | radius 10; replace elevation scale with §1 quiet shadows |
| `theme/components.ts` | §4 override table, both modes |
| `theme/charts.ts` (MUI X / PivotChart config) | §3 series order + grid/label tokens; remove orange from series |
| `components/CAppPageLayout`, `NavigationIsland`, `TreeMenu` | §5 shell spec: active item `p50`+2px bar, header 52px hairline; no API change |
| `components/CTable`, `CStandardPage`, `CSmartFilter`, `CValueHelp` | §5 tables/inputs specs; F4 button 44/48px per surface |
| `components/CPivotTable` (+ `usePivotTable`) | chip colors only (§5); drag logic untouched |
| `components/CKanbanBoard`/`CKanbanBucket`/`CKanbanCard` | §5 Kanban colors/elevation; over-WIP badge → `error.main` |
| `components/CPlanningLayout`/`CPlanningGantt` | §5 Gantt bar/milestone/today tokens; keep 4px bar radius |
| `components/PAppPageLayout`, `PNavIsland`, `PTable`, `PNumericKeypad`, `PBarcodeScanner` | §5 pad geometry + same token set |
| `components/AIPanel`, `AgentPanel`, `StdChat`, `CopilotChat`, `ChatMessage`, `AIBrowserGlow` | §5 agent spec; Glow → 2px primary edge line |
| `components/CAuthPage` (+ `useAuthPage`) | §7 restyle: brand panel texture is pure CSS (`::before`/background layers); keep every form, validation state, callback, mode, breakpoint |
| Any file importing old status colors | success/info → blue, warning → orange, error → deepened orange (§3) |

---

## 10. Acceptance checklist

- [ ] One token system; every color literal is registered ORBIS (+ `#01091a`/`#0a1526`) or a documented derivation
- [ ] No cyan / indigo / purple / green / pure-black text / generic gradients / orange fields anywhere, both modes
- [ ] Montserrat 300/500/600/700 only; tabular numerals in data contexts
- [ ] Radius 10px (4px data marks), 1px borders, primary controls ≥44px, 0.2s color-only motion
- [ ] Light + dark values for every token; dark = `#01091a`/`#0a1526` family
- [ ] Login: two-column ≥900px / stacked <900px; all five states; orange = exactly one 2px rule; logo slot host-supplied; forms/validation/callbacks/modes intact
- [ ] Component APIs, interactions, copy, hierarchy and breakpoints byte-identical
- [ ] Charts: §3 series order, fills not outlines, no orange series
- [ ] No new imagery of any kind
