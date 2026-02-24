import type { ReactNode } from 'react';
import { Paper, Typography } from '@mui/material';

export interface CChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const CChartCard = ({ title, subtitle, children }: CChartCardProps) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
    <Typography variant="subtitle1" fontWeight={700}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {subtitle}
      </Typography>
    )}
    {children}
  </Paper>
);
