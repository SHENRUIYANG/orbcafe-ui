# Planning Gantt Recipes

## Recipe 1: Default combo layout (recommended)

```tsx
'use client';

import { CPlanningLayout, usePlanningLayout, type PlanningTaskRecord } from 'orbcafe-ui';

const tasks: PlanningTaskRecord[] = [
  {
    id: 'P-100',
    code: 'PP-100',
    title: 'Finalize production demand plan',
    project: 'Q3 Product Launch',
    workCenter: 'Planning',
    startDate: '2026-06-01',
    endDate: '2026-06-08',
    progress: 72,
    status: 'in-progress',
    owner: { name: 'Ruiyang Shen', initials: 'RS' },
    reorderable: true,
  },
  {
    id: 'P-LOCKED',
    code: 'PP-LOCKED',
    title: 'Released baseline order',
    project: 'Q3 Product Launch',
    workCenter: 'Planning',
    startDate: '2026-06-02',
    endDate: '2026-06-06',
    progress: 100,
    status: 'done',
    reorderable: false,
  },
];

export default function PlanningPage() {
  const planning = usePlanningLayout({
    tasks,
    defaultScale: 'week',
    defaultSelectedTaskId: 'P-100',
    enableRowReorder: true,
  });

  return (
    <CPlanningLayout
      filterProps={planning.layoutProps.filterProps}
      ganttProps={planning.layoutProps.ganttProps}
    />
  );
}
```

## Recipe 2: Override scale and selected task

```tsx
const planning = usePlanningGantt({ tasks, defaultScale: 'hour' });

<CPlanningGantt
  {...planning.planningGanttProps}
  scale={planning.scale}
  selectedTaskId={planning.selectedTaskId}
  onTaskSelect={(task) => {
    planning.setSelectedTaskId(task.id);
    openInspector(task);
  }}
/>;
```

## Recipe 3: Custom composition without layout wrapper

```tsx
import { CPlanningGantt, CSmartFilter, usePlanningGantt } from 'orbcafe-ui';

const planning = usePlanningGantt({ tasks });

<CPlanningGantt
  {...planning.planningGanttProps}
/>;
<CSmartFilter {...planning.smartFilterProps} />;
```

## Recipe 4: Add custom tools to the left of standard controls

```tsx
import { Button } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

<CPlanningGantt
  {...planning.planningGanttProps}
  extraTools={
    <Button
      size="small"
      variant="outlined"
      startIcon={<MailOutlineIcon fontSize="small" />}
      onClick={() => sendPlanMail()}
    >
      Send email
    </Button>
  }
/>;
```

## Recipe 5: Persist drag-reordered rows

```tsx
const planning = usePlanningLayout({
  tasks,
  enableRowReorder: true,
  onTaskReorder: (orderedTasks, { activeTask, targetTask }) => {
    savePlanningOrder(orderedTasks.map((task) => task.id));
    auditMove(activeTask.id, targetTask.id);
  },
});

<CPlanningLayout
  filterProps={planning.layoutProps.filterProps}
  ganttProps={planning.layoutProps.ganttProps}
/>;
```

Disable row drag-reordering globally when the plan order must be read-only:

```tsx
const planning = usePlanningLayout({
  tasks,
  enableRowReorder: false,
});
```
