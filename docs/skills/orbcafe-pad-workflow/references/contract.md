# Pad usage contract

## Shell and table

Use `PAppPageLayout` for Pad/iPad workflows. It requires `appTitle` and `children` and already composes navigation/workload controls from menuData/workloadItems; do not duplicate them as siblings unless intentionally building a custom shell.

`usePadLayout({ orientation?: 'auto'|'portrait'|'landscape', defaultNavigationOpen?, onNavOpenChange? })` returns resolvedOrientation/navigationOpen/setNavigationOpen/toggleNavigationOpen plus viewport flags. Default shell handles this internally. Public `useMediaQuery` only accepts `(query: string)`; `{ noSsr: true }` belongs to a private compatibility hook and is not a public argument.

`PTable` extends CTableProps: required appId, columns, rows; keep rowKey stable. Pad mappings are cardTitleField/cardSubtitleFields/cardActionSlot(row)/renderCardFooter(row)/onRowClick(row). Pagination/layout/variants still need the standard identity and callback contract. PTable `filterConfig` uses PSmartFilter, which inherits the Value Help/FilterValue contract.

## Editing and scanning

- `PNumericKeypad` value/defaultValue are **strings**, not numbers. `onChange(value: string)` edits input; `onSubmit(value: string)` asks the host to validate and commit. Controlled value with a no-op onChange makes the keypad effectively read-only.
- `usePadRecordEditor({ rows, rowKey?, numericField, defaultSelectedId? })` returns editorValue/setEditorValue/selectRecord/selectedRecord/selectedId and `applyEditorValue(updater)`. Wire PTable.onRowClick to selectRecord, keypad value/onChange to editor state and submit to `applyEditorValue(setRows)` after domain validation. This updates local rows; backend persistence is separate.
- `PBarcodeScanner` requires `open`/`onClose`. `onDetected({ rawValue: string, format?: string })` is an object, not a string. Use rawValue to update lookup/input state. `onError(message)` reports device problems.
- Scanner formats/facingMode/manualEntry/autoCloseOnDetect/scanIntervalMs are optional. Open from a deliberate action, use camera where supported, and retain manual entry fallback. Close releases the media stream.
- `PTouchCard` swipe actions use startAction/endAction with `{ id, label, onTrigger? }`; onSwipe receives `'start'|'end'`. These are UI callbacks, not business writes.

Sources: `src/components/Pad/types.ts`, `Hooks/usePadLayout.ts`, `Hooks/usePadRecordEditor.ts`. Verify at Pad portrait/landscape, selected-row writeback, scanner callback and fallback, filter persistence and no blocking closed overlay.
