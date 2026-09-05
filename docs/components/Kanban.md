# Kanban

Published copy of `src/components/Kanban/README.md`.

---

`Kanban` 是 ORBCAFE UI 的标准看板模块，包含：

- `CKanbanBoard`：看板主容器，负责 bucket 布局和拖拽交互
- `CKanbanBucket`：独立封装的 bucket 样式容器
- `CKanbanCard`：独立封装的卡片样式容器
- `useKanbanBoard`：公开状态 Hook
- `createKanbanBoardModel / findKanbanCard / moveKanbanCard / addKanbanBucket / renameKanbanBucket`：公开 tools

## 1. 最快上手（推荐）

```tsx
import { CKanbanBoard, useKanbanBoard } from 'orbcafe-ui';

const kanban = useKanbanBoard({
  initialBuckets: [
    { id: 'backlog', title: 'Backlog', accentColor: 'var(--orb-chart-1)' },
    { id: 'doing', title: 'In Progress', accentColor: 'var(--orb-chart-2)', limit: 3 },
  ],
  initialCards: [
    {
      id: 'TASK-101',
      bucketId: 'backlog',
      title: 'Align rollout checklist with finance team',
      summary: 'Prepare the final UAT checklist and owner mapping.',
      priority: 'high',
      progress: 22,
      assignee: { name: 'Liu, Gang' },
    },
  ],
});

<CKanbanBoard
  {...kanban.boardProps}
  searchable
  bucketHeight="clamp(420px, calc(100vh - 370px), 640px)"
  onBucketAdd={() => kanban.actions.addBucket(newBucket)}
  onBucketRename={(bucketId, title) => kanban.actions.renameBucket(bucketId, title)}
/>;
```

`bucketHeight` 为每个 bucket 定义一致高度，卡片超过可用空间时只在 bucket 内部滚动。`searchable` 打开组件内置搜索，可匹配 bucket 标题/描述以及卡片 ID、标题、摘要、负责人、标签和指标。传入 `onBucketAdd` 后显示新增按钮，传入 `onBucketRename` 后每个 bucket 显示就地重命名入口。业务筛选可以通过 `cardFilter` 控制可见卡片，同时保持拖拽使用完整模型。

## 2. Hook-first 接入（标准方式）

推荐：`useKanbanBoard + CKanbanBoard`

原因：

- 拖拽后不会出现“视觉移动了，但状态没更新”的脱节
- `onCardMove` 可直接接服务端持久化
- `boardProps` 可直接透传，接入成本低

## 3. 公开入口

```tsx
import {
  CKanbanBoard,
  CKanbanBucket,
  CKanbanCard,
  useKanbanBoard,
  createKanbanBoardModel,
  addKanbanBucket,
  findKanbanCard,
  moveKanbanCard,
  renameKanbanBucket,
} from 'orbcafe-ui';
```

## 4. 最小数据结构

```ts
interface KanbanBucketDefinition {
  id: string;
  title: string;
  description?: string;
  accentColor?: string;
  limit?: number;
}

interface KanbanCardRecord {
  id: string;
  bucketId: string;
  title: string;
  summary?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  progress?: number;
  dueDate?: string;
  assignee?: { name: string; avatarSrc?: string };
  tags?: { id: string; label: string }[];
}
```

## 5. 卡片点击串联 DetailInfo

标准做法是在 `onCardClick` 里路由到详情页：

```tsx
<CKanbanBoard
  {...kanban.boardProps}
  onCardClick={({ card, bucket }) => {
    router.push(`/detail-info/${card.id}?source=kanban&bucket=${bucket.id}`);
  }}
/>
```

官方示例见：

- `examples/app/kanban/page.tsx`
- `examples/app/_components/KanbanExampleClient.tsx`
- `examples/app/detail-info/[id]/DetailInfoExampleClient.tsx`

## 6. Tools

如果你不用 Hook，而是自己托管状态：

```tsx
import { moveKanbanCard } from 'orbcafe-ui';

setModel((current) => moveKanbanCard(current, {
  cardId: 'TASK-101',
  fromBucketId: 'backlog',
  toBucketId: 'doing',
  targetIndex: 0,
}));
```

更详细说明见：

- `src/components/Kanban/Hooks/README.md`
- `src/components/Kanban/Utils/README.md`

## 7. Skill

AI 接入与自动化生成应使用：

- `skills/orbcafe-kanban-detail/SKILL.md`
- `skills/orbcafe-ui-component-usage/references/module-contracts.md`

## 8. Verify

1. 拖拽卡片到不同 bucket 后，bucket 数量和卡片顺序同步变化
2. 点击卡片能进入 `detail-info/[id]`
3. 空 bucket 能接收卡片，不会因为没有卡片而失去 drop 区域
4. 超过 `limit` 时 bucket 右上角 chip 进入 warning 状态
5. 卡片过多时 bucket 等高且只滚动卡片区，页面高度不再随最长 bucket 增长
6. 搜索、结果计数和清空按钮正常工作，过滤状态下拖拽不会丢失隐藏卡片
7. 新增 bucket 后可接收卡片，重命名支持 Enter 保存和 Esc 取消

## 9. Troubleshooting

- 拖拽后卡片“弹回去”：你只渲染了 `CKanbanBoard`，但没有用 `useKanbanBoard` 或自管 `model`
- 空 bucket 无法接收：确认 bucket `id` 稳定且没有重复
- 点击没反应：确认 `onCardClick` 已传入，且路由写在 Client Component 中
