import { Box } from '@mui/material';
import type { GraphBarDatum, GraphPieDatum, GraphReportInteractionState } from '../types';
import { CBarChart, CChartCard, CPieChart } from './charts';
import { useOrbcafeI18n } from '../../../i18n';

interface CGraphChartsProps {
  billableByPrimary: GraphBarDatum[];
  efficiencyBySecondary: GraphBarDatum[];
  statusDistribution: GraphPieDatum[];
  interaction?: {
    filters?: GraphReportInteractionState;
    onPrimaryDimensionClick?: (value: string) => void;
    onSecondaryDimensionClick?: (value: string) => void;
    onStatusClick?: (value: string) => void;
  };
}

export const CGraphCharts = ({
  billableByPrimary,
  efficiencyBySecondary,
  statusDistribution,
  interaction,
}: CGraphChartsProps) => {
  const { t } = useOrbcafeI18n();
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: {
          xs: '1fr',
          lg: '1.2fr 1.2fr 1fr',
        },
      }}
    >
      <CChartCard title={t('graph.chart.billable.title')} subtitle={t('graph.chart.billable.subtitle')}>
        <CBarChart
          data={billableByPrimary}
          orientation="horizontal"
          activeName={interaction?.filters?.primaryDimension}
          onItemClick={(item) => interaction?.onPrimaryDimensionClick?.(item.name)}
        />
      </CChartCard>

      <CChartCard title={t('graph.chart.efficiency.title')} subtitle={t('graph.chart.efficiency.subtitle')}>
        <CBarChart
          data={efficiencyBySecondary}
          orientation="vertical"
          valueSuffix="%"
          activeName={interaction?.filters?.secondaryDimension}
          onItemClick={(item) => interaction?.onSecondaryDimensionClick?.(item.name)}
        />
      </CChartCard>

      <CChartCard title={t('graph.chart.status.title')} subtitle={t('graph.chart.status.subtitle')}>
        <CPieChart
          data={statusDistribution}
          variant="donut"
          activeName={interaction?.filters?.status}
          onItemClick={(item) => interaction?.onStatusClick?.(item.name)}
        />
      </CChartCard>
    </Box>
  );
};
