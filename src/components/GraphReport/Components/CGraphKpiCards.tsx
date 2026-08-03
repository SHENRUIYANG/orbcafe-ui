import { CPaper, CTypography } from '../../Atoms';
import type { GraphReportKpis } from '../types';
import { useOrbcafeI18n } from '../../../i18n';

interface CGraphKpiCardsProps {
  kpis: GraphReportKpis;
}

const formatNumber = (value: number, maximumFractionDigits = 2) =>
  value.toLocaleString(undefined, { maximumFractionDigits });

export const CGraphKpiCards = ({ kpis }: CGraphKpiCardsProps) => {
  const { t } = useOrbcafeI18n();
  const cards = [
    { label: t('graph.kpi.totalRecords'), value: formatNumber(kpis.totalRecords, 0), color: 'var(--orb-fg)' },
    { label: t('graph.kpi.totalReport'), value: formatNumber(kpis.totalReportHours), color: 'var(--orb-fg)' },
    { label: t('graph.kpi.totalBillable'), value: formatNumber(kpis.totalBillableHours), color: 'var(--orb-primary)' },
    { label: t('graph.kpi.efficiency'), value: `${kpis.efficiency.toFixed(2)}%`, color: 'var(--orb-accent)' },
    { label: t('graph.kpi.amount'), value: formatNumber(kpis.totalAmount), color: 'var(--orb-primary)' },
    { label: t('graph.kpi.flagged'), value: formatNumber(kpis.flaggedCount, 0), color: 'var(--orb-err)' },
  ];

  return (
        <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
      }}
    >
      {cards.map((card) => (
        <CPaper
          key={card.label}
          elevation={0}
          sx={{
            padding: 12,
            minHeight: 96,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <CTypography variant="caption" muted>
            {card.label}
          </CTypography>
          <CTypography variant="h3" sx={{ fontWeight: 800, color: card.color, fontVariantNumeric: 'tabular-nums' }}>
            {card.value}
          </CTypography>
        </CPaper>
      ))}
    </div>
  );
};
