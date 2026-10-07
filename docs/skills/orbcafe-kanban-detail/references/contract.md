# Kanban usage contract

## Identity and model

`useKanbanBoard({ initialModel? } | { initialBuckets?, initialCards? })` initializes once. For asynchronous loads call `actions.replaceModel(next)`; changing initial props does not reload current state. Render `<CKanbanBoard {...boardProps} />`.

- Bucket: `KanbanBucketDefinition = { id, title, description?, accentColor?, icon?, limit?, emptyLabel? }`.
- Card: `KanbanCardRecord = { id, bucketId, title, summary?, kicker?, priority?, tone?, progress?, dueDate?, assignee?, tags?, metrics?, detailHref?, footer?, position? }`.
- Model: `{ buckets: Array<KanbanBucketDefinition & { cards: KanbanCardRecord[] }> }`.
- Every card ID is globally unique within the board and bucketId points at an existing bucket. Treat limit as display context, not a server-side capacity rule.

## Events and commands

| API | Contract |
| --- | --- |
| `onCardMove(event)` | `{ cardId, fromBucketId, toBucketId, targetIndex?, card, model }`; hook applies the local move before invoking the callback. Host persists and supplies rollback/error handling. |
| `onCardClick(context)` | `{ card, bucket }`, not a bare card or DOM event. Route in Client code. |
| `actions.moveCard(id, bucketId, targetIndex?)` | Returns event or undefined for no move; invokes the hook's move callback. |
| `actions.updateCard(id, partialOrUpdater)` | Updates card fields; use moveCard for bucket changes so containing arrays stay consistent. |
| `actions.addBucket(bucket)` / `renameBucket(id, title)` | Return boolean; wire `CKanbanBoard.onBucketAdd` / `onBucketRename` yourself. |
| `actions.replaceModel(nextOrUpdater)` | Replaces the full model, useful for server reload/rollback. |

`searchable`, `searchValue/onSearchValueChange`, `defaultSearchValue` control board search. `cardFilter(card,bucket)` is an additional business filter. `bucketHeight` defines the scrollable viewport; `bucketMaxHeight` is a deprecated compatibility alias. Empty buckets remain droppable. `detailHref` alone does not replace an onCardClick route handler.

Sources: `src/components/Kanban/types.ts`, `Hooks/useKanbanBoard.ts`, `Utils/kanbanTools.ts`; example: `examples/app/_components/KanbanExampleClient.tsx`. Verify cross-bucket and same-bucket reorder, empty bucket, search, add/rename, backend rejection, and detail navigation.
