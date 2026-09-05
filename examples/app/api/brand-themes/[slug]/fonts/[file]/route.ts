import { Readable } from 'node:stream';
import { findBrandTheme, resolveBrandThemeFont } from '../../../core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/brand-themes/<slug>/fonts/<file> — brand font file from the Open Design preset. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; file: string }> },
) {
  const { slug, file } = await params;
  const theme = await findBrandTheme(slug);
  if (!theme) return new Response('unknown preset', { status: 404 });
  const font = resolveBrandThemeFont(theme, file);
  if (!font) return new Response('not found', { status: 404 });
  return new Response(Readable.toWeb(font.stream) as ReadableStream, {
    headers: {
      'Content-Type': font.mime,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
