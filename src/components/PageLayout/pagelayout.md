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

## 用户菜单扩展策略

为避免把业务登出逻辑写死在组件库中，`PageLayout` 提供了两层扩展能力：

1. `onUserSetting` / `onUserLogout`
2. `userMenuItems`（完全覆盖默认菜单）

### 推荐：接管默认菜单行为

```tsx
<CAppPageLayout
  appTitle="ORBCAFE"
  menuData={menuData}
  user={{ name: 'Ruiyang Shen' }}
  onUserSetting={() => router.push('/settings')}
  onUserLogout={() => auth.logout()}
>
  <CStandardPage {...pageProps} />
</CAppPageLayout>
```

### 高自定义：覆盖菜单定义

```tsx
<CAppPageLayout
  appTitle="ORBCAFE"
  menuData={menuData}
  user={{ name: 'Ruiyang Shen' }}
  userMenuItems={[
    { key: 'setting', label: 'Setting', onClick: () => router.push('/settings') },
    { key: 'logoff', label: 'Logoff', onClick: () => auth.logout() },
  ]}
>
  <CStandardPage {...pageProps} />
</CAppPageLayout>
```

## 关键 Props

| Props | 说明 |
| --- | --- |
| `user` | 用户信息，不传则不显示头像与用户菜单。 |
| `onUserSetting` | 默认 Setting 菜单回调。 |
| `onUserLogout` | 默认 Logout 菜单回调。 |
| `userMenuItems` | 完全自定义用户菜单项。 |
