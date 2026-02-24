import { useMemo } from 'react';
import type { GraphMapLocation } from '../types';
import { buildAmapEmbedUrl } from '../Components/embed-AMAP';
import { buildGoogleMapEmbedUrl } from '../Components/embed-GMAP';

export interface UseGoogleMapEmbedUrlOptions {
  apiKey?: string;
  query?: string;
  zoom?: number;
  mapType?: 'roadmap' | 'satellite';
}

export const useGoogleMapEmbedUrl = ({
  apiKey,
  query,
  zoom = 14,
  mapType = 'roadmap',
}: UseGoogleMapEmbedUrlOptions): string =>
  useMemo(() => {
    if (!apiKey || !query) return '';
    return buildGoogleMapEmbedUrl({ apiKey, query, zoom, mapType });
  }, [apiKey, query, zoom, mapType]);

export interface UseAmapEmbedUrlOptions {
  keyword?: string;
  location?: GraphMapLocation;
}

export const useAmapEmbedUrl = ({ keyword, location }: UseAmapEmbedUrlOptions): string =>
  useMemo(
    () =>
      buildAmapEmbedUrl({
        keyword,
        location: location ? { lng: location.lng, lat: location.lat, name: location.name } : undefined,
      }),
    [keyword, location],
  );
