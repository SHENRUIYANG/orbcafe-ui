# Planning

Project management and production planning timeline component.

## Public API

- `CPlanningGantt`
- `usePlanningGantt`
- `PlanningTaskRecord`
- `PlanningGanttColumn`
- `PlanningGanttScale`

## Pattern

`Planning` is hook-first for table + Gantt pages that need SmartFilter and controlled selection/scale state. The host provides task records; `usePlanningGantt` returns ready props for `CSmartFilter` and `CPlanningGantt`.

```tsx
import { CPlanningGantt, CSmartFilter, usePlanningGantt, type PlanningTaskRecord } from 'orbcafe-ui';

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

const planning = usePlanningGantt({ tasks });

<CSmartFilter {...planning.smartFilterProps} />;
<CPlanningGantt {...planning.planningGanttProps} />;
```
