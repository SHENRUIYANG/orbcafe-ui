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

## 2. 国际化（i18n）规范（必须）

`StdReport` 内建文案已接入 `OrbcafeI18nProvider`（`en/zh/fr/de/ja/ko`）。

接入方式：

```tsx
import { OrbcafeI18nProvider, CStandardPage } from 'orbcafe-ui';

<OrbcafeI18nProvider locale="de">
  <CStandardPage {...pageProps} />
</OrbcafeI18nProvider>
```

字段值建议：

- 业务值用稳定 value（如 `active/pending/inactive`）
- UI 显示用本地化 label（如 `Active/启用/Actif`）
- `filters.options` 也使用“`label` 本地化 + `value` 稳定值”模式

这样可以避免“筛选逻辑用英文值，界面显示其他语言”导致的混搭。

---

## 3. 直接使用 C-Table（灵活模式）

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

## 4. C-Table 常见场景配置（你提到的重点）

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

目前系统工具按钮是标准集合（分组/汇总/列/导出/新建条目/图表报表/布局保存/布局选择）。  
如你要更严格控制，建议 `showToolbar={false}` 后自己在外层做自定义工具条。

---

## 5. Toolbar 增强按钮（自定义入口）

`CTable` 现支持两类扩展（两者都会放在系统标准按钮左侧）：

- `actions`：扩展主操作入口（位于标准按钮左侧）
- `extraTools`：扩展附加入口（也位于标准按钮左侧，紧跟 `actions` 之后）

扩展按钮风格建议（规范）：

- 默认使用 `IconButton + Tooltip`，保持与标准工具栏图标风格一致
- 若必须使用文字按钮，建议放在业务页面顶部而非表格工具栏，避免拥挤和换行

当前 Toolbar 顺序（从左到右）：

- 搜索框（固定左侧）
- 分割竖线
- `actions` + `extraTools`（扩展按钮区）
- 标准按钮区：分组、汇总、列、导出、新建条目（启用时）、图表报表（启用时）、布局保存、布局选择

说明：

- “图表报表”按钮依赖 `graphReport.enabled=true`
- “新建条目”按钮依赖 `quickCreate.enabled=true`
- “布局保存/布局选择”依赖 `appId + tableKey`（由 `CLayoutManager` 注入）

```tsx
<CTable
  title="Orders"
  columns={columns}
  rows={rows}
  actions={
    <Tooltip title="Create">
      <IconButton size="small" color="primary" onClick={onCreate}>
        <AddIcon />
      </IconButton>
    </Tooltip>
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
  <Tooltip key="create" title="Create">
    <IconButton size="small" color="primary" onClick={onCreate}>
      <AddIcon />
    </IconButton>
  </Tooltip>,
  <Tooltip key="approve" title="Approve">
    <IconButton size="small" onClick={onApprove}>
      <CheckIcon />
    </IconButton>
  </Tooltip>,
]}
```

---

## 6. 分页 / 排序 / 列宽 / 分组 / Toolbar 标准能力

`CTable` 内置以下能力：

- 排序：点击列头切换升降序
- 分页：`page` / `rowsPerPage` / `onPageChange` / `onRowsPerPageChange`
- 分组：Toolbar Group 菜单
- 列宽：拖拽列头分隔线
- 列显隐：Columns 菜单
- 导出：Export 按钮
- 新建条目：Quick Create 弹窗（可选）
- 图表报表：Graphic Report 按钮（可选）
- 布局管理：Save Layout + Layout Options（可选）
- 编辑条目：Quick Edit 弹窗（可选）
- 删除条目：二次确认弹窗（可选）

### 5.1 新建条目（Quick Create）标准用法

`CTable` 支持内建“新建条目”标准按钮和通用弹窗，字段默认跟随 `columns` 自动生成。

```tsx
<CTable
  title="Users"
  columns={columns}
  rows={rows}
  quickCreate={{
    enabled: true,
    title: 'Create User',
    submitLabel: 'Save',
    cancelLabel: 'Cancel',
    onSubmit: async (payload) => {
      await createUser(payload);
    },
  }}
/>
```

可选项：

- `fields`: 仅显示指定字段（按列 `id`）
- `excludeFields`: 排除指定字段
- `initialValues`: 默认值
- `description`: 弹窗底部说明

UI 规范：

- 弹窗字体统一 `0.85rem`
- 自动跟随当前主题（日/夜模式）

### 5.2 编辑条目（Quick Edit）与删除条目（Quick Delete）

`CTable` 支持内建标准按钮：`编辑`、`删除`。

```tsx
<CTable
  title="Users"
  columns={columns}
  rows={rows}
  rowKey="id"
  selectionMode="multiple"
  quickEdit={{
    enabled: true,
    // 默认：主键只读，其它字段可编辑
    // 可通过 editableFields / nonEditableFields / primaryKeys 精细控制
    onSubmit: async (payload, row) => {
      await updateUser(row.id, payload);
    },
  }}
  quickDelete={{
    enabled: true,
    onConfirm: async (rows) => {
      await deleteUsers(rows.map((r) => r.id));
    },
  }}
/>
```

默认行为：

- 编辑按钮：仅当选中 1 条记录时可点击
- 删除按钮：选中 >=1 条时可点击
- 删除动作：先弹 `CMessageBox` 二次确认，再触发 `onConfirm`

编辑字段控制规则（按优先级）：

1. `editableFields`（最高优先级）：仅这些字段可编辑
2. `nonEditableFields`：这些字段只读
3. `primaryKeys`：主键字段只读
4. 默认：非主键字段可编辑

---

## 7. 布局持久化（Layout）

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

## 8. CStandardPage 与 CTable 的关系

- `CStandardPage`：标准页面模板（推荐给业务页面）
- `CTable`：底层灵活组件（推荐给高级自定义页面）

如果你要“高度定制工具条/筛选/布局联动”，优先直接使用 `CTable`。

---

## 9. 最小配置参考

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
