# ORBCAFE UI

面向 React / Next.js 的企业级 UI 组件库，目标是作为可复用的 NPM 包发布并长期维护。

## Project Goal

- 组件可直接通过 NPM 安装并使用。
- 组件 API 稳定、类型完整、目录结构一致。
- 组件内部逻辑可复用（通过 Hooks），文档可追踪（README 规范化）。

---

## 组件总目录（先看这里）

下表用于快速判断“该用哪个组件、去哪个目录、看哪份细节文档”。

| 模块 | 典型用途 | 代码目录 | 先看文档 |
| --- | --- | --- | --- |
| `Atoms` | 基础输入/按钮/文本等原子能力，作为上层组件基础件 | `src/components/Atoms` | `src/components/Atoms/README.md` |
| `Molecules` | 组合型基础组件（如统一消息框） | `src/components/Molecules` | `src/components/Molecules/README.md` |
| `Navigation-Island` | 左侧导航树、折叠导航、菜单路由入口 | `src/components/Navigation-Island` | `src/components/Navigation-Island/README.md` |
| `StdReport` | 标准报表主容器（筛选、表格、分页、变体、布局） | `src/components/StdReport` | `src/components/StdReport/README.md` |
| `GraphReport` | 图形报表弹窗（KPI、图表、联动、AI 输入区） | `src/components/GraphReport` | `src/components/GraphReport/README.md` |
| `CustomizeAgent` | AI 参数与 Prompt 模板设置弹窗 | `src/components/CustomizeAgent` | `src/components/CustomizeAgent/README.md` |
| `DetailInfo` | 标准详情页容器（信息块 + Tabs + 底部表格 + AI/搜索） | `src/components/DetailInfo` | `src/components/DetailInfo/README.md` |
| `PageLayout` | 页面壳层（Header + Navigation + Content） | `src/components/PageLayout` | `src/components/PageLayout/README.md` |

### 文档查阅顺序（推荐）

1. 先看模块根 README：了解能力边界、最小接入示例。  
2. 再看模块 `Hooks/README.md`：确认状态管理、参数、返回值与联动方式。  
3. 最后看模块详细设计文档（如 `graphreport.md`）：理解内部结构与扩展点。  

### 常用文档索引

- `GraphReport` 详细设计：`src/components/GraphReport/graphreport.md`
- `GraphReport Hooks`：`src/components/GraphReport/Hooks/README.md`
- `StdReport Hooks`：`src/components/StdReport/Hooks/README.md`
- `PageLayout Hooks`：`src/components/PageLayout/Hooks/README.md`
- `DetailInfo` 模块文档：`src/components/DetailInfo/README.md`

---

## 重点组件：CMessageBox（请优先使用）

`CMessageBox` 是标准体系里用于统一提示/确认交互的基础分子组件，适用于：

- 删除确认
- 保存成功提示
- 警告/错误弹窗
- 通用信息提醒

> 建议在项目中统一使用 `CMessageBox`，避免各页面自行拼装不一致的 Dialog 样式。

### Import

```tsx
import { CMessageBox } from 'orbcafe-ui';
```

### 最小示例

```tsx
const [open, setOpen] = useState(false);

<CMessageBox
  open={open}
  type="warning"
  title="Delete Item"
  message="Are you sure you want to delete this record?"
  confirmText="Delete"
  cancelText="Cancel"
  onClose={() => setOpen(false)}
  onConfirm={() => {
    // do delete
    setOpen(false);
  }}
/>;
```

### 标准约定

- `type`: `success | warning | error | info | default`
- 默认支持确认与取消按钮，可通过 `showCancel` 控制
- 建议所有业务确认弹窗统一走该组件，保证品牌与交互一致

---

## Installation

```bash
npm install orbcafe-ui
# or
yarn add orbcafe-ui
# or
pnpm add orbcafe-ui
```

如果使用 Tailwind，请确保扫描到库产物：

```js
// tailwind.config.js
module.exports = {
  content: [
    "./node_modules/orbcafe-ui/dist/**/*.{js,mjs}",
  ],
}
```

### Next.js App Router 最小接入（推荐）

