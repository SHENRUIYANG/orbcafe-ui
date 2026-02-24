# CustomizeAgent

`CCustomizeAgent` is a reusable settings dialog for configuring LLM endpoint/model and editable prompts.

## Features

- Two-row, two-column base settings layout (`Base URL`, `API Key`, `Model`, `Prompt Lang`).
- Prompt template version selector for both prompts:
  - `Analysis Template`
  - `Response Template`
- Editable prompt content areas:
  - `Analysis Prompt`
  - `Response Prompt`
- Single save action (`Save`) to persist all settings and selected template versions.
- Built with MUI `outlined/small` input behavior (floating label on focus), aligned with `SmartFilter` interaction style.

## Usage

```tsx
import { CCustomizeAgent } from 'orbcafe-ui';

<CCustomizeAgent
  open={open}
  onClose={handleClose}
  value={{
    baseUrl: '/llm-api',
    apiKey: '',
    model: 'doubao-lite',
    promptLang: 'zh',
    analysisPrompt: '...',
    responsePrompt: '...',
  }}
  modelOptions={['doubao-lite', 'gpt-4o-mini']}
  promptLangOptions={['zh', 'en']}
  analysisTemplateOptions={[
    { id: 'analysis-default', label: 'Default Analysis' },
    { id: 'analysis-strict', label: 'Strict Audit Analysis' },
  ]}
  responseTemplateOptions={[
    { id: 'response-default', label: 'Default Response' },
    { id: 'response-exec', label: 'Executive Summary' },
  ]}
  defaultAnalysisTemplateId="analysis-default"
  defaultResponseTemplateId="response-default"
  onSaveAll={async ({ settings, analysisTemplateId, responseTemplateId }) => {
    // persist everything in one request
  }}
/>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `open` | `boolean` | Whether the dialog is open. |
| `onClose` | `() => void` | Close callback. |
| `value` | `CustomizeAgentSettings` | Current LLM and prompt settings. |
| `onSaveAll` | `(payload) => void \\| Promise<void>` | Single save handler for all settings and template selections. |
| `modelOptions` | `string[]` | Model dropdown options. |
| `promptLangOptions` | `string[]` | Prompt language dropdown options. |
| `analysisTemplateOptions` | `{ id; label }[]` | Analysis prompt template versions. |
| `responseTemplateOptions` | `{ id; label }[]` | Response prompt template versions. |
| `defaultAnalysisTemplateId` | `string` | Initial selected analysis template version. |
| `defaultResponseTemplateId` | `string` | Initial selected response template version. |
