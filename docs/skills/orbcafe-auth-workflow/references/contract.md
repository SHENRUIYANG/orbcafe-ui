# Auth usage contract

Default: `const auth = useAuthPage({ defaultMode?, onLogin?, onRegister?, onForgotPassword? })`; render `<CAuthPage {...auth.authPageProps} />`. The hook owns mode/loading and exposes setMode. defaultMode initializes once; router-controlled switching uses CAuthPage.mode/onModeChange instead.

| Callback | Payload |
| --- | --- |
| `onLogin` | `{ username: string, password: string, remember: boolean }` |
| `onRegister` | `{ name: string, email: string, password: string, confirmPassword: string, acceptedTerms: boolean }` |
| `onForgotPassword` | `{ email: string }` |

All callbacks return void or Promise<void>. Await actual backend work; the hook clears loading in finally but does not implement authentication, session persistence, redirect or user-visible server-error handling. Catch/report backend errors in the host callback. An omitted callback is a no-op, not successful authentication.

Modes are login/register/forgot. CAuthPage supports logo: ReactNode, copy: AuthPageCopy (including productName/headline/subheadline/brandMeta and per-mode title/subtitle), and sx: CSSProperties. Do not pass MUI nested selectors into this CSSProperties prop.

Reference entry is `/login`, not the examples homepage. Sources: `src/components/Auth/types.ts`, `Hooks/useAuthPage.ts`, `CAuthPage.tsx`. Verify all three payloads, pending/rejected/success states, modes, and host session/redirect separately.
