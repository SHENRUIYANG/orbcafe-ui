import type { CustomizeAgentSettings } from '../CustomizeAgent/types';

export type GraphRow = Record<string, unknown>;

export interface GraphReportFieldMapping {
  primaryDimension: string;
  secondaryDimension: string;
  status: string;
  date: string;
  description: string;
  reportHours: string;
  billableHours: string;
  amount: string;
}

export interface GraphReportConfig {
  enabled?: boolean;
  title?: string;
  topN?: number;
  fieldMapping?: Partial<GraphReportFieldMapping>;
  statusFlagValues?: string[];
  interaction?: {
    enabled?: boolean;
  };
  aiAssistant?: {
    enabled?: boolean;
    placeholder?: string;
    submitLabel?: string;
    defaultPrompt?: string;
    onSubmit?: (prompt: string, context: { filters: GraphReportInteractionState; model: GraphReportModel }) => void | Promise<void>;
    onVoiceInput?: () => void;
    settings?: CustomizeAgentSettings;
    onSaveAll?: (payload: {
      settings: CustomizeAgentSettings;
      analysisTemplateId?: string;
      responseTemplateId?: string;
    }) => void | Promise<void>;
    analysisTemplateOptions?: Array<{ id: string; label: string }>;
    responseTemplateOptions?: Array<{ id: string; label: string }>;
    defaultAnalysisTemplateId?: string;
    defaultResponseTemplateId?: string;
    modelOptions?: string[];
    promptLangOptions?: string[];
  };
}

export interface GraphReportInteractionState {
  primaryDimension?: string;
  secondaryDimension?: string;
  status?: string;
}

export interface GraphReportKpis {
  totalRecords: number;
  totalReportHours: number;
  totalBillableHours: number;
  efficiency: number;
  totalAmount: number;
  flaggedCount: number;
}

export interface GraphBarDatum {
  name: string;
  value: number;
}

export interface GraphLineDatum {
  name: string;
  value: number;
}

export interface GraphComboDatum {
  name: string;
  barValue: number;
  lineValue: number;
}

export interface GraphHeatmapDatum {
  x: string;
  y: string;
  value: number;
}

export interface GraphPieDatum {
  name: string;
  value: number;
  percent: number;
}

export interface GraphFishboneBranch {
  title: string;
  causes: string[];
}

export interface GraphWaterfallDatum {
  name: string;
  value: number;
  type?: 'delta' | 'total';
}

export interface GraphMapLocation {
  lat: number;
  lng: number;
  name?: string;
}

export interface GraphTableColumn {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

export interface GraphReportModel {
  title: string;
  kpis: GraphReportKpis;
  charts: {
    billableByPrimary: GraphBarDatum[];
    efficiencyBySecondary: GraphBarDatum[];
    statusDistribution: GraphPieDatum[];
    lineByDate?: GraphLineDatum[];
    comboByPrimary?: GraphComboDatum[];
    heatmapPrimarySecondary?: GraphHeatmapDatum[];
    waterfallBillable?: GraphWaterfallDatum[];
    fishboneStatusCauses?: GraphFishboneBranch[];
  };
  table: {
    columns: GraphTableColumn[];
    rows: GraphRow[];
  };
}
