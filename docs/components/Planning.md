# Planning

Published copy of `src/components/Planning/README.md`.

---

Project management and production planning timeline component.

## Public API

- `CPlanningLayout`
- `CPlanningGantt`
- `usePlanningLayout`
- `usePlanningGantt`
- `PlanningTaskRecord`
- `PlanningGanttColumn`
- `PlanningGanttScale`
- `CPlanningGanttProps.extraTools`

## Pattern

`Planning` is hook-first. Prefer the combined pattern `usePlanningLayout + CPlanningLayout` so SmartFilter is always included with the Gantt surface.

```tsx
import { CPlanningLayout, usePlanningLayout, type PlanningTaskRecord } from 'orbcafe-ui';
import { Button } from '@mui/material';

const tasks: PlanningTaskRecord[] = [
  {
    id: 'PLAN-100',
    title: 'Material staging',
    startDate: '2026-06-01',
    endDate: '2026-06-05',
    progress: 40,
    status: 'in-progress',
  },
];

const planning = usePlanningLayout({ tasks });

<CPlanningLayout
  filterProps={planning.layoutProps.filterProps}
  ganttProps={{
    ...planning.layoutProps.ganttProps,
    extraTools: <Button size="small">Send email</Button>,
  }}
/>;
```

If a project needs fully custom orchestration, use `usePlanningGantt + CSmartFilter + CPlanningGantt` directly.

`extraTools` follows CTable-style behavior: custom tools render on the left, and built-in planning controls remain on the right.

For columns, always pass your business `columns` explicitly. `CPlanningGantt` now prioritizes the provided columns and only uses internal fallback columns when `columns` is omitted.

The table pane uses CTable-style pagination. Configure it with `rowsPerPage`, `rowsPerPageOptions`, `page`, `count`, `onPageChange`, and `onRowsPerPageChange`; by default it offers `20`, `50`, `100`, and `All`.

Rows can be dragged from either the table pane or the Gantt timeline pane to swap order with another visible task row. Group header rows are not draggable. When grouping is active, tasks can only be reordered within the same visible group. Use `onTaskReorder` when the host app needs to persist the new order.

Row reordering is enabled by default. Use `enableRowReorder={false}` on `CPlanningGantt` or `usePlanningLayout({ enableRowReorder: false })` to disable it for the whole component. Use `reorderable: false` on a `PlanningTaskRecord` to lock a specific task row; locked rows cannot be dragged and cannot be used as a drop target.
