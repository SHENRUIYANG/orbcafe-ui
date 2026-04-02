# Kanban Hooks

## `useKanbanBoard`

`useKanbanBoard` 是 `Kanban` 模块的公开状态入口，负责：

- 托管 `KanbanBoardModel`
- 处理卡片跨 bucket / 同 bucket 重排
- 对外暴露 `boardProps`，可直接传给 `CKanbanBoard`
- 支持在拖拽完成后触发业务回调

### 最小示例

```tsx
import { CKanbanBoard, useKanbanBoard } from 'orbcafe-ui';

const kanban = useKanbanBoard({
  initialBuckets: buckets,
  initialCards: cards,
  onCardMove: async ({ cardId, toBucketId }) => {
    await api.updateStatus(cardId, toBucketId);
  },
});

<CKanbanBoard {...kanban.boardProps} />;
```

### 入参

| Field | Type | Description |
| --- | --- | --- |
| `initialModel` | `KanbanBoardModel` | 已组装好的初始模型 |
| `initialBuckets` | `KanbanBucketDefinition[]` | bucket 定义；和 `initialCards` 配合使用 |
| `initialCards` | `KanbanCardRecord[]` | 初始卡片数据 |
| `onCardMove` | `(event) => void` | 拖拽完成后的业务回调 |
| `onCardClick` | `(context) => void` | 点击卡片后的业务回调 |

### 返回值

| Field | Type | Description |
| --- | --- | --- |
| `model` | `KanbanBoardModel` | 当前看板模型 |
| `actions.replaceModel` | `(model \| updater) => void` | 整体替换模型 |
| `actions.moveCard` | `(cardId, toBucketId, targetIndex?) => event` | 程序化移动卡片 |
| `actions.updateCard` | `(cardId, updater) => void` | 更新单张卡片 |
| `actions.getCard` | `(cardId) => lookup` | 查找卡片所在 bucket |
| `boardProps` | `UseKanbanBoardBindings` | 可直接透传给 `CKanbanBoard` |

### 推荐接法

1. 需要拖拽立即生效：直接用 `boardProps`
2. 需要后端持久化：在 `onCardMove` 里同步服务端
3. 需要回滚：先用 `moveKanbanCard` 生成 optimistic model，失败后再 `replaceModel`
