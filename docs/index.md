# ORBCAFE UI

ORBCAFE UI is a React / Next.js enterprise UI library for building SAP-style business applications: standard reports, value help filters, planning Gantt boards, touch-first pad workflows, analytical pivot views, detail pages, Kanban boards, app shells, auth pages, and AI chat surfaces.

The library is designed for two audiences at once:

- Developers who want stable, typed public React components.
- AI coding agents that need clear module contracts, examples, and skills to generate working ORBCAFE screens without guessing internal APIs.

![ORBCAFE UI examples home](images/examples/home.png)

## Highlights

| Area | What you get |
| --- | --- |
| App shell | `CAppPageLayout`, `NavigationIsland`, locale switcher, user menu, logo slot, route-safe page transitions. |
| Standard report | `CStandardPage`, `CSmartFilter`, `CTable`, variants, layouts, quick create/edit/delete, pagination, and SAP-style `CValueHelp`. |
| Planning | `CPlanningLayout` / `CPlanningGantt` with table + timeline panes, row reorder, page-size selector, equal 50/50 split toggle, and manual drag resizing. |
| Analytics | `CPivotTable`, pivot chart companion views, draggable rows/columns/filters/values, aggregations, and presets. |
| Workflow pages | `CKanbanBoard`, `CDetailInfoPage`, `CGraphReport`, and `CCustomizeAgent` for operational work surfaces. |
| Pad | `PAppPageLayout`, `PTable`, `PSmartFilter`, `PNumericKeypad`, `PBarcodeScanner` for touch-first warehouse and shop-floor scenarios. |
| AI surfaces | `StdChat`, `CopilotChat`, `AgentPanel`, dynamic markdown/cards rendering, voice navigation via `CAINavProvider`. |
| AI-ready docs | Skills under `skills/` route natural-language requests to canonical ORBCAFE modules and enforce examples-first integration. |

## Documentation Map

- [Official examples walkthrough](EXAMPLES.md): screenshots, routes, and key behavior for every example page.
- [Vibe coding and skills guide](VIBE_CODING.md): how to ask AI agents to use ORBCAFE UI, including `CValueHelp` and module skills.
- [Examples app README](guides/examples-app.md): how to run the Next.js examples locally.
- [AI module contracts](skills/orbcafe-ui-component-usage/references/module-contracts.md): public API, hook strategy, examples, validation, and troubleshooting index for agent use.
- Component docs:
  - [StdReport](components/StdReport.md)
  - [Molecules / CValueHelp](components/Molecules.md)
  - [Planning](components/Planning.md)
  - [Pad](components/Pad.md)
  - [AgentUI](components/AgentUI.md)
  - [PageLayout](components/PageLayout.md)
  - [PivotTable](components/PivotTable.md)
  - [DetailInfo](components/DetailInfo.md)
  - [Kanban](components/Kanban.md)

## Install

Install the package and its peer/runtime dependencies with pinned compatible ranges:

```bash
npm install orbcafe-ui @mui/material@^7.3.9 @mui/icons-material@^7.3.9 @mui/x-date-pickers@^8.27.2 @emotion/react@^11.14.0 @emotion/styled@^11.14.1 dayjs@^1.11.20 lucide-react@^0.575.0 tailwind-merge@^3.5.0 clsx@^2.1.1 class-variance-authority@^0.7.1 @radix-ui/react-slot@^1.2.4
```

## Required App Setup

### Tailwind source scanning

ORBCAFE UI components rely on Tailwind utility classes. The published `dist/index.css` is not enough by itself; your app must scan the library output.

Tailwind v4 / Next.js baseline:

```css
@import "tailwindcss";
@source "../node_modules/orbcafe-ui/dist";
```

When developing inside this repo, the examples app also scans the source package:

```css
@source "../../src";
```

Tailwind v3 fallback:

```js
module.exports = {
  content: ["./node_modules/orbcafe-ui/dist/**/*.{js,mjs}"],
};
```

### Providers

Wrap your app with the MUI and ORBCAFE providers used by the official examples:

