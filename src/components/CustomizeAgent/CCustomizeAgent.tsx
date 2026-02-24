'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pr: 7, pb: 2.2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>AI Settings</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Configure LLM settings and editable agent prompts by language.
        </Typography>
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: '18px !important' }}>
        <Stack spacing={2.2}>
          <Box
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
            <Box>
              <CTextField
                size="small"
                value={draft.baseUrl}
                onChange={(event) => setField('baseUrl', event.target.value)}
                fullWidth
                label="Base URL"
              />
            </Box>

            <Box>
              <CTextField
                size="small"
                type="password"
                value={draft.apiKey}
                onChange={(event) => setField('apiKey', event.target.value)}
                fullWidth
                label="API Key"
              />
            </Box>

            <Box>
              <CTextField
                size="small"
                value={draft.model}
                onChange={(event) => setField('model', event.target.value)}
                fullWidth
                select
                label="Model"
              >
                {modelOptions.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </CTextField>
            </Box>

            <Box>
              <CTextField
                size="small"
                value={draft.promptLang}
                onChange={(event) => setField('promptLang', event.target.value)}
                fullWidth
                select
                label="Prompt Lang"
              >
                {promptLangOptions.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </CTextField>
            </Box>
          </Box>

          <Box
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
              <MenuItem value="">Default</MenuItem>
              {analysisTemplateOptions.map((item) => (
                <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
              ))}
            </CTextField>
            <CTextArea
              multiline
              minRows={8}
              value={draft.analysisPrompt}
              onChange={(event) => setField('analysisPrompt', event.target.value)}
              fullWidth
              label="Analysis Prompt"
              sx={{ '& .MuiInputBase-root': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' } }}
            />

            <CTextField
              size="small"
              value={responseTemplateId}
              onChange={(event) => setResponseTemplateId(event.target.value)}
              fullWidth
              select
              label="Response Template"
            >
              <MenuItem value="">Default</MenuItem>
              {responseTemplateOptions.map((item) => (
                <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
              ))}
            </CTextField>
            <CTextArea
              multiline
              minRows={8}
              value={draft.responsePrompt}
              onChange={(event) => setField('responsePrompt', event.target.value)}
              fullWidth
              label="Response Prompt"
              sx={{ '& .MuiInputBase-root': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' } }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSaveAll} disabled={!onSaveAll || savingAll}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