```tsx
// app/page.tsx (Server Component)
import HomeClientPage from './HomeClientPage';

export default function Page() {
  return <HomeClientPage />;
}
```

```tsx
// app/HomeClientPage.tsx (Client Component)
'use client';

import { CAppPageLayout } from 'orbcafe-ui';

export default function HomeClientPage() {
  return <CAppPageLayout appTitle="ORBCAFE" menuData={[]} />;
}
```

---

## Next.js 16 兼容性说明（务必阅读）

官方 example 已按 Next.js `16.1.6` 调整，接入时请遵循以下规则：

### 1. 动态路由参数必须在 Server Page 解包

在 Next 16 中，`params` / `searchParams` 是 Promise 语义。  
不要在 Client Page 里直接把它当普通对象枚举或访问属性。

推荐写法：

```tsx
// app/detail/[id]/page.tsx (Server Component)
import DetailClientPage from './DetailClientPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <DetailClientPage rowId={id} />;
}
```

### 2. Client Component 避免首屏依赖不稳定值

Hydration mismatch 常见来源：

- 首屏直接使用 `usePathname()` 结果做高亮
- `Date.now()` / `Math.random()` 直接参与首屏渲染
- 仅在浏览器可用的数据（`window` / `localStorage`）首屏参与结构分支

建议：

- 用 `mounted`（`useEffect` 后置为 `true`）再启用这类 UI 高亮/分支
- 浏览器侧状态在 `useEffect` 中读取
- 保持 SSR 首屏与 CSR 首帧 DOM 结构一致

### 3. 常见报错对照

- `searchParams is a Promise and must be unwrapped with React.use()`  
  根因：在错误层级直接同步访问了 `searchParams`。
- `params are being enumerated`  
  根因：对 `params` 做了 `Object.keys/entries` 或扩展操作。
- `Hydration failed because the server rendered HTML didn't match the client`  
  根因：SSR 与 CSR 首屏输出不一致（通常由路由状态或浏览器变量引起）。

---

## 官方 Example 验证命令

提交前建议至少执行：

```bash
# 1) 构建组件库
npm run build

# 2) 校验 examples
cd examples
npm run lint
npx tsc --noEmit
```

如果只想快速看运行效果：

```bash
cd examples
npm run dev
```

---

## Internationalization (i18n)

ORBCAFE UI 标准组件已内置 6 种语言：

- `en` (English)
- `zh` (中文)
- `fr` (Français)
- `de` (Deutsch)
- `ja` (日本語)
- `ko` (한국어)

可通过 `OrbcafeI18nProvider` 或 `CAppPageLayout.locale` 统一控制语言。

### 方式 1：在应用根部包裹 Provider

```tsx
import { OrbcafeI18nProvider } from 'orbcafe-ui';

<OrbcafeI18nProvider locale="de">
  <YourApp />
</OrbcafeI18nProvider>
```

### 方式 2：使用 PageLayout 时直接传 `locale`

```tsx
<CAppPageLayout
  appTitle="ORBCAFE"
  locale="ja"
  menuData={menuData}
>
  {children}
</CAppPageLayout>
```

组件内部统一使用同一套翻译 key，避免出现中英混搭。

### 国际化维护规范（必须）

- 所有标准组件可见文案必须通过 `useOrbcafeI18n().t()` 读取，不允许新增硬编码文案。
- 统一词条源：`src/i18n/messages.ts`。
- 新增文案时必须同时补齐 6 个语言分支：`en/zh/fr/de/ja/ko`。
- 业务字段值（如状态、类别）建议采用“稳定 value + 本地化 label”模式，避免筛选逻辑与展示文案耦合。
- 示例工程（`examples/app/std-report/page.tsx`）已按该模式实现，作为接入参考。

---

## ORBCAFE UI 标准化规范（Template Spec）

以下规范适用于“成形组件（Standard Component）”，例如：
- `Navigation-Island`
- `StdReport`

### 1. 标准组件目录结构（必须）

每个成形组件使用独立目录：

