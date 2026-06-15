---
name: "orbcafe-pad-workflow"
description: "Build ORBCAFE touch-first pad experiences with PAppPageLayout, PNavIsland, PWorkloadNav, PTable/PSmartFilter including CValueHelp/F4 lookup fields, PNumericKeypad, PBarcodeScanner. Use for iPad/平板端, 触控交互, 主数据值帮助, 扫码录入."
---

# Pad Workflow Skill

This skill guides the creation of touch-first, iPad-optimized applications using `orbcafe-ui`'s Pad components. The canonical ORBCAFE route is Next.js App Router plus the official examples app; do not silently translate Pad patterns into Vite/CRA unless the user explicitly accepts a non-canonical workaround. The Pad framework focuses on large tap targets, card-based lists, and hardware integrations (camera scanner, numpad).

## Core Components & Layout Strategy

A standard Pad page uses a specific component hierarchy. Do not use desktop layouts (`CAppPageLayout`, `CTable`) for Pad routes.

1. **`PAppPageLayout`**: The root layout wrapper for Pad pages. It handles the responsive shell, safe areas, and background.
   - Props: `navigation` (usually `PNavIsland`), `workloads` (usually `PWorkloadNav`), `header` (brand logo/title).
2. **`PNavIsland`**: The left-side vertical navigation bar. Designed for thumb reachability.
   - Props: `items` (TreeMenuItem[]), `activeId`, `onItemClick`, `collapsed` (optional).
3. **`PWorkloadNav`**: The top horizontal tab/card navigation for switching between major workflows (e.g., Receiving, Picking, Packing).
   - Props: `items` (PWorkloadNavItem[]), `activeId`, `onItemClick`.
4. **`PTable`**: The touch-friendly alternative to `CTable`. It renders rows as large `PTouchCard` elements instead of a data grid, but shares the same powerful features (variants, smart filters, quick operations).
   - Key Props: `cardTitleField`, `cardSubtitleFields`, `renderCardFooter`, `cardActionSlot`.
   - `filterConfig.fields` uses `PSmartFilter`, which inherits `CSmartFilter` Value Help fields (`type: 'value-help'` / `isValueHelp: true`). Use this for touch-friendly material/customer/location lookup instead of custom side dialogs.
5. **`PNumericKeypad`**: An on-screen numpad for quick quantity/data entry without invoking the OS keyboard.
6. **`PBarcodeScanner`**: A dialog component that uses the device camera to scan barcodes/QR codes (uses `html5-qrcode` under the hood).

## Integration Requirements (Must Check)

1. **Tailwind CSS Compilation**: `orbcafe-ui` Pad components heavily rely on Tailwind utility classes (e.g., `rounded-2xl`, `backdrop-blur`). The host project must configure Tailwind to scan the library:
   - Canonical Tailwind v4 (`globals.css`): use CSS `@source` with the correct relative path to `node_modules/orbcafe-ui/dist`.
   - Tailwind v3 (`tailwind.config.js`) is legacy fallback only: `content: ["./node_modules/orbcafe-ui/dist/**/*.{js,mjs}"]`
2. **Provider Baseline**: Ensure `ThemeProvider`, `CssBaseline`, and `LocalizationProvider` (MUI) are wrapped at the root level.
3. **Examples source**: Official examples are not shipped in the npm package. If the consuming project has no `examples/`, inspect the ORBCAFE GitHub repository or a local ORBCAFE checkout.
4. **Dependencies**: Check `package.json` first. Install only when missing or incompatible.
   ```bash
   npm install orbcafe-ui @mui/material@^7.3.9 @mui/icons-material@^7.3.9 lucide-react@^0.575.0
   ```

## See Also
- [Layout Patterns](./references/patterns.md) for concrete code templates and hierarchy.
- [Guardrails](./references/guardrails.md) for mobile constraints and touch target rules.
