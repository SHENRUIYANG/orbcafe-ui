# Kanban Tools

`Kanban` 模块公开了 3 个纯函数 tools，适合做受控状态、后端同步和单元测试。

## `createKanbanBoardModel`

把 `buckets + cards` 组装成 `CKanbanBoard` / `useKanbanBoard` 直接消费的 `KanbanBoardModel`。

```tsx
import { createKanbanBoardModel } from 'orbcafe-ui';

const model = createKanbanBoardModel({ buckets, cards });
```

## `findKanbanCard`

按 `cardId` 查找卡片及其所在 bucket/索引。

```tsx
import { findKanbanCard } from 'orbcafe-ui';

const lookup = findKanbanCard(model, 'TASK-203');
```

## `moveKanbanCard`

纯函数方式把卡片移动到新 bucket 或新索引。

```tsx
import { moveKanbanCard } from 'orbcafe-ui';

const nextModel = moveKanbanCard(model, {
  cardId: 'TASK-203',
  fromBucketId: 'backlog',
  toBucketId: 'in-progress',
  targetIndex: 0,
});
```

### 适用场景

- 自己托管 `model` 状态，不使用 `useKanbanBoard`
- 拖拽后需要先做服务端校验，再决定是否提交到 UI
- 需要在 reducer/store 中复用同一套移动规则
