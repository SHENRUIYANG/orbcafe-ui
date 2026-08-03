# ORBCAFE × ORBIS Migration — Status Report

## Completed (Phase A–I)

### ✅ Foundation (100% complete)
- **ORBIS token system**: `src/config/orbis-tokens.ts` — 16 semantic color tokens, type scale
- **orbis.css**: 2,200 lines covering buttons, inputs, tables, charts, overlays, auth
- **Theme provider**: `OrbisModeProvider` with light/dark/system + localStorage sync
- **28 Atom primitives**: All MUI-free (CButton, CTextField, CSelect, CCheckbox, CChip, CBadge, CAlert, CProgress, CSkeleton, CSpinner, CIconButton, CTooltip, CMenu, CPaper, CDivider, CTypography, CStack, CDialog, CPopover, CTabs, CCalendar, CDatePicker, CFileUpload, CSwitch, CRadioGroup, CTextArea, CAvatar)
- **Hooks**: `useMediaQuery`, `useOrbMode`, `useOrbTokens`, `orbAlpha`
- **Type-checked**: Zero errors in Atoms/, Auth/, PageLayout/, lib/theme, lib/hooks

### ✅ Design-critical components (migrated by main agent)
- **CAuthPage** (347 lines): Login/register/forgot — diamond lattice brand panel, form surface, all three modes, MUI-free
- **CAppPageLayout** (508 lines): App shell with floating/fixed navigation, header, dark mode, OrbisModeProvider wrapper
- **Navigation Island** (tree-menu.tsx, navigation-island.tsx): ORBIS blue (#154194 / #91a8d1) replacing MUI blue, structure untouched
- **Examples app shell**: providers.tsx, layout.tsx, globals.css — OrbisModeProvider + Montserrat + orbis.css import

### ✅ Build config
- **package.json**: v2.0.0, removed @mui/* from peerDependencies, added Radix/lucide/dayjs to dependencies, `sideEffects: ["**/*.css"]`
- **tsup.config.ts**: publicDir copies orbis.css to dist/, esm+cjs+dts, "use client" banner
- **src/index.ts**: Exports tokens, theme, all Atoms

## In Progress / Blocked

### ⚠️ Module migrations (agents hit API quota, ~70% complete per agent scan)
8 parallel agents launched; 5 hit quota limits mid-work. Remaining MUI references:

| Module | @mui lines | Status | Notes |
|--------|-----------|--------|-------|
| **GraphReport** | 17 | 🟡 Partial | Charts + KPI cards; agent got imports done, needs prop fixups |
| **StdReport** | 67 | 🟡 Partial | CTable (935L), SmartFilter, Toolbar; native `<table className="orb-tbl">` half-done |
| **Molecules** | 73 | 🟡 Partial | CDateRangePicker, CValueHelp, CVariantManagement, CAppHeader; CAppHeader critical |
| **PivotTable** | 30 | 🟡 Partial | CPivotTable (1688L), chart panels; drag-drop logic untouched |
| **Pad** | 30 | 🟡 Partial | PTable, PAppPageLayout theme provider swap needed |
| **Kanban/Planning/Tree** | 28 | 🟡 Partial | Gantt (1547L) color/bar logic needs token pass |
| **DetailInfo/AgentUI** | 24 | 🟡 Partial | InputArea, VoiceButton, lib renderers |
| **Examples app** | 24 | 🟡 Partial | 10 demo client files; scaffolding Box/Stack→div+Tailwind |

**Total remaining**: ~293 @mui import lines across 70 files (down from ~400 at agent launch)

### ❌ Not started
- **Documentation**: README, module-contracts.md, CHANGELOG
- **Verification**: Build + type-check full repo, visual QA vs design reference
- **Cleanup**: Remove @mui from examples/package.json, final `npm install`

## Recommendations

### Option A: Complete migration manually (recommended)
**Effort**: ~2–3 hours focused work
**Risk**: Low (I have the full pattern from completed modules)
**Outcome**: Ship-ready v2.0.0

**Steps**:
1. Finish the 8 modules systematically (GraphReport first — smallest, 17 lines)
2. Fix CAppHeader (critical for examples app)
3. Migrate examples app demo scaffolding
4. Build + type-check; fix remaining errors
5. Update docs, CHANGELOG, README
6. Visual QA: compare login page / app layout / one table against `/tmp/orbis-adaptation/` references

### Option B: Resume agents with fresh quota
Launch 3 new agents (GraphReport+DetailInfo, StdReport, Molecules+Pad) to finish their modules, then integrate.

### Option C: Ship foundation as v2.0.0-beta.1
Tag current state, document remaining MUI in modules as "progressive migration," ship Atoms + Auth + shell working. Finish modules in v2.0.0-beta.2.

## What I need from you
Which option? If A, I'll continue now. If B, I'll draft agent prompts. If C, I'll write the beta CHANGELOG and tag.
