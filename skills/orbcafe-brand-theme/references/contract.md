# Brand theme usage contract

Brand theming is independent from light/dark mode. Base `orbcafe-ui/styles.css` supplies ORBIS; no Open Design installation is required. Optional built-in overrides: `orbcafe-ui/themes/orbis.css` and `orbcafe-ui/themes/nvidia.css`, loaded after base CSS. Use one active override.

## CLI inputs and outputs

Run the `orbcafe-theme` binary supplied by the installed orbcafe-ui package (for example `npm exec -- orbcafe-theme list --json`). Inside this repo use `node bin/orbcafe-theme.mjs ...`. Verify `npm ls orbcafe-ui` first; do not install an unrelated similarly named package.

| Command | Contract |
| --- | --- |
| `status --json` | `{ ok:true, openDesignRoots, presets }`; no app/empty presets is a valid discovery state. |
| `list --json` | `{ ok:true, presets }`, or `{ ok:false, error }` and nonzero exit when Open Design is unavailable. |
| `show <slug> --json` | Preview only: `{ ok, brand, warning, css }`. |
| `apply <slug> --json` | Writes theme assets; returns `{ ok, brand, cssPath, tokensMjsPath, tokensTsPath, fonts, warning, importLine }`. |

Optional `--out <dir>` changes output directory (default ./orbcafe-theme); `--preset <dir>` bypasses discovery; `--full` additionally maps radius; otherwise colors/fonts only. Use an exact discovered slug and quote paths with spaces. Generated importLine is relative to command cwd; adjust it for the actual layout/CSS entry file.

Generated CSS references copied fonts relatively. Keep the font directory with the CSS in build/deployment. Generated `.tokens.mjs/.ts` provides `{ light, dark }`; library `ORB_TOKENS` is the default palette, not automatically this generated object. Re-run apply to update generated files; preserve them in source control if deployment cannot access the local preset.

The CLI reads local preset data and does not publish a site or change mode providers. Verify default brand with no Open Design, generated files, CSS import order, fonts and light/dark visuals. Sources: `bin/orbcafe-theme.mjs`, `bin/lib/theme-core.mjs`, `BRAND_THEMING.md`.
