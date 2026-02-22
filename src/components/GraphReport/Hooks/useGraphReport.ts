import { useMemo } from 'react';
import type {
  GraphBarDatum,
  GraphPieDatum,
  GraphReportConfig,
  GraphReportFieldMapping,
  GraphReportKpis,
  GraphReportModel,
  GraphRow,
} from '../types';

const DEFAULT_FIELD_CANDIDATES = {
  primaryDimension: ['Client', 'Customer', 'Category', 'Project'],
  secondaryDimension: ['Person', 'Consultant', 'Owner', 'Name'],
  status: ['Status', 'state'],
  date: ['Date', 'WorkDate', 'CreatedAt'],
  description: ['Description', 'Task', 'Title', 'Memo'],
  reportHours: ['Report_Hour', 'Report Hours', 'Hours', 'ReportHours'],
  billableHours: ['Billable_Hour', 'Billable Hours', 'BillableHours'],
  amount: ['Amount', 'Billable_Amount', 'Total_Amount', 'Value'],
} as const;

const DEFAULT_TOP_N = 5;

const normalizeKey = (key: string) => key.toLowerCase().replace(/[\s_-]/g, '');

const resolveField = (
  rows: GraphRow[],
  explicitField: string | undefined,
  candidates: readonly string[],
  fallback: string,
): string => {
  if (explicitField) return explicitField;
  if (rows.length === 0) return fallback;

  const firstKeys = Object.keys(rows[0]);
  const normalized = new Map(firstKeys.map((k) => [normalizeKey(k), k]));
  for (const candidate of candidates) {
    const matched = normalized.get(normalizeKey(candidate));
    if (matched) return matched;
  }
  return firstKeys[0] || fallback;
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toStringOr = (value: unknown, fallback: string): string => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};

const aggregateTopN = (rows: GraphRow[], key: string, metric: string, topN: number): GraphBarDatum[] => {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const name = toStringOr(row[key], 'Unassigned');
    map.set(name, (map.get(name) || 0) + toNumber(row[metric]));
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
};

const aggregateBottomNEfficiency = (
  rows: GraphRow[],
  key: string,
  reportHoursKey: string,
  billableHoursKey: string,
  topN: number,
): GraphBarDatum[] => {
  const map = new Map<string, { report: number; billable: number }>();
  rows.forEach((row) => {
    const name = toStringOr(row[key], 'Unassigned');
    const prev = map.get(name) || { report: 0, billable: 0 };
    prev.report += toNumber(row[reportHoursKey]);
    prev.billable += toNumber(row[billableHoursKey]);
    map.set(name, prev);
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({
      name,
      value: value.report > 0 ? (value.billable / value.report) * 100 : 0,
    }))
    .sort((a, b) => a.value - b.value)
    .slice(0, topN);
};

const aggregateStatusDistribution = (rows: GraphRow[], statusKey: string): GraphPieDatum[] => {
  const total = rows.length;
  if (total === 0) return [];
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const status = toStringOr(row[statusKey], 'Unassigned');
    map.set(status, (map.get(status) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, value]) => ({
    name,
    value,
    percent: (value / total) * 100,
  }));
};

export interface UseGraphReportOptions {
  rows: GraphRow[];
  config?: GraphReportConfig;
}

export interface UseGraphReportResult {
  fieldMapping: GraphReportFieldMapping;
  model: GraphReportModel;
}

