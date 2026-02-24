# DetailInfo

`DetailInfo` 用于“列表 -> 详情页”的标准场景，内置三段式结构：

- 信息块（Section cards）
- Tabs 详情区
- 底部关联表格（`CTable`）

并且包含一个 Search + AI 一体输入栏：

- 先做字段搜索（搜索 `sections + tabs` 中可检索字段）
- 无匹配时自动回退到 `ai.onSubmit`
- 搜索命中项可点击，自动跳转到对应 Tab/信息区块

## 组件

- `CDetailInfoPage`：详情页主容器
- `useDetailInfo`：搜索/AI/Tab 状态管理 Hook

## 最小示例

```tsx
import { CDetailInfoPage } from 'orbcafe-ui';

export default function DetailPage() {
  return (
    <CDetailInfoPage
      title="Invoice #INV-2026-001"
      subtitle="Created at 2026-02-24"
      sections={[
        {
          id: 'basic',
          title: 'Basic Info',
          fields: [
            { id: 'invoiceId', label: 'Invoice ID', value: 'INV-2026-001' },
            { id: 'customer', label: 'Customer', value: 'Schunk Intec' },
          ],
        },
        {
          id: 'amount',
          title: 'Amount',
          fields: [
            { id: 'currency', label: 'Currency', value: 'EUR' },
            { id: 'total', label: 'Total', value: '9,455.50' },
          ],
        },
      ]}
      tabs={[
        {
          id: 'timeline',
          label: 'Timeline',
          fields: [
            { id: 'createdBy', label: 'Created By', value: 'Liu, Gang' },
            { id: 'approvedBy', label: 'Approved By', value: 'Shen, Ruiyang' },
          ],
        },
        {
          id: 'notes',
          label: 'Notes',
          description: 'Business notes and audit comments.',
          content: <div>Custom content area...</div>,
        },
      ]}
      ai={{
        enabled: true,
        onSubmit: async (query) => {
          return `### AI Insight\nNo direct field match for: **${query}**`;
        },
      }}
      table={{
        title: 'Related Records',
        tableProps: {
          columns: [
            { id: 'id', label: 'ID' },
            { id: 'item', label: 'Item' },
            { id: 'amount', label: 'Amount', numeric: true },
          ],
          rows: [
            { id: '1', item: 'Labor', amount: 612.5 },
            { id: '2', item: 'Travel', amount: 1225.0 },
          ],
          rowKey: 'id',
          showToolbar: true,
        },
      }}
    />
  );
}
```

## Props（主入口）

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `string` | 页面标题 |
| `subtitle` | `string` | 页面副标题 |
| `sections` | `DetailInfoSection[]` | 顶部信息块 |
| `tabs` | `DetailInfoTab[]` | 中部 Tab 区域 |
| `defaultTabId` | `string` | 默认 Tab |
| `table` | `DetailInfoTableConfig` | 底部 `CTable` 配置 |
| `ai` | `DetailInfoAiConfig` | Search + AI 配置 |
| `rightHeaderSlot` | `ReactNode` | 头部右侧插槽（按钮/状态） |

## 字段检索规则

- 会检索：
  - `sections[].fields[].label/value/searchableText`
  - `tabs[].fields[].label/value/searchableText`
  - `tabs[].sections[].fields[].label/value/searchableText`
- `searchableText` 可覆盖默认值，适合复杂 React 节点字段。

## AI 返回渲染

- `ai.onSubmit` 返回字符串后，会在页面中以 Markdown 方式渲染。
- 支持常见语法：`#` 标题、无序/有序列表、`` `inline code` ``、代码块。
