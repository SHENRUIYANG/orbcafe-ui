# Transitions

Published copy of `src/lib/transitions/README.md`.

---

Lightweight page transition utilities designed for smooth UX without frame drops.

## Component

- `CPageTransition`

## Variants

- `fade`
- `slide-up`
- `slide-left`
- `scale`
- `none`

## Usage

```tsx
import { CPageTransition } from 'orbcafe-ui';

<CPageTransition transitionKey={pathname} variant="slide-up" durationMs={220}>
  {children}
</CPageTransition>
```

## Performance Notes

- Uses only `opacity` and `transform` transitions (GPU-friendly).
- Honors `prefers-reduced-motion` automatically.
- Keep duration around `160-260ms` for best perceived smoothness.
