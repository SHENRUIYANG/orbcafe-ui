# Auth Recipes

## Recipe 1: Hook-first auth page

```tsx
'use client';

import {
  CAuthPage,
  type AuthForgotPasswordPayload,
  type AuthLoginPayload,
  type AuthRegisterPayload,
  useAuthPage,
} from 'orbcafe-ui';

export default function AuthEntry() {
  const auth = useAuthPage({
    onLogin: async (payload: AuthLoginPayload) => {
      await loginDemo(payload.username, payload.password, payload.remember);
    },
    onRegister: async (payload: AuthRegisterPayload) => {
      await registerDemo(payload);
    },
    onForgotPassword: async (payload: AuthForgotPasswordPayload) => {
      await resetDemo(payload.email);
    },
  });

  return (
    <CAuthPage
      {...auth.authPageProps}
      logo={<img src="/LOGO2.png" alt="ORBCAFE" style={{ width: 240 }} />}
      copy={{
        productName: 'ORBCAFE UI',
        headline: 'Examples workspace',
        subheadline: 'Sign in to inspect reusable ORBCAFE modules.',
      }}
    />
  );
}
```

Payload contract:

```ts
type AuthLoginPayload = { username: string; password: string; remember: boolean };
type AuthRegisterPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};
type AuthForgotPasswordPayload = { email: string };
```

`useAuthPage` owns `mode`, `loading`, `setMode`, and `authPageProps`. The host owns the actual authentication request and session handling.

## Recipe 2: Controlled initial mode

```tsx
const auth = useAuthPage({
  defaultMode: 'register',
  onRegister: async (payload) => createAccount(payload),
});
```

Use `defaultMode` for initial route state only. Use controlled `CAuthPage mode/onModeChange` only when an external router or state machine owns the auth mode.

## Recipe 3: Component-only callback mode

```tsx
import { CAuthPage } from 'orbcafe-ui';

<CAuthPage
  mode={mode}
  onModeChange={setMode}
  onLogin={handleLogin}
  onRegister={handleRegister}
  onForgotPassword={handleForgotPassword}
  loading={submitting}
/>;
```

## Recipe 4: Real backend integration boundary

```tsx
const auth = useAuthPage({
  onLogin: async ({ username, password, remember }) => {
    const session = await authClient.login({ username, password, remember });
    await persistSession(session);
    router.push('/');
  },
  onRegister: async (payload) => {
    if (payload.password !== payload.confirmPassword) throw new Error('Passwords do not match');
    await authClient.register(payload);
  },
  onForgotPassword: async ({ email }) => {
    await authClient.requestPasswordReset(email);
  },
});
```

ORBCAFE UI does not create tokens, cookies, or sessions. It only passes typed payloads to the host callbacks and reflects loading while the promise is pending.
