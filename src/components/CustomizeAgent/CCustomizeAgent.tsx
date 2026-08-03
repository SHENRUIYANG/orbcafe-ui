'use client';

import { CButton, CDialog, CIconButton, CStack, CTypography, CloseIcon } from '../../lib/orbis-compat';
import { useEffect, useState } from 'react';
import { CTextField } from '../Atoms/CTextField';
import { CTextArea } from '../Atoms/CTextArea';
import type {
  CustomizeAgentSavePayload,
  CustomizeAgentSettings,
  CustomizeAgentTemplateOption,
} from './types';

export interface CCustomizeAgentProps {
  open: boolean;
  onClose: () => void;
  value: CustomizeAgentSettings;
  onSaveAll?: (payload: CustomizeAgentSavePayload) => void | Promise<void>;
  modelOptions?: string[];
  promptLangOptions?: string[];
  analysisTemplateOptions?: CustomizeAgentTemplateOption[];
  responseTemplateOptions?: CustomizeAgentTemplateOption[];
  defaultAnalysisTemplateId?: string;
  defaultResponseTemplateId?: string;
}

const DEFAULT_MODEL_OPTIONS = ['doubao-lite', 'gpt-4o-mini', 'gpt-4.1-mini', 'claude-3.5-sonnet'];
const DEFAULT_PROMPT_LANG_OPTIONS = ['zh', 'en', 'de', 'fr', 'ja', 'ko'];

export const CCustomizeAgent = ({
  open,
  onClose,
  value,
  onSaveAll,
  modelOptions = DEFAULT_MODEL_OPTIONS,
  promptLangOptions = DEFAULT_PROMPT_LANG_OPTIONS,
  analysisTemplateOptions = [],
  responseTemplateOptions = [],
  defaultAnalysisTemplateId,
  defaultResponseTemplateId,
}: CCustomizeAgentProps) => {
  const [draft, setDraft] = useState<CustomizeAgentSettings>(value);
  const [analysisTemplateId, setAnalysisTemplateId] = useState(defaultAnalysisTemplateId || '');
  const [responseTemplateId, setResponseTemplateId] = useState(defaultResponseTemplateId || '');
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setAnalysisTemplateId(defaultAnalysisTemplateId || '');
      setResponseTemplateId(defaultResponseTemplateId || '');
    }
  }, [open, value, defaultAnalysisTemplateId, defaultResponseTemplateId]);

  const setField = <K extends keyof CustomizeAgentSettings>(key: K, nextValue: CustomizeAgentSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: nextValue }));
  };

  const handleSaveAll = async () => {
    if (!onSaveAll) return;
    try {
      setSavingAll(true);
      await onSaveAll({
        settings: draft,
        analysisTemplateId: analysisTemplateId || undefined,
        responseTemplateId: responseTemplateId || undefined,
      });
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <CDialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <div className="orb-dialog-title" sx={{ pr: 7, pb: 2.2 }}>
        <CTypography variant="h5" sx={{ fontWeight: 800 }}>AI Settings</CTypography>
        <CTypography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Configure LLM settings and editable agent prompts by language.
        </CTypography>
        <CIconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon />
        </CIconButton>
      </div>

      <div className="orb-dialog-content" sx={{ pt: '18px !important' }}>
        <CStack spacing={2.2}>
          <div
            sx={{
              mt: 0.8,
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
              },
            }}
          >
            <div>
              <CTextField
                size="small"
                value={draft.baseUrl}
                onChange={(event) => setField('baseUrl', event.target.value)}
                fullWidth
                label="Base URL"
              />
            </div>

            <div>
              <CTextField
                size="small"
                type="password"
                value={draft.apiKey}
                onChange={(event) => setField('apiKey', event.target.value)}
                fullWidth
                label="API Key"
              />
            </div>

            <div>
              <CTextField
                size="small"
                value={draft.model}
                onChange={(event) => setField('model', event.target.value)}
                fullWidth
                select
                label="Model"
              >
                {modelOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </CTextField>
            </div>

            <div>
              <CTextField
                size="small"
                value={draft.promptLang}
                onChange={(event) => setField('promptLang', event.target.value)}
                fullWidth
                select
                label="Prompt Lang"
              >
                {promptLangOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </CTextField>
            </div>
          </div>

          <div
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <CTextField
              size="small"
              value={analysisTemplateId}
              onChange={(event) => setAnalysisTemplateId(event.target.value)}
              fullWidth
              select
              label="Analysis Template"
            >
              <option value="">Default</option>
              {analysisTemplateOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </CTextField>
            <CTextArea
              multiline
              minRows={8}
              value={draft.analysisPrompt}
              onChange={(event) => setField('analysisPrompt', event.target.value)}
              fullWidth
              label="Analysis Prompt"
              sx={{ '& textarea': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' } }}
            />

            <CTextField
              size="small"
              value={responseTemplateId}
              onChange={(event) => setResponseTemplateId(event.target.value)}
              fullWidth
              select
              label="Response Template"
            >
              <option value="">Default</option>
              {responseTemplateOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </CTextField>
            <CTextArea
              multiline
              minRows={8}
              value={draft.responsePrompt}
              onChange={(event) => setField('responsePrompt', event.target.value)}
              fullWidth
              label="Response Prompt"
              sx={{ '& textarea': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' } }}
            />
          </div>
        </CStack>
      </div>

      <div className="orb-dialog-actions" sx={{ px: 3, pb: 2.5, pt: 1.2, gap: 1 }}>
        <CButton variant="outlined" onClick={onClose}>Cancel</CButton>
        <CButton variant="contained" onClick={handleSaveAll} disabled={!onSaveAll || savingAll}>
          Save
        </CButton>
      </div>
    </CDialog>
  );
};
