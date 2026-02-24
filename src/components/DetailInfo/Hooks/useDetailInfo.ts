'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOrbcafeI18n } from '../../../i18n';
import type {
  DetailInfoAiConfig,
  DetailInfoSearchHit,
  DetailInfoSection,
  DetailInfoTab,
} from '../types';

const toSearchableText = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
};

const normalize = (value: string) => value.trim().toLowerCase();

interface SearchableRecord {
  hit: DetailInfoSearchHit;
  text: string;
}

const buildSearchableRecords = (sections: DetailInfoSection[], tabs: DetailInfoTab[]): SearchableRecord[] => {
  const records: SearchableRecord[] = [];

  sections.forEach((section) => {
    section.fields.forEach((field) => {
      const fieldValue = field.searchableText || toSearchableText(field.value);
      const hit: DetailInfoSearchHit = {
        source: 'section',
        sourceId: section.id,
        sourceSectionId: section.id,
        sourceTitle: section.title,
        fieldId: field.id,
        fieldLabel: field.label,
        fieldValue,
      };
      records.push({
        hit,
        text: normalize(`${section.title} ${field.label} ${fieldValue}`),
      });
    });
  });

  tabs.forEach((tab) => {
    (tab.fields || []).forEach((field) => {
      const fieldValue = field.searchableText || toSearchableText(field.value);
      const hit: DetailInfoSearchHit = {
        source: 'tab',
        sourceId: tab.id,
        sourceTitle: tab.label,
        fieldId: field.id,
        fieldLabel: field.label,
        fieldValue,
      };
      records.push({
        hit,
        text: normalize(`${tab.label} ${field.label} ${fieldValue}`),
      });
    });

    (tab.sections || []).forEach((section) => {
      section.fields.forEach((field) => {
        const fieldValue = field.searchableText || toSearchableText(field.value);
        const hit: DetailInfoSearchHit = {
          source: 'tab',
          sourceId: tab.id,
          sourceSectionId: section.id,
          sourceTitle: `${tab.label} / ${section.title}`,
          fieldId: field.id,
          fieldLabel: field.label,
          fieldValue,
        };
        records.push({
          hit,
          text: normalize(`${tab.label} ${section.title} ${field.label} ${fieldValue}`),
        });
      });
    });
  });

  return records;
};

export type DetailInfoSearchMode = 'idle' | 'search' | 'ai';

export interface UseDetailInfoOptions {
  sections: DetailInfoSection[];
  tabs?: DetailInfoTab[];
  defaultTabId?: string;
  ai?: DetailInfoAiConfig;
}

export interface UseDetailInfoResult {
  query: string;
  setQuery: (value: string) => void;
  activeTabId?: string;
  setActiveTabId: (value: string) => void;
  searchMode: DetailInfoSearchMode;
  hits: DetailInfoSearchHit[];
  statusText: string;
  aiResponse: string;
  searching: boolean;
  handleSubmit: () => Promise<void>;
  clearResult: () => void;
}

export const useDetailInfo = ({
  sections,
  tabs = [],
  defaultTabId,
  ai,
}: UseDetailInfoOptions): UseDetailInfoResult => {
  const { t } = useOrbcafeI18n();
  const [query, setQueryState] = useState('');
  const [activeTabId, setActiveTabId] = useState<string | undefined>(defaultTabId || tabs[0]?.id);
  const [searchMode, setSearchMode] = useState<DetailInfoSearchMode>('idle');
  const [hits, setHits] = useState<DetailInfoSearchHit[]>([]);
  const [statusText, setStatusText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [searching, setSearching] = useState(false);

  const records = useMemo(() => buildSearchableRecords(sections, tabs), [sections, tabs]);

  useEffect(() => {
    if (tabs.length === 0) {
      setActiveTabId(undefined);
      return;
    }

    const tabExists = tabs.some((tab) => tab.id === activeTabId);
    if (!tabExists) {
      setActiveTabId(defaultTabId || tabs[0]?.id);
    }
  }, [tabs, activeTabId, defaultTabId]);

  const clearResult = useCallback(() => {
    setSearchMode('idle');
    setHits([]);
    setStatusText('');
    setAiResponse('');
  }, []);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    if (!value.trim()) {
      setSearchMode('idle');
      setHits([]);
      setStatusText('');
      setAiResponse('');
    }
  }, []);

  const runSearch = useCallback((rawQuery: string): DetailInfoSearchHit[] => {
    const q = normalize(rawQuery);
    if (!q) return [];
    return records
      .filter((record) => record.text.includes(q))
      .map((record) => record.hit);
  }, [records]);

  const handleSubmit = useCallback(async () => {
    const q = query.trim();
    if (!q) return;

    setSearching(true);
    const nextHits = runSearch(q);
    setHits(nextHits);

    if (nextHits.length > 0) {
      setSearchMode('search');
      setAiResponse('');
      setStatusText(t('detail.searchAi.matches', { count: nextHits.length }));
      setSearching(false);
      return;
    }

    const aiEnabled = ai?.enabled !== false;
    if (aiEnabled && ai?.onSubmit) {
      setSearchMode('ai');
      setStatusText(t('detail.searchAi.autoAiFallback'));
      try {
        const result = await ai.onSubmit(q, {
          query: q,
          hits: nextHits,
          activeTabId,
          sections,
          tabs,
        });
        setAiResponse(typeof result === 'string' ? result : '');
      } finally {
        setSearching(false);
      }
      return;
    }

    setSearchMode('search');
    setAiResponse('');
    setStatusText(t('detail.searchAi.noMatch'));
    setSearching(false);
  }, [query, runSearch, t, ai, activeTabId, sections, tabs]);

  return {
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
  };
};
