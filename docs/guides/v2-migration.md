# Migrating ORBCAFE UI from v1 to v2

`orbcafe-ui@2` is a breaking major release. It replaces the MUI-based implementation with the ORBIS design system, changes the theme integration, and requires host-side Tailwind configuration. Upgrade in a branch and verify the application before releasing it.

## Supported baseline

- Next.js 13-16. The canonical setup is Next.js App Router.
- React 18 or 19.
- Tailwind CSS 4.
- Import public APIs only from `orbcafe-ui`.

## 1. Upgrade dependencies

```bash
npm install orbcafe-ui@^2
npm install -D tailwindcss@^4 @tailwindcss/postcss@^4
```

ORBCAFE UI v2 does not require `@mui/*`, `@emotion/*`, `lucide-react`, or `next-themes`. Remove them only when the host application does not use them for anything else.

## 2. Configure PostCSS and global CSS

Use the Tailwind v4 PostCSS plugin:

```js
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

Import the ORBIS stylesheet once and scan the published library output. Adjust the relative `@source` path if the global CSS file is nested differently.

```css
/* app/globals.css */
@import "tailwindcss";
@import "orbcafe-ui/styles.css";
@source "../node_modules/orbcafe-ui/dist";
```

Without both the stylesheet import and source scan, components may render without their complete layout and interaction styles.

## 3. Configure application providers

Mount `GlobalMessage` once. Use `OrbisModeProvider` at the application layer when standalone ORBCAFE surfaces or the host design system need the same mode.

```tsx
'use client';

import { GlobalMessage, OrbisModeProvider } from 'orbcafe-ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OrbisModeProvider mode="system">
      {children}
      <GlobalMessage />
    </OrbisModeProvider>
  );
}
```

`CAppPageLayout` renders its own ORBIS mode provider. In the next v2 patch it also accepts controlled `mode`, `defaultMode`, and `onModeChange` props, allowing a host theme store to synchronize it directly.

## 4. Use the standard application shell

Prefer `CAppPageLayout` over manually combining `CAppHeader`, `NavigationIsland`, and `usePageLayout`.

```tsx
'use client';

import { useState } from 'react';
import {
  CAppPageLayout,
  type OrbModeSetting,
  type TreeMenuItem,
} from 'orbcafe-ui';

const menuData: TreeMenuItem[] = [
  {
    id: 'reports',
    title: 'Reports',
    pinnable: false,
    children: [
      { id: 'sales-report', title: 'Sales Report', href: '/reports/sales' },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<OrbModeSetting>('system');

  return (
    <CAppPageLayout
      appId="customer-portal"
      appTitle="Customer Portal"
      menuData={menuData}
      mode={mode}
      onModeChange={setMode}
      logo={<img src="/brand/logo.svg" alt="Customer Portal" width={36} height={36} />}
    >
      {children}
    </CAppPageLayout>
  );
}
```

The `appId` prop is available in the next v2 patch. It creates stable application-wide storage keys without depending on a localized or page-specific `appTitle`. On v2.0.0, pass one explicit `navigationPinStorageKey` everywhere instead.

## 5. Stabilize navigation persistence

- Treat every `TreeMenuItem.id` as a durable identifier. Do not translate or regenerate it.
- Give navigable leaves a stable `href` or `appurl`.
- Set `pinnable: false` on group and synthetic nodes.
- Use one `appId` or one `navigationPinStorageKey` for the entire application.
- For zero first-paint movement, load pin preferences from a server profile or cookie and pass controlled `pinnedNavigationItemIds` with `onPinnedNavigationItemIdsChange`.
- LocalStorage-only persistence is hydration-safe but is restored after mount, so a short pinned-section appearance is possible.

## 6. Replace MUI-specific integration

- Import icons from `orbcafe-ui` instead of MUI or Lucide packages.
- Replace MUI `ThemeProvider`, `CssBaseline`, and date-picker providers when they existed only for ORBCAFE UI.
- Review every public `sx` value. ORBCAFE v2 `sx` uses the ORBIS compatibility contract and does not execute MUI theme callbacks.
- Replace responsive MUI `sx` objects with host CSS/media queries where needed.
- Import only from the package root. The v2 `exports` map intentionally blocks unsupported internal paths such as `orbcafe-ui/dist/components/...`.

## 7. Logo behavior

In v2.0.0, pass an explicit `logo` prop to avoid a request to `/orbcafe.png`. The next v2 patch renders an offline package icon when `logo` is omitted. Pass `logo={null}` when the header should have no logo.

## Verification checklist

```bash
npm ls orbcafe-ui react react-dom next tailwindcss
npm run build
```

Then verify:

- No install-time peer warnings remain.
- Light, dark, and system modes stay synchronized with the host.
- Navigation search, expand/collapse, routing, fixed/floating mode, and pin/unpin work.
- Pinned items survive reload and do not split across page titles or locales.
- No `/orbcafe.png` 404 or `ERR_PACKAGE_PATH_NOT_EXPORTED` appears.
- Standard report, dialogs, date fields, charts, Kanban, Planning, and AgentUI receive complete styles.
- Browser console and server logs are clean during SSR and hydration.

## Rollback

If the application cannot complete the migration in the current release window, pin the previous major explicitly and keep the lock file:

```json
{
  "dependencies": {
    "orbcafe-ui": "1.4.6"
  }
}
```
