# PageLayout

Published copy of `src/components/PageLayout/README.md`.

---

应用页面壳层（Header + Navigation Island + 内容区）。

## 快速使用

```tsx
import { CAppPageLayout } from 'orbcafe-ui';

<CAppPageLayout
  appId="customer-portal"
  appTitle="ORBCAFE UI"
  menuData={[{ id: 'std', title: 'Standard Report', href: '/std-report' }]}
  logo={<img src="/brand/logo.svg" alt="Customer Portal" width={36} height={36} />}
  user={{ name: 'Ruiyang Shen' }}
  onUserLogout={() => auth.logout()}
>
  <div>Page Content</div>
</CAppPageLayout>
```

`appId` 应在整个应用中保持不变，用于隔离主题、语言、导航模式和 pin 偏好。`appTitle` 可以按语言或页面变化，不应再承担持久化身份。

## 主题受控接入

宿主已有自己的主题状态时，使用 `mode` / `onModeChange` 同步，不需要监听 DOM attribute：

```tsx
import { useState } from 'react';
import { CAppPageLayout, type OrbModeSetting } from 'orbcafe-ui';

const [mode, setMode] = useState<OrbModeSetting>('system');

<CAppPageLayout
  appId="customer-portal"
  appTitle="Customer Portal"
  mode={mode}
  onModeChange={setMode}
>
  <div>Page Content</div>
</CAppPageLayout>
```

## 用户菜单接入（重点）

头像菜单默认包含 `Setting` 和 `Logout` 两项。你可以按下面两种方式接入。

### 方式 1：仅接管默认项行为（推荐）

适合只想复用库里的菜单 UI，但把点击逻辑交给业务项目。

```tsx
<CAppPageLayout
  appTitle="ORBCAFE UI"
  user={{ name: 'Ruiyang Shen', subtitle: 'ruiyang.shen@orbis.de' }}
  onUserSetting={() => router.push('/settings')}
  onUserLogout={() => auth.logout()}
>
  <div>Page Content</div>
</CAppPageLayout>
```

### 方式 2：完全自定义菜单项

适合菜单文案、顺序、动作都要按业务定制的场景。

```tsx
import { LogOut, Settings } from 'orbcafe-ui';

<CAppPageLayout
  appTitle="ORBCAFE UI"
  user={{ name: 'Ruiyang Shen' }}
  userMenuItems={[
    {
      key: 'setting',
      label: 'Setting',
      icon: <Settings />,
      onClick: () => router.push('/settings'),
    },
    {
      key: 'logoff',
      label: 'Logoff',
      icon: <LogOut />,
      onClick: () => auth.logout(),
    },
  ]}
>
  <div>Page Content</div>
</CAppPageLayout>
```

## 常用参数

| Name | Type | Description |
| --- | --- | --- |
| `appId` | `string` | 推荐设置的稳定应用标识；用于生成应用级持久化 key，不随标题或语言变化。 |
| `mode` | `'light' \| 'dark' \| 'system'` | 受控主题设置。 |
| `defaultMode` | `'light' \| 'dark' \| 'system'` | 非受控主题初始值；默认 `'system'`。 |
| `onModeChange` | `(mode) => void` | Header 请求切换主题后的回调。与 `mode` 一起使用可同步宿主设计系统。 |
| `user` | `{ name; subtitle?; avatarText?; avatarSrc? }` | 控制头像与用户名展示；不传时不显示用户菜单。 |
| `onUserSetting` | `() => void` | 默认 `Setting` 点击回调。 |
| `onUserLogout` | `() => void` | 默认 `Logout` 点击回调。 |
| `userMenuItems` | `Array<{ key; label; icon?; onClick?; disabled? }>` | 覆盖默认菜单，完全自定义项。 |
| `searchPlacement` | `'hidden' \| 'header' \| 'floating'` | AI 输入条位置；默认 `'hidden'`，标准 Layout 不会自动在 Header 中显示 AI 输入框。 |
| `onSearch` | `(query: string) => void` | AI 输入条发送回调；回车、发送按钮、语音完成都会触发。提交成功后输入框会自动清空。 |
| `onSearchAdd` | `() => void` | Header 中间 AI 输入条左侧 `+` 按钮回调，可用于打开功能菜单。 |
| `locale` | `'en' \| 'zh' \| 'fr' \| 'de' \| 'ja' \| 'ko'` | 受控模式下的当前语言；未传 `onLocaleChange` 时作为初始语言，之后由 Layout 管理。 |
| `onLocaleChange` | `(locale) => void` | 可选的受控语言回调；不传时 Header 仍可切换语言，并自动保存用户选择。 |
| `enableNavigationPinning` | `boolean` | 是否允许菜单 pin 到顶部；默认 `true`。 |
| `navigationPinStorageKey` | `string` | 非受控模式下的 localStorage key；优先显式值，其次按 `appId` 生成，最后兼容按 `appTitle` 生成。 |
| `pinnedNavigationItemIds` | `string[]` | 受控模式下已 pin 的菜单项 id。 |
| `defaultPinnedNavigationItemIds` | `string[]` | 非受控模式的默认 pin 项。 |
| `onPinnedNavigationItemIdsChange` | `(ids: string[]) => void` | pin/unpin 后回传新的 id 列表。 |
| `pinnedNavigationSectionTitle` | `string` | 顶部收藏分组标题；默认走 i18n 文案。 |

## 说明

- 支持 light/dark/system 主题切换，也支持由宿主受控。
- Header 语言菜单默认可用；非受控模式会使用共享的 localStorage 偏好，刷新或进入其他非受控页面后继续沿用所选语言。
- Header logo、用户信息、左右扩展插槽可配置；未传 `logo` 时显示离线内置图标，不请求宿主静态文件，传 `logo={null}` 可隐藏。
- Header AI 输入条是显式 opt-in：需要顶部输入框时传 `searchPlacement="header"`；需要跟随 AI Panel 浮动时传 `searchPlacement="floating"` 和 `floatingSearchSx`。
- Navigation Island 默认允许 pin 叶子菜单项，pin 后会在顶部出现收藏分组；分组节点自身不会被 pin。
- localStorage pin 状态会在客户端挂载后恢复。要求首帧完全稳定时，应从服务端用户配置/cookie 初始化并使用 `pinnedNavigationItemIds` 受控模式。
- 详细设计说明见同目录 `pagelayout.md`。