```text
src/components/<StandardComponent>/
├── index.ts                     # 本组件统一导出入口（必须）
├── <MainComponent>.tsx          # 主组件（必须）
├── Components/                  # 仅放该标准组件私有子组件（可选）
├── Hooks/                       # 仅放该标准组件 Hooks（必须）
│   ├── README.md                # Hooks 使用说明（必须）
│   └── useXxx.ts                # 一个或多个 hooks
├── Structures/                  # 布局结构组件（可选）
├── types.ts                     # 公共类型（建议）
└── *.md                         # 组件文档（建议）
```

说明：
- 如果该标准组件有专用子组件，统一放在 `Components/` 下，不要散落到其他目录。
- 所有标准组件必须提供 `Hooks/`，即使只有一个 Hook 也要建立目录。
- `Hooks/README.md` 是强制项，至少包含：用途、参数、返回值、最小示例。

### 2. 命名规范（必须）

- 标准组件目录使用业务语义名称（例如 `StdReport`、`Navigation-Island`）。
- Hook 文件统一 `use-*.ts` 或 `use*.ts`，并保持项目内一致。
- Hook 导出名称必须以 `use` 开头，例如 `useNavigationIsland`、`useStandardReport`。
- 对外组件与 Hook 的导出名称应稳定，避免频繁重命名。

### 3. 导出规范（必须）

- 每个标准组件目录必须有 `index.ts` 作为本目录的聚合导出入口。
- 根入口 `src/index.ts` 必须只做统一导出，不写业务逻辑。
- 新增组件时必须同步更新：
  - `src/components/<StandardComponent>/index.ts`
  - `src/index.ts`

### 4. Hooks 规范（必须）

每个标准组件至少提供一个可直接接入的 Hook，负责：
- 状态管理（如折叠态、筛选态、分页态）
- 默认行为封装（如 toggle、filter、sort）
- 向主组件提供可直接 spread 的 props（推荐）

建议返回结构：

```ts
{
  state,
  actions,
  componentProps
}
```

最小要求：
- 强类型输入输出（避免 `any` 外溢到公共 API）
- 可控/非可控模式边界清晰
- README 中有完整示例

### 5. 文档规范（必须）

每个标准组件至少包含以下文档：
- `Hooks/README.md`（强制）
- 组件主文档 `*.md`（建议，例如 `stdreport.md`）

`Hooks/README.md` 模板建议：
- Hook 列表
- 每个 Hook 的参数表
- 返回值表
- 典型接入示例
- 常见坑与约束

### 6. UI 与主题规范（NPM 发布建议）

- 不写死主题关键色，优先使用主题 token（MUI theme / CSS variables）。
- 深色模式必须可用，至少覆盖：
  - 背景色
  - 字体颜色
  - 交互态（hover/active/disabled）
- 默认尺寸、字体、间距在同一模块内保持一致（如 SmartFilter 与相关输入控件一致）。

### 7. 兼容性与发布规范（必须）

- 保持 `dist` 产物稳定（ESM/CJS/types）。
- `peerDependencies` 明确声明 React/Next 兼容范围。
- API 变更必须记录（建议在 CHANGELOG）。
- 发布前至少完成：
  - 类型构建通过
  - 示例工程可验证
  - 关键组件 smoke test

---

## 当前项目落地范例

### Navigation-Island（已标准化方向）

- 主组件：`src/components/Navigation-Island/navigation-island.tsx`
- 专用组件：`src/components/Navigation-Island/tree-menu.tsx`、`button.tsx`
- Hook：`src/components/Navigation-Island/Hooks/use-navigation-island.ts`（建议统一收敛到 `Hooks/`）

### StdReport（标准范例）

- 主组件：`src/components/StdReport/CStandardPage.tsx`
- 专用子组件：`src/components/StdReport/Components/*`
- Hooks：`src/components/StdReport/Hooks/*`
- Hooks 文档：`src/components/StdReport/Hooks/README.md`

---

## Recommended Usage Example

以 Navigation Island 为例，推荐通过 Hook 接入：

```tsx
import { NavigationIsland, useNavigationIsland } from 'orbcafe-ui';

const { navigationIslandProps } = useNavigationIsland({
  initialCollapsed: false,
  content: menuData,
});

<NavigationIsland {...navigationIslandProps} />
```

---

## License

MIT
