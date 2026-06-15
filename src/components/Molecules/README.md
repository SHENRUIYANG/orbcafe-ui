# Molecules

中层组合组件目录（由多个 Atoms 组合形成）。

## 使用方式

- 直接从包入口引入：`import { ... } from 'orbcafe-ui'`
- 若需要二次封装，建议保持 props 透传，避免破坏主题和样式一致性。

## 典型组件

- `CDateRangePicker`
- `CValueHelp`
- `CLayoutManagement`
- 其他表单/弹窗/组合交互组件

## CValueHelp

`CValueHelp` 是 SAP Search Help / F4 Help 风格的字段值帮助组件：

- 字段显示已选 key 和 description，输入框只读，避免用户手输非法 key。
- 点击搜索按钮或按 `F4` 打开值帮助弹窗。
- 弹窗内支持本地搜索、远程 `onSearch`、单选/多选、双击单选回填。
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
- `mode="single"` 时 `onChange` 返回单个 value 或 `null`，`CSmartFilter` 使用 `equals` 操作符。
- `mode="multiple"` 时 `onChange` 返回 value 数组，`CSmartFilter` 使用 `anyOf` 操作符。
- `onSearch(query)` 用于远程搜索；返回数组会替换弹窗候选项，不返回数组时由宿主自行更新 `items/loading`。
- 多语言场景保持 value 稳定，只本地化 label、dialogTitle、列标题和按钮文案。
