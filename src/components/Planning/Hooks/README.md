# Planning Hooks

## `usePlanningLayout`

`usePlanningLayout` is the default composition hook.

It returns:

- `layoutProps.filterProps` for `CPlanningLayout`
- `layoutProps.ganttProps` for `CPlanningLayout`
- all state returned by `usePlanningGantt` (`scale`, `selectedTaskId`, `filters`, etc.)

### Minimal example

```tsx
import { CPlanningLayout, usePlanningLayout } from 'orbcafe-ui';

const planning = usePlanningLayout({
  tasks,
  defaultScale: 'week',
});

<CPlanningLayout
  filterProps={planning.layoutProps.filterProps}
  ganttProps={planning.layoutProps.ganttProps}
/>;
```

## `usePlanningGantt`

`usePlanningGantt` is the lower-level state helper for projects that need custom page composition.

It manages:

- scale: `hour | day | week | month`
- selected task id
- `CSmartFilter` filter state
- filtered task rows
- paste-ready props for `CSmartFilter` and `CPlanningGantt`
- optional `appId` and `tableKey` so SmartFilter variants and table layouts share one persistence scope
- optional `filterAppId` and `filterTableKey` for legacy SmartFilter-only callers
- optional `filterFields`, `onFilterSearch`, `onFilterVariantLoad`
- optional `columns` for business-defined table columns
- optional CTable-style pagination props: `rowsPerPage`, `rowsPerPageOptions`, `page`, `count`, `onPageChange`, and `onRowsPerPageChange`
- optional `enableRowReorder` to enable/disable visible row drag-reordering globally
- optional `onTaskReorder` for persisting drag-reordered task rows

Task records can also set `reorderable: false` to lock specific rows even when `enableRowReorder` is enabled.

### Minimal example

```tsx
import { CPlanningGantt, CSmartFilter, usePlanningGantt } from 'orbcafe-ui';

const planning = usePlanningGantt({
  tasks,
  appId: 'planning-gantt-demo',
  tableKey: 'planning',
  defaultScale: 'week',
});

<CSmartFilter {...planning.smartFilterProps} />;
<CPlanningGantt {...planning.planningGanttProps} />;
```
