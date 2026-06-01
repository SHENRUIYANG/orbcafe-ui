# Planning Hooks

## `usePlanningGantt`

`usePlanningGantt` is the public state helper for `CPlanningGantt`.

It manages:

- scale: `hour | day | week | month`
- selected task id
- `CSmartFilter` filter state
- filtered task rows
- paste-ready props for `CSmartFilter` and `CPlanningGantt`

### Minimal example

```tsx
import { CPlanningGantt, CSmartFilter, usePlanningGantt } from 'orbcafe-ui';

const planning = usePlanningGantt({
  tasks,
  defaultScale: 'week',
});

<CSmartFilter {...planning.smartFilterProps} />;
<CPlanningGantt {...planning.planningGanttProps} />;
```
