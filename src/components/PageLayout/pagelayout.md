# PageLayout

`PageLayout` 是 ORBCAFE UI 的应用页面壳层组件，用于标准化以下布局结构：

1. 顶部 `App Header`
2. 左侧 `Navigation Island`
3. 右侧主内容区（可直接承载 `StdReport`）

## 目录结构

```text
src/components/PageLayout/
├── CAppPageLayout.tsx
├── Components/
│   └── CAppHeader.tsx
├── Hooks/
│   ├── usePageLayout.ts
│   └── README.md
├── types.ts
└── index.ts
```

## 设计原则

- 去业务耦合：不依赖具体项目服务、路由或私有 UI 包。
- 组件化：Header 与 Shell 分离，便于替换与扩展。
- 标准化：通过 Hook 提供统一布局状态管理。

## 典型接入

```tsx
<CAppPageLayout appTitle="ORBCAFE" menuData={menuData}>
  <CStandardPage {...pageProps} />
</CAppPageLayout>
```

