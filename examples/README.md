# ORBCAFE UI Official Examples

本目录是 `orbcafe-ui` 的官方示例工程（Next.js App Router），也是组件库和 AI skills 的视觉/交互基准。

更多图文说明见仓库根目录：

- `../docs/EXAMPLES.md`
- `../docs/VIBE_CODING.md`

## 环境要求

- Node.js 18+
- npm 9+

## 启动方式

在仓库根目录先构建一次库产物：

```bash
npm run build
```

再进入示例目录启动：

```bash
cd examples
npm run dev
```

默认访问：

- `http://localhost:3000/`
- `http://localhost:3000/login`
- `http://localhost:3000/std-report`（包含 `CValueHelp` 客户字段：点击搜索按钮或按 F4 打开值帮助弹窗）
- `http://localhost:3000/planning`（多列生产计划表格 + 甘特图；支持每页条目数、50/50 分屏切换和手工拖动）
- `http://localhost:3000/kanban`
- `http://localhost:3000/pivot-table`（内置 Preset 官方样板：支持保存/加载/删除 rows/columns/filters/values 组合）
- `http://localhost:3000/detail-info/ID-1`
- `http://localhost:3000/pad`
- `http://localhost:3000/chat`
- `http://localhost:3000/copilot`
- `http://localhost:3000/aipanel`
- `http://localhost:3000/ai-nav`

## 示例覆盖范围

| Route | 覆盖组件 |
| --- | --- |
| `/` | `CAppPageLayout`, `NavigationIsland`, dashboard overview |
| `/login` | `CAuthPage`, `useAuthPage` |
| `/std-report` | `CAppPageLayout`, `CStandardPage`, `CSmartFilter`, `CTable`, `CValueHelp`, `useStandardReport` |
| `/planning` | `CPlanningLayout`, `CPlanningGantt`, `usePlanningLayout` |
| `/kanban` | `CKanbanBoard`, `useKanbanBoard`, DetailInfo 跳转 |
| `/pivot-table` | `CPivotTable`, preset 持久化, pivot chart companion views |
| `/detail-info/ID-1` | `CDetailInfoPage`, sections, tabs, related table, AI fallback |
| `/pad` | `PAppPageLayout`, `PTable`, `PSmartFilter`, `PNumericKeypad`, `PBarcodeScanner` |
| `/chat` | `StdChat`, markdown/math/code/Mermaid/dynamic cards |
| `/copilot` | `CopilotChat` + app-owned floating drag/resize shell |
| `/aipanel` | `AgentPanel`, agent status states |
| `/ai-nav` | `CAINavProvider`, `useAINav` |

## 质量检查（建议提交前执行）

```bash
cd examples
npm run lint
npx tsc --noEmit
```

## Next.js 16 注意事项

### 1. `page.tsx` 建议使用 Server Wrapper

`params` / `searchParams` 在 Next 16 是 Promise 语义。  
推荐在 `page.tsx`（Server Component）里先解包，再把纯值传给 Client Component。

### 2. 避免 hydration mismatch

不要让这些值直接影响首屏结构：

- `usePathname()` 的动态路由高亮
- `Date.now()` / `Math.random()`
- `window` / `localStorage` 首屏条件分支

需要时请在 `useEffect` 后再启用（`mounted` 模式）。

## 常见问题

- 报错 `searchParams is a Promise...`  
  说明你在错误层级同步访问了 `searchParams`。
- 报错 `params are being enumerated`  
  说明你对 `params` 做了枚举操作（如 `Object.keys`）。
- 报错 `Hydration failed...`  
  说明 SSR/CSR 首屏渲染不一致。
