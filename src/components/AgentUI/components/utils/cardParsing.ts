import { 
  ParsedCardData, 
  ChartCardTypeContent, 
  MetricChartCardTypeContent,
  SAPCardTypeContent, 
  AgentUICardTypeContent, 
  TableTypeContent 
} from '../cardTypes'
import { METRIC_CHART_TYPES } from '../../../MetricChart'

const normalizeMetricChartData = (data: unknown): MetricChartCardTypeContent['data'] => {
  if (!Array.isArray(data)) return []
  return data.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return []
    const record = item as Record<string, unknown>
    const label = String(record.label ?? record.name ?? record.id ?? `Item ${index + 1}`)
    const rawValue = Number(record.value)
    const value = Number.isFinite(rawValue) ? rawValue : 0
    const rawSecondaryValue = record.secondaryValue === undefined ? undefined : Number(record.secondaryValue)
    return [{
      id: String(record.id ?? record.name ?? record.label ?? index),
      label,
      value,
      ...(rawSecondaryValue !== undefined && Number.isFinite(rawSecondaryValue) ? { secondaryValue: rawSecondaryValue } : {}),
      ...(typeof record.color === 'string' ? { color: record.color } : {})
    }]
  })
}

export const parseCardPayload = (jsonString: string): ParsedCardData | null => {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    return null;
  }

  if (parsed && typeof parsed === 'object') {
    if (parsed.type === 'metric-chart-card' && parsed.title && Array.isArray(parsed.data)) {
      const chartType = METRIC_CHART_TYPES.includes(parsed.chartType) ? parsed.chartType : 'bar'
      return {
        ...parsed,
        type: 'metric-chart-card',
        chartType,
        data: normalizeMetricChartData(parsed.data)
      } as MetricChartCardTypeContent;
    }
    
    if (parsed.type === 'bar-chart-card' || 
        parsed.type === 'line-chart-card' || 
        parsed.type === 'pie-chart-card' ||
        parsed.type === 'combo-chart-card' ||
        parsed.type === 'heatmap-chart-card' ||
        parsed.type === 'fishbone-chart-card' ||
        parsed.type === 'waterfall-chart-card' ||
        parsed.type === 'google-map-card' ||
        parsed.type === 'amap-card') {
      if (parsed.title) {
        return parsed as ChartCardTypeContent;
      }
    }

    if (parsed.type === 'sap-analytical-card' || 
        parsed.type === 'sap-list-card' || 
        parsed.type === 'sap-object-card' ||
        parsed.type === 'sap-component-card') {
      if (parsed.manifest) {
        return parsed as SAPCardTypeContent;
      }
    }

    if (parsed.type === 'error-card' || 
        parsed.type === 'warning-card' || 
        parsed.type === 'suggestions-card' ||
        parsed.type === 'tool-result-card') {
      return parsed as AgentUICardTypeContent;
    }

    if (parsed.type === 'table' && parsed.data) {
      return parsed as TableTypeContent;
    }
  }
  
  return null;
};
