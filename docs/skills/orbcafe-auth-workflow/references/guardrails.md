# Auth Guardrails

- Import only from `orbcafe-ui`; never from `src/components/Auth`.
- Do not use tabs for login/register/forgot password. Register and forgot-password are secondary actions from the login screen.
- Keep demo callbacks explicit. If no backend is wired, state that no real authentication request is sent.
- Keep the auth page inside the app provider stack used by `examples/app/providers.tsx`.
- Use `useAuthPage` when the page needs mode/loading orchestration; use component-only mode only for already controlled forms.
- Validate that register password confirmation and terms acceptance remain user-visible before submit.
- Preserve typed callback payloads:
  - login: `username`, `password`, `remember`
  - register: `name`, `email`, `password`, `confirmPassword`, `acceptedTerms`
  - forgot password: `email`
- Do not claim `CAuthPage` handles token/session/cookie storage. The host auth service owns that.
- Do not leave `loading` stuck true. `useAuthPage` clears it when the callback promise resolves or rejects.
- If the user wants branding, use `logo` and `copy`; do not build a separate landing page in front of the auth form.
- In examples, successful login should route to dashboard `/`, not hard-code `/std-report`.
