import type { ReactNode } from 'react';
import type { CTableProps } from '../StdReport/Hooks/CTable/types';

export interface DetailInfoField {
  id: string;
  label: string;
  value: ReactNode;
  searchableText?: string;
}

export interface DetailInfoSection {
  id: string;
  title: string;
  fields: DetailInfoField[];
  columns?: 1 | 2 | 3;
}

export interface DetailInfoTab {
  id: string;
  label: string;
  description?: string;
  content?: ReactNode;
  sections?: DetailInfoSection[];
  fields?: DetailInfoField[];
}

export interface DetailInfoSearchHit {
  source: 'section' | 'tab';
  sourceId: string;
  sourceSectionId?: string;
  sourceTitle: string;
  fieldId: string;
  fieldLabel: string;
  fieldValue: string;
}

export interface DetailInfoAiConfig {
  enabled?: boolean;
  placeholder?: string;
  onSubmit?: (query: string, context: {
    query: string;
    hits: DetailInfoSearchHit[];
    activeTabId?: string;
    sections: DetailInfoSection[];
    tabs: DetailInfoTab[];
  }) => Promise<string | void> | string | void;
  onVoiceInput?: () => void;
}

export interface DetailInfoTableConfig {
  title?: string;
  tableProps: Omit<CTableProps, 'filterConfig'>;
}

export interface CDetailInfoPageProps {
  title: string;
  subtitle?: string;
  sections: DetailInfoSection[];
  tabs?: DetailInfoTab[];
  defaultTabId?: string;
  table?: DetailInfoTableConfig;
  ai?: DetailInfoAiConfig;
  rightHeaderSlot?: ReactNode;
  searchBarWidth?: number | string;
  onClose?: () => void;
  closeLabel?: string;
}
