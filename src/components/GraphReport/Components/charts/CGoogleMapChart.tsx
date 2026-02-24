import { Box, Link, Typography } from '@mui/material';
import { buildGoogleMapEmbedUrl } from '../embed-GMAP';

export interface CGoogleMapChartProps {
  apiKey?: string;
  query?: string;
  embedUrl?: string;
  zoom?: number;
  mapType?: 'roadmap' | 'satellite';
  height?: number;
}

export const CGoogleMapChart = ({
  apiKey,
  query,
  embedUrl,
  zoom = 14,
  mapType = 'roadmap',
  height = 320,
}: CGoogleMapChartProps) => {
  const resolvedUrl =
    embedUrl ||
    (apiKey && query
      ? buildGoogleMapEmbedUrl({
          apiKey,
          query,
          zoom,
          mapType,
        })
      : '');

  if (!resolvedUrl) {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary">
          Google Map requires `embedUrl` or (`apiKey` + `query`).
        </Typography>
      </Box>
    );
  }

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
        If iframe is blocked, open directly: <Link href={resolvedUrl} target="_blank" rel="noreferrer">Google Maps</Link>
      </Typography>
    </Box>
  );
};
