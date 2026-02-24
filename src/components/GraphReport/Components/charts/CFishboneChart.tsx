import { Box, Stack, Typography } from '@mui/material';
import type { GraphFishboneBranch } from '../../types';

export interface CFishboneChartProps {
  effect: string;
  branches: GraphFishboneBranch[];
}

export const CFishboneChart = ({ effect, branches }: CFishboneChartProps) => {
  if (branches.length === 0) {
    return <Typography variant="body2" color="text.secondary">No data</Typography>;
  }

  const upper = branches.filter((_, i) => i % 2 === 0);
  const lower = branches.filter((_, i) => i % 2 === 1);

  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(upper.length, 1)}, minmax(0, 1fr))`, gap: 1 }}>
        {upper.map((branch) => (
          <Box key={branch.title} sx={{ borderLeft: '2px solid', borderColor: 'divider', pl: 1 }}>
            <Typography variant="caption" fontWeight={700}>{branch.title}</Typography>
            {branch.causes.map((cause) => (
              <Typography key={cause} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {cause}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>

      <Box sx={{ position: 'relative', height: 32 }}>
        <Box sx={{ position: 'absolute', inset: '50% 0 auto 0', borderTop: '2px solid', borderColor: 'primary.main' }} />
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 'calc(50% - 12px)',
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Typography variant="caption" fontWeight={700}>{effect}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(lower.length, 1)}, minmax(0, 1fr))`, gap: 1 }}>
        {lower.map((branch) => (
          <Box key={branch.title} sx={{ borderLeft: '2px solid', borderColor: 'divider', pl: 1 }}>
            <Typography variant="caption" fontWeight={700}>{branch.title}</Typography>
            {branch.causes.map((cause) => (
              <Typography key={cause} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {cause}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>
    </Stack>
  );
};
