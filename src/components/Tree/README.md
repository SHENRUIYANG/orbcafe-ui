# Tree

层级树 + 明细表格组件：左侧树形/表格展示节点层级，右侧可选展示明细面板，支持 tree/split/detail 三种面板模式。

## 快速使用

```tsx
import { CTreeComp } from 'orbcafe-ui';
import type { CTreeCompNode } from 'orbcafe-ui';

const nodes: CTreeCompNode[] = [
  {
    id: 'group-a',
    label: 'Group A',
    subtitle: '3 items',
    children: [
      { id: 'item-1', label: 'Item 1' },
      { id: 'item-2', label: 'Item 2' },
    ],
  },
];

<CTreeComp
  title="Hierarchy"
  nodes={nodes}
  selectedNodeId={selectedId}
  onNodeSelect={(node) => setSelectedId(node.id)}
  detail={(node) => (node ? <div>{node.label} detail</div> : <div>Select a node</div>)}
/>
```

## 常用参数

| Name | Type | Description |
| --- | --- | --- |
| `nodes` | `CTreeCompNode[]` | 树形数据，节点需要稳定的 `id`/`label`，可选 `children` 形成层级、`subtitle`/`markerColor` 等展示字段。 |
| `columns` | `CTreeCompColumn[]` | 自定义表格列；不传时默认只渲染 `label`/`subtitle` 一列。 |
| `selectedNodeId` / `onNodeSelect` | `string \| null` / `(node) => void` | 受控选中节点；不传 `selectedNodeId` 时组件内部维护选中态。 |
| `expandedNodeIds` / `onExpandedNodeIdsChange` | `string[]` / `(ids) => void` | 受控展开节点集合；不传时组件内部维护展开态。 |
| `defaultPaneMode` | `CTreeCompPaneMode`（`'tree' \| 'split' \| 'detail'`） | 初始面板模式，默认 `'split'`。用户可通过面板右上角按钮切换。 |
| `detail` | `ReactNode \| (node: TNode \| null) => ReactNode` | 右侧明细面板内容；不传时不显示明细面板，`paneMode` 固定为 `tree`。 |
| `filterConfig` / `searchQuery` / `searchToken` | — | 透传给内部 `CTable` 的 SmartFilter 配置与搜索；`searchQuery` 变化会自动展开、定位并滚动到匹配节点。 |
| `tableAppId` / `tableKey` | `string` | 内部 `CTable` 的持久化标识，跨会话记忆列宽/排序等表格状态时需要保证稳定。 |

## 说明

- 内部使用 `CTable` 渲染树形行（缩进 + 展开/折叠图标 + 圆点 marker），因此表格相关的分页、`rowsPerPageOptions`、`serviceUrl` 等参数与 `StdReport` 保持一致。
- `paneMode: 'tree' | 'split' | 'detail'` 分别对应"只看树/表格"、"左右分栏"、"只看明细"，配合 `minTreePaneWidth`/`minDetailPaneWidth` 控制最小宽度，分栏边界可拖拽调整（`showSplitter` 仅在 `split` 模式且提供 `detail` 时出现）。
- 保证 `nodes` 中每个节点 `id` 全局唯一；重复 id 会导致选中态和展开态错乱。
- 需要更完整的字段值帮助/明细页时，可将 `CDetailInfoPage` 或业务自定义组件传入 `detail`。
- 完整可运行示例见 `examples/app/_components/CTreeExampleClient.tsx` 与 `examples/app/ctree/page.tsx`。