export const useGraphReport = ({ rows, config }: UseGraphReportOptions): UseGraphReportResult => {
  const fieldMapping = useMemo<GraphReportFieldMapping>(() => {
    const mapping = config?.fieldMapping;
    return {
      primaryDimension: resolveField(
        rows,
        mapping?.primaryDimension,
        DEFAULT_FIELD_CANDIDATES.primaryDimension,
        'Category',
      ),
      secondaryDimension: resolveField(
        rows,
        mapping?.secondaryDimension,
        DEFAULT_FIELD_CANDIDATES.secondaryDimension,
        'Owner',
      ),
      status: resolveField(rows, mapping?.status, DEFAULT_FIELD_CANDIDATES.status, 'Status'),
      date: resolveField(rows, mapping?.date, DEFAULT_FIELD_CANDIDATES.date, 'Date'),
      description: resolveField(
        rows,
        mapping?.description,
        DEFAULT_FIELD_CANDIDATES.description,
        'Description',
      ),
      reportHours: resolveField(
        rows,
        mapping?.reportHours,
        DEFAULT_FIELD_CANDIDATES.reportHours,
        'ReportHours',
      ),
      billableHours: resolveField(
        rows,
        mapping?.billableHours,
        DEFAULT_FIELD_CANDIDATES.billableHours,
        'BillableHours',
      ),
      amount: resolveField(rows, mapping?.amount, DEFAULT_FIELD_CANDIDATES.amount, 'Amount'),
    };
  }, [rows, config?.fieldMapping]);

  const normalizedRows = useMemo<GraphRow[]>(
    () =>
      rows.map((row, index) => {
        const reportHours = toNumber(row[fieldMapping.reportHours]);
        const billableHours = toNumber(row[fieldMapping.billableHours]);
        const amount = toNumber(row[fieldMapping.amount]);
        const efficiency = reportHours > 0 ? (billableHours / reportHours) * 100 : 0;
        return {
          id: `graph-row-${index}`,
          Date: toStringOr(row[fieldMapping.date], ''),
          Primary: toStringOr(row[fieldMapping.primaryDimension], 'Unassigned'),
          Secondary: toStringOr(row[fieldMapping.secondaryDimension], 'Unassigned'),
          Description: toStringOr(row[fieldMapping.description], ''),
          ReportHours: reportHours,
          BillableHours: billableHours,
          Amount: amount,
          Efficiency: efficiency,
          Status: toStringOr(row[fieldMapping.status], 'Unassigned'),
        };
      }),
    [rows, fieldMapping],
  );

  const kpis = useMemo<GraphReportKpis>(() => {
    const totalRecords = normalizedRows.length;
    const totalReportHours = normalizedRows.reduce((sum, row) => sum + toNumber(row.ReportHours), 0);
    const totalBillableHours = normalizedRows.reduce((sum, row) => sum + toNumber(row.BillableHours), 0);
    const totalAmount = normalizedRows.reduce((sum, row) => sum + toNumber(row.Amount), 0);
    const efficiency = totalReportHours > 0 ? (totalBillableHours / totalReportHours) * 100 : 0;
    const statusFlagValues = config?.statusFlagValues || ['flag', 'flagged', 'warning', 'risk'];
    const flaggedCount = normalizedRows.filter((row) =>
      statusFlagValues.includes(toStringOr(row.Status, '').toLowerCase()),
    ).length;
    return {
      totalRecords,
      totalReportHours,
      totalBillableHours,
      efficiency,
      totalAmount,
      flaggedCount,
    };
  }, [normalizedRows, config?.statusFlagValues]);

  const topN = config?.topN || DEFAULT_TOP_N;

  const charts = useMemo(
    () => ({
      billableByPrimary: aggregateTopN(normalizedRows, 'Primary', 'BillableHours', topN),
      efficiencyBySecondary: aggregateBottomNEfficiency(
        normalizedRows,
        'Secondary',
        'ReportHours',
        'BillableHours',
        topN,
      ),
      statusDistribution: aggregateStatusDistribution(normalizedRows, 'Status'),
    }),
    [normalizedRows, topN],
  );

  const model = useMemo<GraphReportModel>(
    () => ({
      title: config?.title || 'Graphic Report',
      kpis,
      charts,
      table: {
        columns: [
          { id: 'Date', label: fieldMapping.date },
          { id: 'Primary', label: fieldMapping.primaryDimension },
          { id: 'Secondary', label: fieldMapping.secondaryDimension },
          { id: 'Description', label: fieldMapping.description },
          { id: 'ReportHours', label: 'Report Hours', align: 'right' },
          { id: 'BillableHours', label: 'Billable Hours', align: 'right' },
          { id: 'Amount', label: 'Amount', align: 'right' },
          { id: 'Efficiency', label: 'Efficiency', align: 'right' },
          { id: 'Status', label: fieldMapping.status },
        ],
        rows: normalizedRows,
      },
    }),
    [charts, config?.title, fieldMapping, kpis, normalizedRows],
  );

  return {
    fieldMapping,
    model,
  };
};
