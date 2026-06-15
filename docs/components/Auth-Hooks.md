# Auth Hooks

Published copy of `src/components/Auth/Hooks/README.md`.

---

## `useAuthPage`

`useAuthPage` is the public state helper for `CAuthPage`.

It manages:

- current mode: `login | register | forgot`
- async submit loading
- controlled props for `CAuthPage`

### Minimal example

```tsx
import { CAuthPage, useAuthPage } from 'orbcafe-ui';

const auth = useAuthPage({
  onLogin: async (payload) => {
    await api.login(payload);
  },
});

<CAuthPage {...auth.authPageProps} />;
```
