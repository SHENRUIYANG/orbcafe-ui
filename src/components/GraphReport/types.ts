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

export interface GraphPieDatum {
  name: string;
  value: number;
  percent: number;
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
  };
  table: {
    columns: GraphTableColumn[];
    rows: GraphRow[];
  };
}

