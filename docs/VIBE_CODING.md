# Vibe Coding With ORBCAFE UI

This guide is for using ORBCAFE UI with Codex or another AI coding agent. The goal is to make AI-generated screens look and behave like the official examples instead of drifting into one-off component assemblies.

## The Golden Path

Ask the agent to follow this sequence:

1. Use `skills/orbcafe-ui-component-usage` as the router.
2. Map the user's natural language to canonical ORBCAFE APIs.
3. Load only the target module skill.
4. Start from the official Next.js examples.
5. Import public APIs only from `orbcafe-ui`.
6. Verify by running the app and checking the interaction that was requested.

Good prompt:

```text
Use ORBCAFE UI examples-first. Build a standard report with a Customer F4 value help filter, persisted variant/layout state, quick create, and a table. Import only from orbcafe-ui and follow the StdReport skill.
```

Less reliable prompt:

```text
Make a nice table page with filters.
```

## Skill Routing

| User asks for | Canonical module | Skill to use |
| --- | --- | --- |
| table, report, list page, filters, variants, layouts | `CStandardPage`, `CSmartFilter`, `CTable`, `useStandardReport` | `skills/orbcafe-stdreport-workflow` |
| F4, value help, search help, lookup, master data picker | `CValueHelp`, SmartFilter `type: 'value-help'` | `skills/orbcafe-ui-component-usage/references/value-help.md` plus the target module skill |
| planning, production plan, Gantt, table/timeline split | `CPlanningLayout`, `CPlanningGantt`, `usePlanningLayout` | `skills/orbcafe-planning-gantt` |
| pad, tablet, warehouse touch UI, scanner, keypad | `PAppPageLayout`, `PTable`, `PSmartFilter`, `PBarcodeScanner` | `skills/orbcafe-pad-workflow` |
| Kanban board, buckets, card drag/drop | `CKanbanBoard`, `useKanbanBoard` | `skills/orbcafe-kanban-detail` |
| detail page, drilldown, tabs, related table | `CDetailInfoPage`, `useDetailInfo` | `skills/orbcafe-graph-detail-ai` |
| pivot analysis, drag dimensions, chart, presets | `CPivotTable`, `usePivotTable` | `skills/orbcafe-pivot-ainav` |
| app shell, navigation, locale, route transition | `CAppPageLayout`, `NavigationIsland`, `CPageTransition` | `skills/orbcafe-layout-navigation` |
| chat, copilot, agent panel, dynamic cards | `StdChat`, `CopilotChat`, `AgentPanel` | `skills/orbcafe-agentui-chat` |
| login, registration, forgot password | `CAuthPage`, `useAuthPage` | `skills/orbcafe-auth-workflow` |

## Public Export Rule

Generated app code should import from the package entry only:

```tsx
import {
  CStandardPage,
  CValueHelp,
  CPlanningLayout,
  PTable,
  StdChat,
} from 'orbcafe-ui';
```

Do not import internal files such as `orbcafe-ui/dist/components/...` or local `src/components/...` from a consuming app.

## CValueHelp: F4 / Value Help

Use `CValueHelp` when the user says F4, SAP search help, value help, lookup field, master data selector, 主数据选择, or 值帮助.

### Preferred Placement

| Context | Preferred integration |
| --- | --- |
| Standard report | Add a field to `metadata.filters`; render through `useStandardReport + CStandardPage`. |
| Planning | Add the field to `filterFields` passed to `usePlanningLayout` or `usePlanningGantt`. |
| Pad | Add the field to `PTable.filterConfig.fields` or direct `PSmartFilter.fields`. |
| Standalone form | Use `CValueHelp` directly only when the field is not part of SmartFilter state. |

### Minimal SmartFilter Field

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

### Data Rules

- `getOptionValue` returns the persisted key. Keep it stable and non-localized.
- `getOptionLabel` and column labels are UI text and can be localized.
- Manual entry is enabled by default and validates against current `items` / `selectedItems`; invalid keys show an error and are not written to filter state.
- Set `valueHelp.allowManualInput: false` only when the business field must be selection-only.
- Single selection stores `{ operator: 'equals' }`.
- Multiple selection stores `{ operator: 'anyOf' }`.
- Use `onSearch(query)` for remote lookup. Returning an array replaces dialog results.
- If a saved variant reloads with only a raw key visible, provide `selectedItems` or include selected records in `items`.

