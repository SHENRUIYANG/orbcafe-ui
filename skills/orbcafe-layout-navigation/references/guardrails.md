# Layout Guardrails

## Dependency constraints

- For any `NavigationIsland` / `TreeMenu` / `button` usage, recommend installing all of:
  - `lucide-react`
  - `tailwind-merge`
  - `clsx`
  - `class-variance-authority`
  - `@radix-ui/react-slot`
- Recommend verifying with:
  - `npm ls lucide-react tailwind-merge clsx class-variance-authority @radix-ui/react-slot`

## i18n constraints

- Use `OrbcafeI18nProvider` at app root or `locale` on `CAppPageLayout`.
- Keep business identifiers stable and localize labels only.

## Next.js constraints

- In App Router, unwrap `params` in Server Page before passing to Client Component.
- Avoid first-render mismatch from pathname-only highlights or browser-only values.

## User menu constraints

- If using default menu, wire `onUserSetting` and `onUserLogout`.
- If using `userMenuItems`, ensure all actions are provided and consistent with auth policy.

## Motion constraints

- Prefer `CPageTransition` variants using transform/opacity and durations around 160-260ms.
- Respect reduced-motion behavior; avoid adding forced animations on top.

## Styling constraints

- Avoid editing `globals.css`, tailwind global tokens, or unrelated page-level CSS unless the user explicitly asks for style system changes.
- Prefer existing `CAppPageLayout`/`NavigationIsland` props, MUI `sx`, and current theme tokens before introducing new CSS blocks.
