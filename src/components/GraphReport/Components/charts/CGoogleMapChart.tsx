import { CTypography } from '../../../Atoms';

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
      <div>
        <CTypography variant="body2" muted>
          Google Map requires `embedUrl` or (`apiKey` + `query`).
        </CTypography>
      </div>
    );
  }

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
        If iframe is blocked, open directly: <a href={resolvedUrl} target="_blank" rel="noreferrer">Google Maps</a>
      </CTypography>
    </div>
  );
};
