# Planning Gantt Recipes

## Data shape: tasks JSON drives the Gantt

Use one `tasks` JSON array for both the left table and the right timeline. Each object must have valid `startDate` and `endDate`; those two fields are what make the Gantt bar appear at the correct horizontal position and duration.

```json
[
  {
    "id": "MO-500000000001",
    "code": "500000000001",
    "title": "Automotive Hood Gas Spring 150N",
    "project": "FG-GS-HOOD-150-050-250N",
    "workCenter": "PS1",
    "startDate": "2026-06-01T08:00:00+08:00",
    "endDate": "2026-06-06T18:00:00+08:00",
    "progress": 30,
    "status": "planned",
    "owner": { "name": "Planner 1", "initials": "P1" },
    "color": "#2563eb",
    "reorderable": true
  },
  {
    "id": "OP-500000000001-0010",
    "code": "0010",
    "title": "Steel Tube Cutting",
    "project": "Automotive Hood Gas Spring 150N",
    "workCenter": "CUTTING",
    "startDate": "2026-06-01T08:00:00+08:00",
    "endDate": "2026-06-02T08:00:00+08:00",
    "progress": 18,
    "status": "in-progress",
    "owner": { "name": "CUTTING", "initials": "CU" },
    "color": "#2563eb"
  }
]
```

Minimum valid task:

```ts
const tasks: PlanningTaskRecord[] = [
  {
    id: 'TASK-1',
    title: 'Cut material',
    startDate: '2026-06-01T08:00:00+08:00',
    endDate: '2026-06-01T16:00:00+08:00',
  },
];
```

The left table schema is separate from the task JSON. Pass `columns` when a business page needs predictable table fields:

```tsx
const columns = [
  { id: 'code', label: 'Order/Operation', width: 140 },
  { id: 'title', label: 'Task', width: 280 },
  { id: 'workCenter', label: 'Work Center', width: 160 },
  { id: 'owner', label: 'Owner', width: 160 },
  { id: 'status', label: 'Status', width: 140 },
  { id: 'progress', label: 'Progress', width: 140 },
];
```

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
    startDate: '2026-06-01T08:00:00+08:00',
    endDate: '2026-06-08T17:00:00+08:00',
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
    startDate: '2026-06-02T08:00:00+08:00',
    endDate: '2026-06-06T17:00:00+08:00',
    progress: 100,
    status: 'done',
    reorderable: false,
  },
];

const columns = [
  { id: 'code', label: 'ID', width: 120 },
  { id: 'title', label: 'Task', width: 300 },
  { id: 'workCenter', label: 'Work Center', width: 160 },
  { id: 'owner', label: 'Owner', width: 160 },
  { id: 'status', label: 'Status', width: 140 },
  { id: 'progress', label: 'Progress', width: 140 },
];

const workCenterValueHelp = [
  { workCenter: 'CUT-01', name: 'Steel Tube Cutting Line 01', resourceGroup: 'CUTTING' },
  { workCenter: 'ASM-01', name: 'Final Assembly Line 01', resourceGroup: 'ASSEMBLY' },
];

export default function PlanningPage() {
  const planning = usePlanningLayout({
    tasks,
    columns,
    filterFields: [
      { id: 'keyword', label: 'Keyword', type: 'text', placeholder: 'Task/ID/Project' },
      {
        id: 'workCenter',
        label: 'Work Center',
        type: 'value-help',
        valueHelp: {
          dialogTitle: 'Work Center Value Help',
          items: workCenterValueHelp,
          columns: [
            { field: 'workCenter', label: 'Work Center', minWidth: 140 },
            { field: 'name', label: 'Name', minWidth: 240 },
            { field: 'resourceGroup', label: 'Resource Group', minWidth: 160 },
          ],
          getOptionValue: (item) => item.workCenter,
          getOptionLabel: (item) => item.name,
          getOptionDescription: (item) => item.resourceGroup,
        },
      },
      { id: 'dateRange', label: 'Date Range', type: 'date' },
    ],
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

Value Help in Planning:

- Put lookup fields in `filterFields`; `CPlanningLayout` renders them through SmartFilter above the Gantt.
- Use stable keys (`workCenter`, `materialId`, `orderId`) as `getOptionValue`.
- If a selected Value Help key does not filter rows, update the `usePlanningGantt` filtering logic or task data so the selected key matches a task field.

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
