# CardPage

Published copy of `src/components/CardPage/README.md`.

---

`CardPage` 是 ORBCAFE UI 的卡片目录（商店式）页面能力集合，适合"上架一个个应用/内容"的场景（类似 Apple Store 的列表形态）：

- `CCardPage`：页面级组合（上方 `CSmartFilter` 筛选栏 + 下方卡片网格）
- `CCardGrid` / `CCardGridCard`：卡片网格与单卡片
- `CCardDetailPanel`：居中浮现的详情卡片（点击卡片"查看详情"自动打开，无需路由跳转；居中而非侧边抽屉，鼠标移动距离最短）
- `useCardPage`：数据 Hook（对应 StdReport 的 `useStandardReport`）

卡片内容固定为：图标 + 标题 + 小字简介（固定 3 行截断）+ 查看详情按钮（图标）+ 下载按钮（图标）。

---

## 1. 最快上手（推荐）

与 `useStandardReport` 完全相同的套路：定义 metadata（id + filters + variants），提供 `fetchData`，把 `pageProps` 展开到 `CCardPage`。

```tsx
'use client';

import { CCardPage, useCardPage, type CardPageMetadata, type CCardItem } from 'orbcafe-ui';

const metadata: CardPageMetadata = {
  id: 'app-store-page', // 【必填】全局唯一标识，用于 Variant 隔离
  title: 'App Store',
  filters: [
    { id: 'search', label: 'Search', type: 'text', placeholder: 'Search apps...' },
    {
      id: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'Analytics', value: 'analytics' },
        { label: 'AI', value: 'ai' },
      ],
    },
  ],
  variants: [
    { id: 'v1', name: 'All Apps', isDefault: true, scope: 'Both', filters: [], layout: {} },
  ],
};

export default function Page() {
  const { pageProps } = useCardPage({
    metadata,
    fetchData: async (params) => {
      // 返回 { rows, total }，与报表接口契约一致
      return { rows: [], total: 0 };
    },
    onDetailClick: (item) => console.log('view details', item.id),
    onDownloadClick: (item) => console.log('download', item.id),
  });

  return (
    <div style={{ height: 'calc(100vh - 120px)' }}>
      <CCardPage {...pageProps} />
    </div>
  );
}
```

---

## 2. 卡片数据（`CCardItem`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 唯一标识（必填） |
| `title` | `string` | 标题（必填），超长自动省略 |
| `description` | `string` | 简介小字，固定 3 行截断（超出省略号） |
| `icon` | `SapIconName` | SAP 图标名（如 `'barChart'`），默认 `'product'` |
| `iconNode` | `ReactNode` | 完全自定义图标节点，优先于 `icon` |
| `meta` | `string` | 标题下方的小字元信息（版本、供应商等） |

`CCardItem` 继承 `Record<string, unknown>`，可以附加任意业务字段，点击回调会原样带回。

---

## 3. 组件 Props

### `CCardPage`

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | — | 页面唯一标识，同时作为筛选栏 Variant 的 `appId` |
| `title` | `string` | — | 页面标题 |
| `hideHeader` | `boolean` | `true` | 是否隐藏页头标题 |
| `filterConfig` | `CSmartFilterProps` | — | 智能筛选栏配置（与 StdReport 相同） |
| `gridProps` | `CCardGridProps` | — | 卡片网格配置 |
| `spacing` | `number` | `1` | 筛选栏与网格的间距（8px 倍数） |

### `CCardGrid`

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `items` | `CCardItem[]` | — | 卡片数据 |
| `loading` | `boolean` | `false` | 加载中显示 Spinner |
| `onDetailClick` | `(item) => void` | — | “查看详情”图标按钮回调（面板打开时也会触发，可作埋点） |
| `onDownloadClick` | `(item) => void` | — | “下载”图标按钮回调（卡片与详情面板底部按钮共用） |
| `minCardWidth` | `number` | `260` | 网格最小卡片宽度（px），列数自适应 |
| `detailPanel` | `boolean` | `true` | 内建详情面板：点击“查看详情”居中浮现详情卡片；置 `false` 则完全由 `onDetailClick` 自定义（如路由跳转） |
| `renderDetailContent` | `(item) => ReactNode` | — | 自定义详情面板正文；默认渲染完整简介 + 附加字段列表 |
| `detailTooltip` / `downloadTooltip` | `string` | i18n 默认值 | 覆盖按钮提示文案 |
| `emptyText` | `string` | i18n 默认值 | 空数据文案 |

### `CCardDetailPanel`

详情面板也可脱离网格单独使用（受控组件）：

```tsx
const [item, setItem] = useState<CCardItem | null>(null);

<CCardDetailPanel
  item={item}
  open={!!item}
  onClose={() => setItem(null)}
  onDownloadClick={(it) => download(it.id)}
/>
```

- 正文默认渲染：完整简介 + `CCardItem` 上所有原始类型附加字段（自动美化字段名，如 `releaseDate` → “Release Date”）；可用 `renderContent` 完全自定义。
- 面板通过 Portal 渲染到 `document.body`，覆盖整个视口；支持 Esc / 点击遮罩 / 关闭按钮三种关闭方式。
- 页面容器（如 `CPageTransition`）带有 `will-change: transform`，直接在页面内 `position: fixed` 会被裁剪——必须使用 Portal。

---

## 4. `useCardPage` Hook

```tsx
const { pageProps, items, total, filters, loading, refresh } = useCardPage({
  metadata,        // { id, title, filters, variants? }
  fetchData,       // (params) => Promise<{ rows, total }>
  tableKey,        // 可选，Variant 隔离键（默认 'default'）
  variantService,  // 可选，后端 Variant 服务
  serviceUrl,      // 可选
  onDetailClick,   // 可选
  onDownloadClick, // 可选
  minCardWidth,    // 可选
});
```

- `fetchData` 的入参是筛选值（`{ [fieldId]: { value, operator } }`），返回 `{ rows, total }` —— 与 `useStandardReport` 完全一致的契约，同一后端接口可以同时服务表格报表页和卡片目录页。
- 点击筛选栏的 **Go** 触发 `fetchData`；加载 Variant 会自动应用其中保存的筛选值并重新拉取。

---

## 5. 国际化（i18n）

组件内建文案（按钮 tooltip、空状态）已接入 `OrbcafeI18nProvider`（`en/zh/fr/de/ja/ko`）：

| Key | en | zh |
| --- | --- | --- |
| `cardPage.viewDetails` | View Details | 查看详情 |
| `cardPage.download` | Download | 下载 |
| `cardPage.close` | Close | 关闭 |
| `cardPage.empty` | No items found | 未找到条目 |

页面级文案（筛选标签、卡片内容等）由业务方按 `OrbcafeLocale` 提供，参考 `examples/app/_components/CardPageExampleClient.tsx`。

---

## 6. 完整示例

参考示例应用：`examples/app/card-page`（`examples/app/_components/CardPageExampleClient.tsx`），包含 12 个模拟应用、搜索/类别/供应商筛选、Variant 定义以及六语言文案。