### Anti-Patterns

- Do not build a separate lookup modal next to SmartFilter for report/planning/pad filters.
- Do not store localized labels as filter values.
- Do not confuse barcode scanning with Value Help. Use `PBarcodeScanner` for camera scans and `CValueHelp` for searchable master data.

## StdReport Pattern

Use the hook-first pattern:

```tsx
const { pageProps } = useStandardReport({
  metadata: {
    id: 'customer-report',
    title: 'Customers',
    filters,
    columns,
  },
  fetchData,
});

return <CStandardPage {...pageProps} />;
```

Checklist:

- `metadata.id` is globally unique.
- Business values are stable keys.
- Labels are localized independently.
- `CValueHelp` fields are part of filter metadata.
- Variants and layouts are verified after reload.

## Planning Pattern

Use the hook-first pattern:

```tsx
const planning = usePlanningLayout({
  tasks,
  columns,
  filterAppId: 'production-planning-filter',
  filterTableKey: 'planning',
  enableRowReorder: true,
});

return (
  <CPlanningLayout
    filterProps={planning.layoutProps.filterProps}
    ganttProps={planning.layoutProps.ganttProps}
  />
);
```

Checklist:

- Put many table columns in the example when validating split behavior.
- The page-size selector should appear at the left side of the table toolbar.
- The equal split control should set table/timeline panes to 50% / 50%.
- Manual divider dragging should still work after the equal split button is used.
- Horizontal table overflow should stay inside the table pane.

## Pad Pattern

Pad screens are not just smaller desktop pages. Prefer touch-specific components:

```tsx
<PAppPageLayout menuData={menuData} workloadItems={workloadItems}>
  <PTable
    rows={rows}
    columns={columns}
    filterConfig={{ fields }}
  />
</PAppPageLayout>
```

Checklist:

- Use larger hit targets and touch-friendly density.
- Use `PBarcodeScanner` for camera scans.
- Use `PNumericKeypad` for numeric confirmation flows.
- Use `PSmartFilter` / `PTable.filterConfig.fields` for pad filters.
- Reuse `CValueHelp` semantics for master data lookup.

## AgentUI Pattern

AgentUI is component-first:

```tsx
<StdChat
  messages={messages}
  onSend={handleSend}
  isResponding={isResponding}
  cardHooks={{ onCardEvent }}
/>
```

Use:

- `StdChat` for full-page or embedded chat.
- `CopilotChat` for the chat content inside a floating shell owned by the app.
- `AgentPanel` for status-driven agent runs.

## Verification

For UI changes:

```bash
npm run build
cd examples && npm run build
npm run check:ai-contracts
```

For manual verification:

- Start `examples` and open the target route.
- Trigger the requested interaction, such as F4 value help, 50/50 planning split, Kanban drag/drop, preset save/load, or chat card action.
- Reload and confirm persisted state still behaves correctly where variants/layouts/presets apply.

## Updating Skills

`docs/components/*` and `docs/skills/*` are generated read-only mirrors — `scripts/build-docs-pages.js` copies them from `src/components/*/README.md` and `skills/**`. Always edit the `src/` or `skills/` source, never `docs/components/` or `docs/skills/` directly; a manual edit there will be overwritten the next time the generator runs.

When adding a new public component or behavior:

1. Export it from `src/index.ts`.
2. Add component README documentation.
3. Add or update an official example.
4. Update `skills/orbcafe-ui-component-usage/references/public-export-index.md`.
5. Update `skills/orbcafe-ui-component-usage/references/component-glossary-i18n.md` if users may refer to it by a natural name.
6. Update `skills/orbcafe-ui-component-usage/references/skill-routing-map.md` if routing changes.
7. Update the target module skill and references.
8. Run `npm run check:ai-contracts`.
9. Run `npm run docs:build` to regenerate `docs/components/` and `docs/skills/` from the sources above, then check the diff.
