import { CPaper, CTypography } from '../../../Atoms';
import type { ReactNode } from 'react';

export interface CChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const CChartCard = ({ title, subtitle, children }: CChartCardProps) => (
  <CPaper elevation={0} sx={{ padding: 16 }}>
    <CTypography variant="h4" sx={{ fontWeight: 700 }}>
      {title}
    </CTypography>
    {subtitle && (
      <CTypography variant="body2" muted sx={{ marginBottom: 16 }}>
        {subtitle}
      </CTypography>
    )}
    {children}
  </CPaper>
);
