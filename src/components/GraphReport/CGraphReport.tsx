import { CButton, CChip, CDialog, CIconButton, CStack, CTypography } from '../../components/Atoms';
import { X, Mic, Settings, SendHorizontal } from '@/components/Icons';
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
    <CDialog open={open} onClose={onClose} fullWidth maxWidth={1400} hideCloseButton>
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', background: 'var(--orb-canvas)' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--orb-border)' }}>
          <CStack direction="row" alignItems="center" justifyContent="space-between" spacing={12}>
            <CStack direction="row" spacing={10} alignItems="center" sx={{ flexWrap: 'wrap' }}>
              <CTypography variant="h3" sx={{ fontWeight: 800 }}>
                {model.title}
              </CTypography>
              <CChip label={t('graph.records', { count: model.kpis.totalRecords })} />
              {hasInteraction && activeFilters.primaryDimension && (
                <CChip
                  tone="outline"
                  label={`${interaction?.fieldMapping.primaryDimension}: ${activeFilters.primaryDimension}`}
                  onDelete={() => interaction?.onClearFilter('primaryDimension')}
                />
              )}
              {hasInteraction && activeFilters.secondaryDimension && (
                <CChip
                  tone="outline"
                  label={`${interaction?.fieldMapping.secondaryDimension}: ${activeFilters.secondaryDimension}`}
                  onDelete={() => interaction?.onClearFilter('secondaryDimension')}
                />
              )}
              {hasInteraction && activeFilters.status && (
                <CChip
                  tone="outline"
                  label={`${interaction?.fieldMapping.status}: ${activeFilters.status}`}
                  onDelete={() => interaction?.onClearFilter('status')}
                />
              )}
              {hasInteraction && hasActiveFilters && (
                <CButton size="small" variant="ghost" onClick={() => interaction?.onClearAll()}>
                  Clear
                </CButton>
              )}
            </CStack>
            <CStack direction="row" spacing={10} alignItems="center">
              {aiEnabled && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    borderRadius: 999,
                    border: '1px solid var(--orb-border)',
                    background: 'var(--orb-surface)',
                    minWidth: 320,
                  }}
                >
                  <CIconButton size="small" onClick={aiAssistant?.onVoiceInput}>
                    <Mic size={16} strokeWidth={1.8} />
                  </CIconButton>
                  <input
                    className="orb-inp orb-inp-dense"
                    value={aiPrompt}
                    onChange={(event) => setAiPrompt(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSubmitAiPrompt();
                      }
                    }}
                    placeholder={aiPlaceholder}
                    style={{ fontSize: 14, border: 'none', background: 'transparent', flex: 1, minWidth: 0 }}
                  />
                  <CIconButton size="small" onClick={handleSubmitAiPrompt} disabled={submitting || !aiPrompt.trim()}>
                    <SendHorizontal size={16} strokeWidth={1.8} />
                  </CIconButton>
                  <CIconButton size="small" onClick={() => setSettingsOpen(true)}>
                    <Settings size={16} strokeWidth={1.8} />
                  </CIconButton>
                </div>
              )}
              <CIconButton onClick={onClose}>
                <X size={18} strokeWidth={2} />
              </CIconButton>
            </CStack>
          </CStack>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto', minHeight: 0 }}>
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
        </div>

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
      </div>
    </CDialog>
  );
};
