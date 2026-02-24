# PageLayout

应用页面壳层（Header + Navigation Island + 内容区）。

## 快速使用

```tsx
import { CAppPageLayout } from 'orbcafe-ui';

<CAppPageLayout
  appTitle="ORBCAFE UI"
  menuData={[{ id: 'std', title: 'Standard Report', href: '/std-report' }]}
  user={{ name: 'Ruiyang Shen' }}
  onUserLogout={() => auth.logout()}
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
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

<CAppPageLayout
  appTitle="ORBCAFE UI"
  user={{ name: 'Ruiyang Shen' }}
  userMenuItems={[
    {
      key: 'setting',
      label: 'Setting',
      icon: <SettingsIcon fontSize="small" />,
      onClick: () => router.push('/settings'),
    },
    {
      key: 'logoff',
      label: 'Logoff',
      icon: <LogoutIcon fontSize="small" />,
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
| `user` | `{ name; subtitle?; avatarText?; avatarSrc? }` | 控制头像与用户名展示；不传时不显示用户菜单。 |
| `onUserSetting` | `() => void` | 默认 `Setting` 点击回调。 |
| `onUserLogout` | `() => void` | 默认 `Logout` 点击回调。 |
| `userMenuItems` | `Array<{ key; label; icon?; onClick?; disabled? }>` | 覆盖默认菜单，完全自定义项。 |

## 说明

- 支持 light/dark/system 主题切换。
- Header logo、用户信息、左右扩展插槽可配置。
- 详细设计说明见同目录 `pagelayout.md`。
