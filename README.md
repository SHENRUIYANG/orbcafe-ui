# ORBCAFE UI

面向 React / Next.js 的企业级 UI 组件库，目标是作为可复用的 NPM 包发布并长期维护。

## Project Goal

- 组件可直接通过 NPM 安装并使用。
- 组件 API 稳定、类型完整、目录结构一致。
- 组件内部逻辑可复用（通过 Hooks），文档可追踪（README 规范化）。

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

