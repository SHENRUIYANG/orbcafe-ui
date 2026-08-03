import { CStack, CTypography } from '../../../Atoms';

import type { GraphFishboneBranch } from '../../types';

export interface CFishboneChartProps {
  effect: string;
  branches: GraphFishboneBranch[];
}

export const CFishboneChart = ({ effect, branches }: CFishboneChartProps) => {
  if (branches.length === 0) {
    return <CTypography variant="body2" muted>No data</CTypography>;
  }

  const upper = branches.filter((_, i) => i % 2 === 0);
  const lower = branches.filter((_, i) => i % 2 === 1);

  return (
    <CStack spacing={1.5}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(upper.length, 1)}, minmax(0, 1fr))`, gap: 1 }}>
        {upper.map((branch) => (
          <div key={branch.title} sx={{ borderLeft: '2px solid', borderColor: 'divider', pl: 1 }}>
            <CTypography variant="caption" sx={{ fontWeight: 700 }}>{branch.title}</CTypography>
            {branch.causes.map((cause) => (
              <CTypography key={cause} variant="caption" muted sx={{ display: 'block' }}>
                {cause}
              </CTypography>
            ))}
          </div>
        ))}
      </div>

          <div style={{ position: 'relative', height: 32 }}>
            <div style={{ position: 'absolute', inset: '50% 0 auto 0', borderTop: '2px solid', borderColor: 'primary.main' }} />
            <div sx={{
            position: 'absolute',
            right: 0,
            top: 'calc(50% - 12px)',
            px: 1,
            py: 0.25,
            borderRadius: 1,
            background: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <CTypography variant="caption" sx={{ fontWeight: 700 }}>{effect}</CTypography>
        </div>
      </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(lower.length, 1)}, minmax(0, 1fr))`, gap: 1 }}>
        {lower.map((branch) => (
          <div key={branch.title} sx={{ borderLeft: '2px solid', borderColor: 'divider', pl: 1 }}>
            <CTypography variant="caption" sx={{ fontWeight: 700 }}>{branch.title}</CTypography>
            {branch.causes.map((cause) => (
              <CTypography key={cause} variant="caption" muted sx={{ display: 'block' }}>
                {cause}
              </CTypography>
            ))}
          </div>
        ))}
      </div>
    </CStack>
  );
};
