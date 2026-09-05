# Brand Theming

ORBCAFE UI ships with the ORBIS theme as its default. Open Design is optional:
it is only needed when a project wants to discover and apply brand presets stored
on the developer's machine.

## Built-in theme packs

Projects without Open Design can import the packaged themes directly. Import the
base styles first, then one theme override:

```ts
import 'orbcafe-ui/styles.css';
import 'orbcafe-ui/themes/orbis.css';
// or: import 'orbcafe-ui/themes/nvidia.css';
```

The ORBIS theme is already included by `orbcafe-ui/styles.css`; importing its
theme pack is useful when an application wants the packaged Montserrat font files
and explicit ORBIS overrides.

## Open Design presets

The optional CLI discovers local Open Design systems and generates a project-local
theme pack containing CSS variables, fonts, and JavaScript tokens:

```bash
npx orbcafe-theme list --json
npx orbcafe-theme apply <slug> --json
```

Import the generated CSS after the base styles:

```ts
import 'orbcafe-ui/styles.css';
import './orbcafe-theme/<slug>.css';
```

Use the generated `.tokens.mjs` file for charts or canvas code that cannot read
CSS custom properties. If Open Design is unavailable, the default ORBIS theme and
the built-in theme packs remain available; no runtime connection to Open Design is
required by ORBCAFE components.

Only one brand override should be active at a time. Regenerate generated files
with the CLI when the source design system changes instead of editing them by hand.
