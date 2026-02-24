import { Box, Link, Typography } from '@mui/material';
import type { GraphMapLocation } from '../../types';
import { buildAmapEmbedUrl } from '../embed-AMAP';

export interface CAmapChartProps {
  keyword?: string;
  location?: GraphMapLocation;
  embedUrl?: string;
  height?: number;
}

export const CAmapChart = ({
  keyword,
  location,
  embedUrl,
  height = 320,
}: CAmapChartProps) => {
  const resolvedUrl =
    embedUrl ||
    buildAmapEmbedUrl({
      keyword,
      location: location ? { lng: location.lng, lat: location.lat, name: location.name } : undefined,
    });

  return (
    <Box>
      <Box
        component="iframe"
        src={resolvedUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sx={{ width: '100%', height, border: 0, borderRadius: 2 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
        If iframe is blocked, open directly: <Link href={resolvedUrl} target="_blank" rel="noreferrer">AMap</Link>
      </Typography>
    </Box>
  );
};
