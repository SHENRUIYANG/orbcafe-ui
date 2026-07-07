# CTreeComp Contract

Use this reference when the request mentions tree table, hierarchy tree, BOM tree, cost tree, organization tree, expandable hierarchy, or tree + detail.

## Canonical API

- Component: `CTreeComp`
- Types: `CTreeCompNode`, `CTreeCompColumn`, `CTreeCompPaneMode`
- Import only from `orbcafe-ui`.
- Canonical example:
  - `examples/app/_components/CTreeExampleClient.tsx`
  - `examples/app/ctree/page.tsx`

## Preferred Integration

Use `CTreeComp` directly for hierarchy/table/split-detail surfaces. Combine it with:

- `CAppPageLayout` when the page needs the standard shell/navigation.
- `CDetailInfoPage` when the right pane needs rich detail sections/tabs.
- `filterConfig`, `tableAppId`, and `tableKey` when the tree table needs SmartFilter/table identity.

`CTreeComp` is component-first: there is no public `useCTreeComp` hook. Use controlled props and callbacks when the host app owns selection or expansion.

## Minimal Data Shape

```ts
import type { CTreeCompNode, CTreeCompColumn } from 'orbcafe-ui';

type CostNode = CTreeCompNode & {
  code: string;
  kind: 'Assembly' | 'Material' | 'Labor';
  status: 'Draft' | 'Costed' | 'Reviewed';
  total?: number;
};

const nodes: CostNode[] = [
  {
    id: '100',
    label: 'Complete Door Set',
    code: '100',
    kind: 'Assembly',
    status: 'Draft',
    children: [
      { id: '110', label: 'Door Leaf System', code: '110', kind: 'Assembly', status: 'Costed' },
    ],
  },
];

const columns: CTreeCompColumn<CostNode>[] = [
  { id: 'code', label: 'Code', minWidth: 96 },
  { id: 'kind', label: 'Kind', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 120 },
  { id: 'total', label: 'Total', align: 'right', numeric: true },
];
```

## Minimal Usage

```tsx
import { CTreeComp, type CTreeCompNode, type CTreeCompColumn } from 'orbcafe-ui';

<CTreeComp
  title="Cost Structure"
  subtitle="Expandable material and activity hierarchy"
  nodes={nodes}
  columns={columns}
  tableAppId="cost-tree"
  tableKey="main"
  detail={(node) => node ? <CostDetail node={node} /> : null}
  onNodeSelect={(node) => setSelectedNodeId(node.id)}
/>;
```

## Controlled Selection / Expansion

```tsx
<CTreeComp
  title="BOM"
  nodes={nodes}
  selectedNodeId={selectedNodeId}
  onNodeSelect={(node) => setSelectedNodeId(node.id)}
  expandedNodeIds={expandedNodeIds}
  onExpandedNodeIdsChange={setExpandedNodeIds}
/>;
```

## Verify

- Expand/collapse keeps parent/child indentation clear.
- Selecting a row updates `selectedNodeId`, detail pane, or callback state.
- Search/filter changes visible rows without losing valid hierarchy context.
- Split/tree/detail pane modes work and respect `minTreePaneWidth` / `minDetailPaneWidth`.
- Table/filter identity is stable when `tableAppId`, `tableKey`, or `filterConfig` are used.

## Common Failures

- Duplicate `id` values break selection, expansion, and row identity.
- Flat data is passed without `children`, so it renders as a table rather than a hierarchy.
- Business detail is routed away when the requested UX needs split tree/detail in one page.
- `columns[].id` does not match node fields and renders empty cells.
- Consumer imports from `src/components/Tree/CTreeComp` instead of `orbcafe-ui`.
