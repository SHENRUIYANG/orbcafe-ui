# PageLayout

应用页面壳层（Header + Navigation Island + 内容区）。

## 快速使用

```tsx
import { CAppPageLayout } from 'orbcafe-ui';

<CAppPageLayout
  appTitle="ORBCAFE UI"
  menuData={[{ id: 'std', title: 'Standard Report', href: '/std-report' }]}
  user={{ name: 'Ruiyang Shen' }}
>
  <div>Page Content</div>
</CAppPageLayout>
```

## 说明

- 支持 light/dark/system 主题切换
- Header logo、用户信息、左右扩展插槽可配置
- 具体细节见同目录 `pagelayout.md`
