'use client';

import { useCallback, useMemo } from 'react';
import { Box, IconButton, Paper, Stack, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { CTable } from '../StdReport/CTable';
import { useOrbcafeI18n } from '../../i18n';
import { MarkdownRenderer } from '../../lib/renderer/md_renderer';
import { CDetailSearchAiBar } from './Components/CDetailSearchAiBar';
import { CDetailSectionCard } from './Components/CDetailSectionCard';
import { useDetailInfo } from './Hooks/useDetailInfo';
import type { CDetailInfoPageProps } from './types';

export const CDetailInfoPage = ({
  title,
  subtitle,
  sections,
  tabs = [],
  defaultTabId,
  table,
  ai,
  rightHeaderSlot,
  searchBarWidth = 460,
  onClose,
  closeLabel = 'Close',
}: CDetailInfoPageProps) => {
  const { t } = useOrbcafeI18n();

  const {
    query,
    setQuery,
    activeTabId,
    setActiveTabId,
    searchMode,
    hits,
    statusText,
    aiResponse,
    searching,
    handleSubmit,
    clearResult,
  } = useDetailInfo({
    sections,
    tabs,
    defaultTabId,
    ai,
  });

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) || tabs[0],
    [tabs, activeTabId],
  );

  const jumpToSection = useCallback((id: string) => {
    const tryScroll = (attempt: number) => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (attempt < 4) {
        setTimeout(() => tryScroll(attempt + 1), 60);
      }
    };
    requestAnimationFrame(() => tryScroll(0));
  }, []);

  const handleHitClick = useCallback((sourceId: string, sourceSectionId?: string) => {
    if (tabs.some((tab) => tab.id === sourceId)) {
      setActiveTabId(sourceId);
      if (sourceSectionId) {
        jumpToSection(`detail-tab-${sourceId}-section-${sourceSectionId}`);
      } else {
        jumpToSection(`detail-tab-${sourceId}`);
      }
      return;
    }
    jumpToSection(`detail-section-${sourceId}`);
  }, [tabs, setActiveTabId, jumpToSection]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        minHeight: '100%',
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Stack
          direction="row"
          spacing={0.6}
          alignItems="center"
          sx={{ width: { xs: '100%', md: 'auto' }, ml: { xs: 0, md: 'auto' } }}
        >
          <Box sx={{ width: { xs: '100%', md: searchBarWidth }, maxWidth: '100%', minWidth: { md: 320 } }}>
            <CDetailSearchAiBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSubmit}
              onVoiceInput={ai?.onVoiceInput}
              onClear={() => {
                setQuery('');
                clearResult();
              }}
              placeholder={ai?.placeholder || t('detail.searchAi.placeholder')}
              statusText={statusText}
              loading={searching}
              compact
              showStatusText={false}
            />
          </Box>

          {onClose && (
            <Tooltip title={closeLabel}>
              <IconButton size="small" onClick={onClose}>
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {rightHeaderSlot}
        </Stack>
      </Stack>

      {statusText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: -0.7 }}>
          {statusText}
        </Typography>
      )}

      {searchMode === 'search' && hits.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.6 }}>
            {t('detail.searchAi.matches', { count: hits.length })}
          </Typography>
          <Stack spacing={0.35}>
            {hits.slice(0, 8).map((hit) => (
              <Box
                key={`${hit.source}|${hit.sourceId}|${hit.fieldId}`}
                component="button"
                type="button"
                onClick={() => handleHitClick(hit.sourceId, hit.sourceSectionId)}
                sx={{
                  textAlign: 'left',
                  border: 0,
                  bgcolor: 'transparent',
                  p: 0.2,
                  cursor: 'pointer',
                  color: 'text.primary',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography variant="body2" sx={{ fontSize: '0.84rem' }}>
                  <Box component="span" sx={{ color: 'text.secondary' }}>{hit.sourceTitle}</Box>
                  {' · '}
                  <Box component="span" sx={{ fontWeight: 700 }}>{hit.fieldLabel}</Box>
                  {' = '}
                  <Box component="span">{hit.fieldValue || '-'}</Box>
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {searchMode === 'ai' && aiResponse && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.7 }}>
            {t('detail.searchAi.aiResultTitle')}
          </Typography>
          <Box
            sx={{
              fontSize: '0.9rem',
              lineHeight: 1.6,
              '& p': { m: 0, mb: 0.8 },
              '& h1, & h2, & h3, & h4': { mt: 1.2, mb: 0.6, lineHeight: 1.3 },
              '& ul, & ol': { mt: 0.4, mb: 0.8, pl: 2.6 },
              '& code': {
                px: 0.5,
                py: 0.1,
                borderRadius: 0.8,
                bgcolor: 'action.hover',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              },
              '& pre': {
                m: 0,
                mt: 0.8,
                mb: 0.8,
                p: 1.1,
                borderRadius: 1.2,
                bgcolor: 'action.hover',
                overflowX: 'auto',
              },
              '& pre code': {
                p: 0,
                bgcolor: 'transparent',
              },
            }}
          >
            <MarkdownRenderer markdown={aiResponse} />
          </Box>
        </Paper>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'repeat(2, minmax(0, 1fr))',
          },
        }}
      >
        {sections.map((section) => (
          <Box key={section.id} id={`detail-section-${section.id}`}>
            <CDetailSectionCard section={section} highlightQuery={query} />
          </Box>
        ))}
      </Box>

      {tabs.length > 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={activeTab?.id || false}
            onChange={(_, value) => setActiveTabId(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.id} value={tab.id} label={tab.label} sx={{ textTransform: 'none' }} />
            ))}
          </Tabs>

          <Box sx={{ p: 1.5 }}>
            <Box id={`detail-tab-${activeTab?.id || ''}`} />
            {activeTab?.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.2 }}>
                {activeTab.description}
              </Typography>
            )}

            {activeTab?.content ? (
              activeTab.content
            ) : (
              <Stack spacing={1.5}>
                {(activeTab?.sections || []).map((section) => (
                  <Box key={section.id} id={`detail-tab-${activeTab?.id}-section-${section.id}`}>
                    <CDetailSectionCard section={section} highlightQuery={query} />
                  </Box>
                ))}

                {activeTab?.fields && activeTab.fields.length > 0 && (
                  <CDetailSectionCard
                    section={{
                      id: `${activeTab.id}-fields`,
                      title: activeTab.label,
                      fields: activeTab.fields,
                      columns: 2,
                    }}
                    highlightQuery={query}
                  />
                )}
              </Stack>
            )}
          </Box>
        </Paper>
      )}

      {table && (
        <CTable
          title={table.title || t('detail.table.title')}
          {...table.tableProps}
          filterConfig={undefined}
          fitContainer={false}
        />
      )}
    </Box>
  );
};
