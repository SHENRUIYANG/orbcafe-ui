import { useMemo } from 'react';
import type {
  GraphBarDatum,
  GraphComboDatum,
  GraphHeatmapDatum,
  GraphLineDatum,
  GraphPieDatum,
  GraphWaterfallDatum,
} from '../types';

export interface UseGraphChartDataOptions {
  bars?: GraphBarDatum[];
  lines?: GraphLineDatum[];
  combos?: GraphComboDatum[];
  heatmap?: GraphHeatmapDatum[];
  pies?: GraphPieDatum[];
  waterfalls?: GraphWaterfallDatum[];
}

const sortByValueDesc = <T extends { value: number }>(items: T[]) =>
  [...items].sort((a, b) => b.value - a.value);

export interface UseGraphChartDataResult {
  bars: GraphBarDatum[];
  lines: GraphLineDatum[];
  combos: GraphComboDatum[];
  heatmap: GraphHeatmapDatum[];
  pies: GraphPieDatum[];
  waterfalls: GraphWaterfallDatum[];
}

export const useGraphChartData = ({
  bars = [],
  lines = [],
  combos = [],
  heatmap = [],
  pies = [],
  waterfalls = [],
}: UseGraphChartDataOptions): UseGraphChartDataResult => {
  const normalizedBars = useMemo(() => sortByValueDesc(bars), [bars]);
  const normalizedLines = useMemo(() => [...lines], [lines]);
  const normalizedCombos = useMemo(() => [...combos], [combos]);
  const normalizedHeatmap = useMemo(() => [...heatmap], [heatmap]);
  const normalizedPies = useMemo(() => {
    const total = pies.reduce((sum, item) => sum + item.value, 0);
    return pies.map((item) => ({
      ...item,
      percent: total > 0 ? (item.value / total) * 100 : item.percent,
    }));
  }, [pies]);
  const normalizedWaterfalls = useMemo(() => [...waterfalls], [waterfalls]);

  return {
    bars: normalizedBars,
    lines: normalizedLines,
    combos: normalizedCombos,
    heatmap: normalizedHeatmap,
    pies: normalizedPies,
    waterfalls: normalizedWaterfalls,
  };
};