```tsx
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { GlobalMessage, OrbcafeI18nProvider } from 'orbcafe-ui';

const theme = createTheme();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <OrbcafeI18nProvider locale="en">
          {children}
          <GlobalMessage />
        </OrbcafeI18nProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
```

## Run The Official Examples

```bash
npm run build

cd examples
npm install
npm run dev
```

Open `http://localhost:3000`.

Main routes:

| Route | Demonstrates |
| --- | --- |
| `/` | Navigation island and base button states. |
| `/std-report` | Standard report, i18n, `CSmartFilter`, `CTable`, variants/layouts, quick create, and `CValueHelp`. |
| `/planning` | Production planning Gantt with many columns, page-size selector, 50/50 split toggle, and manual resizing. |
| `/kanban` | Drag/drop workflow board and card-to-detail navigation. |
| `/pivot-table` | Pivot fields, aggregations, chart views, and preset persistence. |
| `/detail-info/ID-1` | Detail page with sections, tabs, related table, search, and AI fallback. |
| `/pad` | Touch-first warehouse workload, pad table, keypad, and scanner flow. |
| `/chat` | Full-page `StdChat` with markdown, math, code, Mermaid, and dynamic cards. |
| `/copilot` | Floating draggable/resizable `CopilotChat`. |
| `/aipanel` | Display-only `AgentPanel` with status states. |
| `/ai-nav` | Space-key voice navigation provider and hook state. |

## CValueHelp Quick Start

Use `CValueHelp` directly for standalone form fields, or configure it through `CSmartFilter` / `PSmartFilter` so value selection is preserved in filter and variant state.

```tsx
{
  id: 'customer',
  label: 'Customer',
  type: 'value-help',
  valueHelp: {
    dialogTitle: 'Customer Value Help',
    items: customers,
    columns: [
      { field: 'customerId', label: 'Customer', minWidth: 120 },
      { field: 'customerName', label: 'Name', minWidth: 220 },
      { field: 'country', label: 'Country', minWidth: 90 },
    ],
    getOptionValue: (item) => item.customerId,
    getOptionLabel: (item) => item.customerName,
    getOptionDescription: (item) => item.country,
  },
}
```

Rules:

- Store stable keys as values, not localized labels.
- Single selection maps to `equals`.
- Multiple selection maps to `anyOf`.
- Use `onSearch(query)` for remote search help.
- In reports/planning/pad filters, prefer SmartFilter field config over a separate custom lookup dialog.

See [Vibe coding and skills guide](VIBE_CODING.md#cvaluehelp-f4--value-help) for AI-agent usage rules.

## AI / Vibe Coding Baseline

When using Codex or another AI coding agent with ORBCAFE UI, ask it to follow the local skills instead of inventing component APIs:

1. Route the request through `skills/orbcafe-ui-component-usage`.
2. Map natural names like "table", "F4", "pad table", "planning Gantt", or "copilot" to canonical exports.
3. Check the target module skill, for example `orbcafe-stdreport-workflow`, `orbcafe-planning-gantt`, `orbcafe-pad-workflow`, or `orbcafe-agentui-chat`.
4. Import only from `orbcafe-ui`.
5. Validate against the official Next.js examples.

Two integration styles are used across the library:

- Hook-first: the module exposes a public hook that owns state and returns props for the standard component, for example `useStandardReport`, `usePlanningLayout`, `useKanbanBoard`, `usePivotTable`, and `usePadLayout`.
- Component-first: the module's stable contract is the component props and callbacks, for example `StdChat`, `CopilotChat`, and `AgentPanel`.

More detail: [VIBE_CODING.md](VIBE_CODING.md).

## Public API Rule

Application code should import only from the package entry:

```tsx
import {
  CStandardPage,
  CValueHelp,
  CPlanningLayout,
  CPivotTable,
  PTable,
  StdChat,
} from 'orbcafe-ui';
```

Do not import from `src/components/...` in consuming applications. Internal paths may change; public exports are the contract.

## Quality Checks

```bash
npm run build
cd examples && npm run build
npm run check:ai-contracts
```

Before publishing documentation screenshots, run the examples app and refresh the images under `images/examples/`.
