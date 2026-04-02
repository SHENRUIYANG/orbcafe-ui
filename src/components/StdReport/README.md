# StdReport

`StdReport` 是 ORBCAFE UI 的标准报表能力集合：

- `CSmartFilter`：筛选栏
- `CTable`：数据表格
- `CStandardPage`：页面级组合（Filter + Table）
- Variant/Layout 管理：保存筛选与布局状态

---

## 1. 最快上手（推荐）

**重要更新：** 所有报表组件必须提供 `id`（Identity）作为身份标识，用于 Variants/Layouts 持久化管理，防止配置在大型项目中“走丢”。

```tsx
import { CStandardPage, useStandardReport } from 'orbcafe-ui';

const { pageProps } = useStandardReport({
  metadata: {
    id: 'my-unique-report-id', // 【必填】全局唯一标识，用于 Variant 隔离
    title: 'My Report',
    // ...
  },
  fetchData,
});

export default function Page() {
  // `useStandardReport` 默认返回 integrated pageProps
  return <CStandardPage {...pageProps} />;
}
```

这个模式最省事，适合标准列表页。

---

## 2. 核心概念：身份与联动 (Identity & Integration)

### 2.1 身份 (Identity)

为了在大型项目中准确管理用户保存的变式（Variant）和布局（Layout），我们强制要求显式声明组件身份。

- **`id` (App ID)**: 应用/页面级别的唯一标识。
  - 在 `CStandardPage` 中通过 `id` 属性传入。
  - 在 `CTable` / `CSmartFilter` 中通过 `appId` 属性传入。
- **`tableKey`**: 表格级别的标识（默认为 `'default'`）。
  - 当一个页面有多个表格时，用它区分不同表格的布局配置。

### 2.2 联动模式 (Integrated Mode)

`CStandardPage` 提供 `mode="integrated"` 属性（推荐使用）。
当你使用 `useStandardReport` 时，默认已经返回 `mode="integrated"`。

- **Separated (默认)**: Filter 和 Table 独立渲染，通过 props 传递状态。
- **Integrated (推荐)**: Filter 配置直接透传给 Table，由 Table 统一管理 Variant 加载和 Layout 应用，解决“变式加载时 Filter 变了但 Layout 没变”的问题。

```tsx
<CStandardPage
  id="order-list-page"
  mode="integrated" // 手动指定时依然可用
  {...pageProps}
/>
```

---

## 3. 国际化（i18n）规范（必须）

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

## 4. 直接使用 C-Table（灵活模式）

当你只想要表格（不要 SmartFilter / 不要整页壳层），直接用 `CTable`。
**注意：必须传入 `appId`。**

```tsx
import { CTable } from 'orbcafe-ui';

<CTable
  appId="my-order-table" // 【必填】用于保存布局
  title="Orders"
  columns={columns}
  rows={rows}
  rowKey="id"
/>
```

---

## 5. C-Table 常见场景配置

### 5.1 不要 Toolbar（只要表格本体）

```tsx
<CTable
  appId="simple-table"
  title="Orders"
  columns={columns}
  rows={rows}
  rowKey="id"
  showToolbar={false}
/>
```

### 5.2 不要选择框（单纯展示）

不传 `selectionMode` 即可（默认无选择列）：

```tsx
<CTable
  appId="read-only-table"
  title="Orders"
  columns={columns}
  rows={rows}
  rowKey="id"
  showToolbar={true}
/>
```

### 5.3 开启单选 / 多选

- `selectionMode="single"`
- `selectionMode="multiple"`

### 5.4 开启行内操作（Action Column）

通过 `actions` 属性注入操作按钮（会自动固定在最右侧）。

```tsx
<CTable
  // ...
  actions={(row) => (
    <>
      <IconButton onClick={() => handleEdit(row)}><EditIcon /></IconButton>
      <IconButton onClick={() => handleDelete(row)}><DeleteIcon /></IconButton>
    </>
  )}
/>
```

### 5.5 开启批量操作（Toolbar Actions）

通过 `extraTools` 属性在工具栏注入按钮。

```tsx
<CTable
  // ...
  selectionMode="multiple"
  extraTools={
    <Button 
      variant="contained" 
      disabled={selected.length === 0}
      onClick={handleBatchDelete}
    >
      Batch Delete
    </Button>
  }
/>
```

---

## 6. 高级特性：快速编辑/创建 (Quick Edit/Create)

`CTable` 内置了简单的增删改交互模式，通过配置开启。

```tsx
<CTable
  appId="user-management"
  // ...
  quickCreate={{
    enabled: true,
    title: 'Create User',
    fields: ['name', 'email', 'role'], // 指定显示的字段
    onSubmit: async (payload) => { await api.create(payload); }
  }}
  quickEdit={{
    enabled: true,
    editableFields: ['name', 'role'], // 仅这些字段可编辑
    primaryKeys: ['id'], // 主键不可编辑
    onSubmit: async (payload, row) => { await api.update(row.id, payload); }
  }}
  quickDelete={{
    enabled: true,
    onConfirm: async (rows) => { await api.deleteMany(rows.map(r => r.id)); }
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

## 7. 布局持久化（Layout）与变式（Variant）

**必须配置 `appId`**，布局才能持久化。

- **后端可用**：若配置 `serviceUrl`，组件会自动请求 `/api/layouts` 和 `/api/variants`。
- **后端不可用**：自动 fallback 到 `localStorage`。

**Variant 服务接口定义 (Updated)**：

如果你自定义 `variantService`，需要支持 `tableKey` 参数：

```typescript
interface IVariantService {
    getVariants: (appId: string, tableKey?: string) => Promise<VariantMetadata[]>;
    saveVariant: (variant: VariantMetadata, appId: string, tableKey?: string) => Promise<void>;
    deleteVariant: (id: string) => Promise<void>;
    setDefaultVariant: (id: string, appId: string, tableKey?: string) => Promise<void>;
}
```

---

## 8. CStandardPage 与 CTable 的关系

- `CStandardPage`：标准页面模板（推荐给业务页面），**请使用 `mode="integrated"`**。
- `CTable`：底层灵活组件（推荐给高级自定义页面），**请务必传入 `appId`**。

如果你要“高度定制工具条/筛选/布局联动”，优先直接使用 `CTable` 并手动管理 `CSmartFilter`。
