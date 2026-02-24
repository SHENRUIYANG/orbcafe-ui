export interface CustomizeAgentSettings {
  baseUrl: string;
  apiKey: string;
  model: string;
  promptLang: string;
  analysisPrompt: string;
  responsePrompt: string;
}

export interface CustomizeAgentTemplateOption {
  id: string;
  label: string;
}

export interface CustomizeAgentSavePayload {
  settings: CustomizeAgentSettings;
  analysisTemplateId?: string;
  responseTemplateId?: string;
}
