# Auth Recipes

## Recipe 1: Hook-first auth page

```tsx
'use client';

import { CAuthPage, useAuthPage } from 'orbcafe-ui';

export default function AuthEntry() {
  const auth = useAuthPage({
    onLogin: async ({ username, password, remember }) => {
      await loginDemo(username, password, remember);
    },
    onRegister: async (payload) => {
      await registerDemo(payload);
    },
    onForgotPassword: async ({ email }) => {
      await resetDemo(email);
    },
  });

  return <CAuthPage {...auth.authPageProps} />;
}
```

## Recipe 2: Controlled initial mode

```tsx
const auth = useAuthPage({
  defaultMode: 'register',
  onRegister: async (payload) => createAccount(payload),
});
```

## Recipe 3: Component-only callback mode

```tsx
import { CAuthPage } from 'orbcafe-ui';

<CAuthPage
  mode={mode}
  onModeChange={setMode}
  onLogin={handleLogin}
  onRegister={handleRegister}
  onForgotPassword={handleForgotPassword}
/>;
```
