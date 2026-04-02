# ORBCAFE UI Official Examples

本目录是 `orbcafe-ui` 的官方示例工程（Next.js App Router）。

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
- `http://localhost:3000/std-report`
- `http://localhost:3000/kanban`
- `http://localhost:3000/pivot-table`（内置 Preset 官方样板：支持保存/加载/删除 rows/columns/filters/values 组合）
- `http://localhost:3000/detail-info/ID-1`
- `http://localhost:3000/ai-nav`

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
