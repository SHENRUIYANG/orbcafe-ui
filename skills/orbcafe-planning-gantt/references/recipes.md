# Planning Gantt Recipes

## Recipe 1: Hook-first planning page

```tsx
'use client';

import { CPlanningGantt, CSmartFilter, usePlanningGantt, type PlanningTaskRecord } from 'orbcafe-ui';

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
  },
];

export default function PlanningPage() {
  const planning = usePlanningGantt({
    tasks,
    defaultScale: 'week',
    defaultSelectedTaskId: 'P-100',
  });

  return (
    <>
      <CSmartFilter {...planning.smartFilterProps} />
      <CPlanningGantt {...planning.planningGanttProps} />
    </>
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

## Recipe 3: Controlled component without hook

```tsx
import { CPlanningGantt } from 'orbcafe-ui';

<CPlanningGantt
  tasks={filteredTasks}
  scale={scale}
  onScaleChange={setScale}
  selectedTaskId={selectedTaskId}
  onTaskSelect={(task) => setSelectedTaskId(task.id)}
/>;
```
