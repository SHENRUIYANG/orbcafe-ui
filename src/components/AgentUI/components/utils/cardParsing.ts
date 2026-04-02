import { 
  ParsedCardData, 
  ChartCardTypeContent, 
  SAPCardTypeContent, 
  AgentUICardTypeContent, 
  TableTypeContent 
} from '../cardTypes'

export const parseCardPayload = (jsonString: string): ParsedCardData | null => {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    return null;
  }

  if (parsed && typeof parsed === 'object') {
    
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
