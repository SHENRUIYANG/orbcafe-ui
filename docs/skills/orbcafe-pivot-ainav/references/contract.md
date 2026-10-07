# Pivot and voice usage contract

## Pivot

`CPivotTable` requires `rows: Record<string, unknown>[]` and `fields: PivotFieldDefinition[]`. Field IDs match row keys. Fields are `{ id, label, type?: 'string'|'number'|'date'|'boolean', aggregations?, formatValue? }`; numeric measures should declare type number.

`usePivotTable({ fields, initialLayout?, initialChart?, ... })` returns a `model`; pass it to `CPivotTable model={pivot.model}`. Do not pass the full hook object. Initial values are initial state, not a continually controlled layout prop; use model setters to change it.

- Layout: `{ rows?: string[], columns?: string[], filters?: string[], values?: { fieldId, aggregation? }[] }`.
- Aggregation: `sum | count | avg | min | max`.
- Chart: `{ dimensionFieldId?, primaryValueFieldId?, secondaryValueFieldId?, chartType? }`; type is `bar-vertical | bar-horizontal | line | scatter`, not the MetricChart type union.
- Preset: `{ id, name, layout, filterSelections?, showGrandTotal?, chart? }`. `onPresetsChange(nextPresets)` receives the complete list. Persist it in the host; UI state alone is not storage.
- Chart uses at most one dimension and two measures; model has independent configurator/chart/table collapse states.

## AINav and ASR

`CAINavProvider` requires `children` and `onVoiceSubmit(text) => void | Promise<void>`. `useAINav()` must run below it and returns isRecording/isHotkeyRecording/isSubmitting/startRecording/stopRecording. Aliases VoiceNavigatorProvider/useVoiceNavigator exist for compatibility. `useVoiceInput` can be used directly with required `onComplete(text)`.

Defaults: longPressMs=200, ignoreWhenFocusedInput=true, disableSpaceTrigger=false, renderOverlay=true; wsUrl=`ws://localhost:8765`, silenceThresholdMs=2000, minVolumeRms=0.015. That localhost endpoint is a development default, not a hosted service. Set the deployment's wsUrl (wss under HTTPS); browser microphone permissions and a compatible ASR server are required.

Wire protocol in `useVoiceInput`: sends mono 16 kHz Int16 PCM buffers, and JSON `{ "type":"stop" }`; accepts JSON `{ "type":"recognition", "text":"...", "is_final":true|false }` or `{ "type":"error", "message":"..." }`. Partial results call onTextUpdate/onVoicePartial; final text calls onComplete/onVoiceSubmit. There is no authentication-token prop; any auth bridge must be implemented by the host/server.

`isSubmitting` describes the host callback promise, not microphone capture. Provider's standard overlay is shown for hotkey recording; custom buttons can use isRecording. UI success does not prove ASR reachability.

Sources: `src/components/PivotTable/types.ts`, `Hooks/usePivotTable.ts`; `src/components/AINav/types.ts`, `CAINavProvider.tsx`, `Hooks/useVoiceInput.ts`. Verify pivot setters/preset reload and voice permissions/connect/partial/final/failure separately.
