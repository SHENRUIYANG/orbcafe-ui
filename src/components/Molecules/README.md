# Molecules

中层组合组件目录（由多个 Atoms 组合形成）。

## 使用方式

- 只有下面"可从包入口获取"列出的组件才能 `import { ... } from 'orbcafe-ui'`；其余 Molecules 是内部实现细节，不对外导出，不要指导消费方直接从这里引入。
- 若需要二次封装，建议保持 props 透传，避免破坏主题和样式一致性。

## 可从包入口获取

- `CMessageBox`（直接从 `src/index.ts` 导出）
- `CValueHelp`（直接从 `src/index.ts` 导出）
- `CStatusBadge`（直接从 `src/index.ts` 导出）
- `CList` 及 `CListItem`/`CListItemButton`/`CListItemIcon`/`CListItemText`/`CListSubheader`/`CListItemAvatar` 等（直接从 `src/index.ts` 导出）
- `CFilterField`（直接从 `src/index.ts` 导出）
- `CLayoutManagement`（通过 `StdReport` 间接导出，`import { CLayoutManagement } from 'orbcafe-ui'` 依然可用）

## 内部组件（不对外导出）

- `CDateRangePicker`
- `CVariantManagement`
- `CAppHeaderActions`

## CValueHelp

`CValueHelp` 是 SAP Search Help / F4 Help 风格的字段值帮助组件：

- 字段显示已选 key 和 description，默认也允许用户直接手工输入 key。
- 点击搜索按钮或按 `F4` 打开值帮助弹窗。
- 弹窗内支持本地搜索、远程 `onSearch`、单选/多选、双击单选回填。
- 需要强制只能从候选项选择时，可设置 `allowManualInput={false}`。
- 手工输入默认会按当前 `items` / `selectedItems` 校验；不合法时显示错误且不会回写筛选值。
- 可作为独立字段使用，也可以在 `CSmartFilter` / `PSmartFilter` 字段上配置 `isValueHelp: true` 或 `type: 'value-help'`。

### 独立字段

```tsx
import { CValueHelp } from 'orbcafe-ui';

<CValueHelp
  label="Customer"
  value={customerId}
  items={customers}
  columns={[
    { field: 'customerId', label: 'Customer', minWidth: 120 },
    { field: 'customerName', label: 'Name', minWidth: 220 },
    { field: 'country', label: 'Country', minWidth: 100 },
  ]}
  getOptionValue={(item) => item.customerId}
  getOptionLabel={(item) => item.customerName}
  getOptionDescription={(item) => item.country}
  onChange={(value, selection) => {
    setCustomerId(value);
    setCustomer(selection);
  }}
/>
```

### SmartFilter 字段

```tsx
{
  id: 'customer',
  label: 'Customer',
  type: 'value-help',
  valueHelp: {
    dialogTitle: 'Customer Value Help',
    items: customers,
    columns: [
      { field: 'customerId', label: 'Customer' },
      { field: 'customerName', label: 'Name' },
      { field: 'country', label: 'Country' },
    ],
    getOptionValue: (item) => item.customerId,
    getOptionLabel: (item) => item.customerName,
  },
}
```

### 数据契约

- 默认 value 字段按 `value -> id -> key -> code` 取值；生产代码建议显式传 `getOptionValue`。
- 默认 label 字段按 `label -> description -> name -> title` 取值；生产代码建议显式传 `getOptionLabel`。
- 默认允许手工输入并校验合法性。单选手输命中候选项后返回该 key；多选手输按逗号、分号或换行拆分，并要求每个 key 都命中候选项。
- 如果业务允许任意 key，可设置 `validateManualInput={false}`。
- `mode="single"` 时 `onChange` 返回单个 value 或 `null`，`CSmartFilter` 使用 `equals` 操作符。
- `mode="multiple"` 时 `onChange` 返回 value 数组，`CSmartFilter` 使用 `anyOf` 操作符。
- `onSearch(query)` 用于远程搜索；返回数组会替换弹窗候选项，不返回数组时由宿主自行更新 `items/loading`。
- 多语言场景保持 value 稳定，只本地化 label、dialogTitle、列标题和按钮文案。
