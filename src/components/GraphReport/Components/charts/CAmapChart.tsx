import { CTypography } from '../../../Atoms';

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
    <div>
      <div
        component="iframe"
        src={resolvedUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sx={{ width: '100%', height, border: 0, borderRadius: 2 }}
      />
      <CTypography variant="caption" muted sx={{ mt: 0.75, display: 'block' }}>
        If iframe is blocked, open directly: <a href={resolvedUrl} target="_blank" rel="noreferrer">AMap</a>
      </CTypography>
    </div>
  );
};
