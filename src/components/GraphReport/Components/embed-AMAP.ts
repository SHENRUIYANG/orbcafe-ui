export interface AmapEmbedOptions {
  keyword?: string;
  location?: { lng: number; lat: number; name?: string };
  src?: string;
}

export const buildAmapEmbedUrl = ({
  keyword,
  location,
  src = 'orbcafe-ui',
}: AmapEmbedOptions): string => {
  if (location) {
    const name = encodeURIComponent(location.name || keyword || 'Location');
    return `https://uri.amap.com/marker?position=${location.lng},${location.lat}&name=${name}&src=${encodeURIComponent(src)}&coordinate=gaode&callnative=0`;
  }

  if (keyword) {
    return `https://uri.amap.com/search?keyword=${encodeURIComponent(keyword)}&src=${encodeURIComponent(src)}&callnative=0`;
  }

  return 'https://uri.amap.com/search?keyword=%E5%8C%97%E4%BA%AC&src=orbcafe-ui&callnative=0';
};
