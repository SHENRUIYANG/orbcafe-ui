'use client'

import { FC } from 'react'
import { ChartCardTypeContent } from '../cardTypes'
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Activity, 
  Grid, 
  GitBranch, 
  TrendingDown, 
  MapPin, 
  Globe 
} from 'lucide-react'
import { 
  CBarChart, 
  CLineChart, 
  CPieChart,
  CComboChart,
  CHeatmapChart,
  CFishboneChart,
  CWaterfallChart,
  CGoogleMapChart,
  CAmapChart
} from '../../../GraphReport/Components/charts'
import { 
  GraphBarDatum, 
  GraphLineDatum, 
  GraphPieDatum,
  GraphComboDatum,
  GraphHeatmapDatum,
  GraphFishboneBranch,
  GraphWaterfallDatum
} from '../../../GraphReport/types'

export const ChartCard: FC<ChartCardTypeContent> = ({ 
  title, 
  subtitle, 
  data, 
  type,
  config = {}
}) => {
  const getIcon = () => {
    switch (type) {
      case 'bar-chart-card': return <BarChart className="w-4 h-4 text-blue-500" />
      case 'line-chart-card': return <LineChart className="w-4 h-4 text-green-500" />
      case 'pie-chart-card': return <PieChart className="w-4 h-4 text-purple-500" />
      case 'combo-chart-card': return <Activity className="w-4 h-4 text-orange-500" />
      case 'heatmap-chart-card': return <Grid className="w-4 h-4 text-red-500" />
      case 'fishbone-chart-card': return <GitBranch className="w-4 h-4 text-indigo-500" />
      case 'waterfall-chart-card': return <TrendingDown className="w-4 h-4 text-teal-500" />
      case 'google-map-card': return <Globe className="w-4 h-4 text-blue-600" />
      case 'amap-card': return <MapPin className="w-4 h-4 text-blue-600" />
      default: return <BarChart className="w-4 h-4" />
    }
  }

  const renderChart = () => {
    if (!data && type !== 'google-map-card' && type !== 'amap-card') {
      return <div className="text-gray-500 text-sm p-4 text-center">No data available</div>
    }

    try {
      switch (type) {
        case 'bar-chart-card':
          return (
            <CBarChart 
              data={data as GraphBarDatum[]} 
              orientation={config.orientation || 'horizontal'}
              valueSuffix={config.valueSuffix || ''}
              minHeight={config.minHeight}
            />
          )
        case 'line-chart-card':
          return (
            <CLineChart 
              data={data as GraphLineDatum[]} 
              color={config.color}
              valueSuffix={config.valueSuffix || ''}
              height={config.height}
            />
          )
        case 'pie-chart-card':
          // Ensure percent exists
          // const pieData = data.map((item: any) => {
          //   if (typeof item.percent === 'number') return item;
          //   return item;
          // });
          
          // If percent is missing, we might need to calculate it.
          // But CPieChart expects percent. Let's calculate it if possible.
          const total = data.reduce((sum: number, item: any) => sum + (Number(item.value) || 0), 0);
          const pieDataWithPercent: GraphPieDatum[] = data.map((item: any) => ({
            name: item.name,
            value: Number(item.value) || 0,
            percent: typeof item.percent === 'number' ? item.percent : (total > 0 ? ((Number(item.value) || 0) / total) * 100 : 0)
          }));

          return (
            <CPieChart 
              data={pieDataWithPercent} 
              variant={config.variant || 'donut'}
              size={config.size}
              colors={config.colors}
            />
          )
        case 'combo-chart-card':
          return (
            <CComboChart 
              data={data as GraphComboDatum[]} 
              barColor={config.barColor}
              lineColor={config.lineColor}
            />
          )
        case 'heatmap-chart-card':
          return (
            <CHeatmapChart 
              data={data as GraphHeatmapDatum[]} 
            />
          )
        case 'fishbone-chart-card':
          return (
            <CFishboneChart 
              branches={data as GraphFishboneBranch[]} 
              effect={config.effect || title || 'Problem'}
            />
          )
        case 'waterfall-chart-card':
          return (
            <CWaterfallChart 
              data={data as GraphWaterfallDatum[]} 
              height={config.height}
            />
          )
        case 'google-map-card':
          return (
            <CGoogleMapChart 
              embedUrl={config.embedUrl || (data && data[0]?.embedUrl)}
              apiKey={config.apiKey}
              query={config.query || (data && data[0]?.query) || title}
              height={config.height}
            />
          )
        case 'amap-card':
          return (
            <CAmapChart 
              embedUrl={config.embedUrl || (data && data[0]?.embedUrl)}
              keyword={config.keyword || (data && data[0]?.keyword) || title}
              height={config.height}
            />
          )
        default:
          return <div className="text-gray-500 text-sm p-4 text-center">Unsupported chart type: {type}</div>
      }
    } catch (e) {
      console.error('Error rendering chart:', e);
      return <div className="text-red-500 text-sm p-4 text-center">Error rendering chart</div>
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="mr-2 flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="overflow-x-auto">
          {renderChart()}
        </div>
        
        {/* Optional: Collapsible raw data view for debugging or detailed inspection */}
        <div className="mt-3">
          <details className="text-xs text-gray-500 dark:text-gray-400">
            <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors select-none font-medium opacity-60 hover:opacity-100">
              View Raw Data
            </summary>
            <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-950 rounded border border-gray-100 dark:border-gray-800 overflow-x-auto max-h-40">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
