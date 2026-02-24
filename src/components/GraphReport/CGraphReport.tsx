import { Box, Button, Chip, Dialog, IconButton, InputBase, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { GraphReportConfig, GraphReportFieldMapping, GraphReportInteractionState, GraphReportModel } from './types';
import { CGraphKpiCards } from './Components/CGraphKpiCards';
import { CGraphCharts } from './Components/CGraphCharts';
import { useOrbcafeI18n } from '../../i18n';
import { CCustomizeAgent } from '../CustomizeAgent';
import type { CustomizeAgentSettings } from '../CustomizeAgent';

export interface CGraphReportProps {
  open: boolean;
  onClose: () => void;
  model: GraphReportModel;
  tableContent: ReactNode;
  extraCharts?: ReactNode;
  interaction?: {
    enabled?: boolean;
    filters: GraphReportInteractionState;
    fieldMapping: GraphReportFieldMapping;
    onPrimaryDimensionClick: (value: string) => void;
    onSecondaryDimensionClick: (value: string) => void;
    onStatusClick: (value: string) => void;
    onClearFilter: (field: keyof GraphReportInteractionState) => void;
    onClearAll: () => void;
  };
  aiAssistant?: GraphReportConfig['aiAssistant'];
}

export const CGraphReport = ({
  open,
  onClose,
  model,
  tableContent,
  extraCharts,
  interaction,
  aiAssistant,
}: CGraphReportProps) => {
  const { t } = useOrbcafeI18n();
  const [aiPrompt, setAiPrompt] = useState(aiAssistant?.defaultPrompt || '');
  const [submitting, setSubmitting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hasInteraction = interaction?.enabled !== false && Boolean(interaction);
  const aiEnabled = aiAssistant?.enabled !== false;
  const activeFilters = interaction?.filters || {};
  const hasActiveFilters = Boolean(
    activeFilters.primaryDimension || activeFilters.secondaryDimension || activeFilters.status,
  );
  const aiPlaceholder = aiAssistant?.placeholder || 'Ask AI to analyze data, create charts, or find insights...';

  useEffect(() => {
    if (open) {
      setAiPrompt(aiAssistant?.defaultPrompt || '');
    }
  }, [open, aiAssistant?.defaultPrompt]);

  const defaultAgentSettings: CustomizeAgentSettings = aiAssistant?.settings || {
    baseUrl: '/llm-api',
    apiKey: '',
    model: 'doubao-lite',
    promptLang: 'zh',
    analysisPrompt: '',
    responsePrompt: '',
  };

  const handleSubmitAiPrompt = async () => {
    const prompt = aiPrompt.trim();
    if (!prompt || !aiAssistant?.onSubmit) return;
    try {
      setSubmitting(true);
      await aiAssistant.onSubmit(prompt, {
        filters: activeFilters,
        model,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} alignItems={{ xs: 'stretch', lg: 'center' }} justifyContent="space-between" spacing={1.5}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexWrap: 'wrap' }}>
              <Typography variant="h5" fontWeight={800}>
                {model.title}
              </Typography>
              <Chip size="small" label={t('graph.records', { count: model.kpis.totalRecords })} />
              {hasInteraction && activeFilters.primaryDimension && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${interaction?.fieldMapping.primaryDimension}: ${activeFilters.primaryDimension}`}
                  onDelete={() => interaction?.onClearFilter('primaryDimension')}
                />
              )}
              {hasInteraction && activeFilters.secondaryDimension && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${interaction?.fieldMapping.secondaryDimension}: ${activeFilters.secondaryDimension}`}
                  onDelete={() => interaction?.onClearFilter('secondaryDimension')}
                />
              )}
              {hasInteraction && activeFilters.status && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${interaction?.fieldMapping.status}: ${activeFilters.status}`}
                  onDelete={() => interaction?.onClearFilter('status')}
                />
              )}
              {hasInteraction && hasActiveFilters && (
                <Button size="small" onClick={() => interaction?.onClearAll()}>
                  Clear
                </Button>
              )}
            </Stack>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ width: { xs: '100%', lg: 'auto' } }}>
              {aiEnabled && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.2,
                    py: 0.4,
                    borderRadius: 999,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    minWidth: { xs: 0, lg: 520 },
                    flex: { xs: 1, lg: '0 0 auto' },
                  }}
                >
                  <IconButton size="small" onClick={aiAssistant?.onVoiceInput}>
                    <MicNoneOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </IconButton>
                  <InputBase
                    fullWidth
                    value={aiPrompt}
                    onChange={(event) => setAiPrompt(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSubmitAiPrompt();
                      }
                    }}
                    placeholder={aiPlaceholder}
                    sx={{ fontSize: '0.9rem' }}
                  />
                  <IconButton size="small" onClick={handleSubmitAiPrompt} disabled={submitting || !aiPrompt.trim()}>
                    <SendOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => setSettingsOpen(true)}>
                    <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              )}
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', minHeight: 0 }}>
          <CGraphKpiCards kpis={model.kpis} />
          <CGraphCharts
            billableByPrimary={model.charts.billableByPrimary}
            efficiencyBySecondary={model.charts.efficiencyBySecondary}
            statusDistribution={model.charts.statusDistribution}
            interaction={
              hasInteraction
                ? {
                    filters: activeFilters,
                    onPrimaryDimensionClick: (value) => interaction?.onPrimaryDimensionClick(value),
                    onSecondaryDimensionClick: (value) => interaction?.onSecondaryDimensionClick(value),
                    onStatusClick: (value) => interaction?.onStatusClick(value),
                  }
                : undefined
            }
          />
          {extraCharts}
          {tableContent}
        </Box>

        <CCustomizeAgent
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          value={defaultAgentSettings}
          onSaveAll={aiAssistant?.onSaveAll}
          modelOptions={aiAssistant?.modelOptions}
          promptLangOptions={aiAssistant?.promptLangOptions}
          analysisTemplateOptions={aiAssistant?.analysisTemplateOptions}
          responseTemplateOptions={aiAssistant?.responseTemplateOptions}
          defaultAnalysisTemplateId={aiAssistant?.defaultAnalysisTemplateId}
          defaultResponseTemplateId={aiAssistant?.defaultResponseTemplateId}
        />
      </Box>
    </Dialog>
  );
};
