# StdReport

`StdReport` 是 ORBCAFE UI 的标准报表能力集合：

- `CSmartFilter`：筛选栏
- `CTable`：数据表格
- `CStandardPage`：页面级组合（Filter + Table）
- Variant/Layout 管理：保存筛选与布局状态

---

## 1. 最快上手（推荐）

```tsx
import { CStandardPage, useStandardReport } from 'orbcafe-ui';

const { pageProps } = useStandardReport({
  metadata,
  fetchData,
});

export default function Page() {
  return <CStandardPage {...pageProps} />;
}
```

这个模式最省事，适合标准列表页。

---

## 2. 直接使用 C-Table（灵活模式）

当你只想要表格（不要 SmartFilter / 不要整页壳层），直接用 `CTable`：

```tsx
import { CTable } from 'orbcafe-ui';

<CTable
  title="Orders"
  columns={columns}
  rows={rows}
  rowKey="id"
/>
```

---

## 3. C-Table 常见场景配置（你提到的重点）

### 3.1 不要 Toolbar（只要表格本体）

```tsx
<CTable
  title="Orders"
  columns={columns}
  rows={rows}
  rowKey="id"
  showToolbar={false}
/>
```

### 3.2 不要选择框（单纯展示）

不传 `selectionMode` 即可（默认无选择列）：

```tsx
<CTable
  title="Orders"
  columns={columns}
  rows={rows}
  rowKey="id"
  showToolbar={true}
/>
```

### 3.3 开启单选 / 多选

```tsx
const [selected, setSelected] = useState<string[]>([]);

<CTable
  title="Orders"
  columns={columns}
  rows={rows}
  rowKey="id"
  selectionMode="multiple" // 'single' | 'multiple'
  selected={selected}
  onSelectionChange={setSelected}
/>
```

### 3.4 不要 Footer 汇总

`showSummary` 默认就是 `false`。  
如果你主动开过，设回 `false` 即可。

```tsx
<CTable
  title="Orders"
  columns={columns}
  rows={rows}
  showSummary={false}
/>
```

### 3.5 只要 Toolbar + 搜索，不要分组/汇总等操作

目前系统工具按钮是标准集合（分组/汇总/列/导出/布局）。  
如你要更严格控制，建议 `showToolbar={false}` 后自己在外层做自定义工具条。

---

## 4. Toolbar 增强按钮（自定义入口）

`CTable` 现支持两类扩展：

- `actions`：标题右侧（系统工具按钮左侧），适合主操作
- `extraTools`：系统工具按钮最右侧，适合附加操作

```tsx
<CTable
  title="Orders"
  columns={columns}
  rows={rows}
  actions={
    <Button size="small" variant="contained">
      Create
    </Button>
  }
  extraTools={
    <IconButton size="small" onClick={refresh}>
      <RefreshIcon />
    </IconButton>
  }
/>
```

也可以传数组：

```tsx
actions={[
  <Button key="create">Create</Button>,
  <Button key="approve">Approve</Button>,
]}
```

---

## 5. 分页 / 排序 / 列宽 / 分组

`CTable` 内置以下能力：

- 排序：点击列头切换升降序
- 分页：`page` / `rowsPerPage` / `onPageChange` / `onRowsPerPageChange`
- 分组：Toolbar Group 菜单
- 列宽：拖拽列头分隔线
- 列显隐：Columns 菜单
- 导出：Export 按钮

---

## 6. 布局持久化（Layout）

如果配置了 `appId + tableKey`，布局可持久化。

- 后端可用：走 `/api/layouts`
- 后端不可用：自动 fallback 到 `localStorage`

布局内容包含：

- `visibleColumns`
- `order / orderBy`
- `grouping`
- `columnWidths`
- `showSummary`

---

## 7. CStandardPage 与 CTable 的关系

- `CStandardPage`：标准页面模板（推荐给业务页面）
- `CTable`：底层灵活组件（推荐给高级自定义页面）

如果你要“高度定制工具条/筛选/布局联动”，优先直接使用 `CTable`。

---

## 8. 最小配置参考

```tsx
const columns = [
  { id: 'id', label: 'ID', minWidth: 80 },
  { id: 'name', label: 'Name', minWidth: 160 },
  { id: 'amount', label: 'Amount', numeric: true, minWidth: 120 },
];

const rows = [
  { id: 'A-001', name: 'Item A', amount: 1200 },
  { id: 'A-002', name: 'Item B', amount: 980 },
];

<CTable title="Table" columns={columns} rows={rows} rowKey="id" />;
```
