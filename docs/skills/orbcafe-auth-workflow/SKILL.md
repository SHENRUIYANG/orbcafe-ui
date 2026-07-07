---
name: orbcafe-auth-workflow
description: Build ORBCAFE authentication entry pages with CAuthPage/useAuthPage, typed AuthLoginPayload/AuthRegisterPayload/AuthForgotPasswordPayload callbacks, logo/copy customization, loading/mode orchestration, and official examples patterns. Use for login, registration, forgot-password, demo auth flows, or host-auth integration where the UI renders but mode changes, loading, or submit callbacks have no effect.
---

# ORBCAFE Auth Workflow

## Workflow

1. 先对照 `skills/orbcafe-ui-component-usage/references/module-contracts.md`，确认这是 `Hook-first` 模块。
2. 执行 `skills/orbcafe-ui-component-usage/references/integration-baseline.md`，按 Next.js App Router + 官方 examples 做最小可运行接入。
3. 用 `references/recipes.md` 输出实现骨架。
4. 用 `references/guardrails.md` 检查 login/register/forgot 的入口关系、typed payload、demo callback、真实后端边界和 provider 边界。
5. 输出验收步骤与“没效果”排障；不要把 examples 的假登录 callback 描述成真实认证。

## Canonical Setup

先检查宿主 `package.json`，缺失或版本不兼容时才安装：

```bash
npm install orbcafe-ui @mui/material@^7.3.9 @mui/icons-material@^7.3.9 @mui/x-date-pickers@^8.27.2 @emotion/react@^11.14.0 @emotion/styled@^11.14.1 dayjs@^1.11.20 lucide-react@^0.575.0 tailwind-merge@^3.5.0 clsx@^2.1.1 class-variance-authority@^0.7.1 @radix-ui/react-slot@^1.2.4
```

本仓库联调：

```bash
npm run build
cd examples
npm install
npm run dev
```

参考实现：
- `examples/app/page.tsx`
- `examples/app/_components/AuthExampleClient.tsx`
- `src/components/Auth/README.md`
- `src/components/Auth/Hooks/README.md`

## Output Contract

0. `Mode`: `Hook-first`.
1. `Chosen module`: Auth and whether callbacks are demo-only or backend-wired.
2. `Minimal implementation`: `useAuthPage + CAuthPage`.
3. `Data model`: exact login/register/forgot payload shapes and whether `logo` / `copy` customization is needed.
4. `Verify`: login, register, forgot-password submit; mode switches; loading clears; real or demo callback behavior is visible.
5. `Troubleshooting`: at least 3 points covering provider stack, public imports, callback wiring, loading state, and demo callback vs real authentication.

## Examples-Based Experience Summary

- 登录页只显示 login form；register 和 forgot password 通过 login form 下方/行内的小入口进入，不使用页签。
- `useAuthPage` 承担 `mode` 与 `loading`，业务层只接 `onLogin/onRegister/onForgotPassword` typed callbacks。
- `CAuthPage` 支持 `logo` 和 `copy` 自定义，用于产品名、headline、subheadline 和各 mode 文案。
- demo 里可以接受固定用户名密码或直接跳转，但真实项目必须把 callback 接到宿主认证服务，并明确 token/session/cookie 不由 ORBCAFE UI 管理。
- examples 中 login 成功后回到 dashboard `/`；不要把登录后默认写死到 `/std-report`。
- 首屏作为 examples 入口时优先放在 `examples/app/page.tsx`，不要再加 marketing landing page。
