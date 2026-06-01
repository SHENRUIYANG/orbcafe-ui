# Auth

Login, register, and forgot-password page component for ORBCAFE UI examples and host apps.

## Public API

- `CAuthPage`
- `useAuthPage`
- `AuthPageMode`
- `AuthLoginPayload`
- `AuthRegisterPayload`
- `AuthForgotPasswordPayload`

## Pattern

`Auth` is hook-first when the page needs mode/loading state. The host owns authentication behavior through `onLogin`, `onRegister`, and `onForgotPassword`.

```tsx
import { CAuthPage, useAuthPage } from 'orbcafe-ui';

const auth = useAuthPage({
  onLogin: (payload) => console.log(payload),
  onRegister: (payload) => console.log(payload),
  onForgotPassword: (payload) => console.log(payload),
});

<CAuthPage {...auth.authPageProps} />;
```
