---
name: "orbcafe-pad-workflow"
description: "Build ORBCAFE touch-first pad experiences with PAppPageLayout, PNavIsland, PWorkloadNav, PTable, PNumericKeypad, PBarcodeScanner. Use for iPad/平板端, 触控交互, 扫码录入."
---

# Pad Workflow Skill

This skill guides the creation of touch-first, iPad-optimized applications using `orbcafe-ui`'s Pad components. The Pad framework focuses on large tap targets, card-based lists, and hardware integrations (camera scanner, numpad).

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
5. **`PNumericKeypad`**: An on-screen numpad for quick quantity/data entry without invoking the OS keyboard.
6. **`PBarcodeScanner`**: A dialog component that uses the device camera to scan barcodes/QR codes (uses `html5-qrcode` under the hood).

## Integration Requirements (Must Check)

1. **Tailwind CSS Compilation**: `orbcafe-ui` Pad components heavily rely on Tailwind utility classes (e.g., `rounded-2xl`, `backdrop-blur`). The host project must configure Tailwind to scan the library:
   - Tailwind v4 (`globals.css`): `@source "../../node_modules/orbcafe-ui/dist";`
   - Tailwind v3 (`tailwind.config.js`): `content: ["./node_modules/orbcafe-ui/dist/**/*.{js,mjs}"]`
2. **Provider Baseline**: Ensure `ThemeProvider`, `CssBaseline`, and `LocalizationProvider` (MUI) are wrapped at the root level.
3. **Dependencies**:
   ```bash
   npm install orbcafe-ui @mui/material@^7.3.9 @mui/icons-material@^7.3.9 lucide-react@^0.575.0
   ```

## See Also
- [Layout Patterns](./references/patterns.md) for concrete code templates and hierarchy.
- [Guardrails](./references/guardrails.md) for mobile constraints and touch target rules.
