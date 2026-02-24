export interface GoogleMapEmbedOptions {
  apiKey: string;
  query: string;
  zoom?: number;
  mapType?: 'roadmap' | 'satellite';
}

export const buildGoogleMapEmbedUrl = ({
  apiKey,
  query,
  zoom = 14,
  mapType = 'roadmap',
}: GoogleMapEmbedOptions): string => {
  const encodedQuery = encodeURIComponent(query);
  return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodedQuery}&zoom=${zoom}&maptype=${mapType}`;
};

export const buildGoogleMapIframe = (options: GoogleMapEmbedOptions, height = 360): string => {
  const url = buildGoogleMapEmbedUrl(options);
  return `<iframe width="100%" height="${height}" style="border:0" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="${url}"></iframe>`;
};
