import { buildBrandThemeCss, findBrandTheme } from '../core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/brand-themes/<slug> — theme pack CSS generated live from the local
 * Open Design preset. Font urls inside point at ./<slug>/fonts/* (sibling route).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const theme = await findBrandTheme(slug);
  if (!theme) return Response.json({ ok: false, error: `unknown preset: ${slug}` }, { status: 404 });
  const css = await buildBrandThemeCss(theme);
  return new Response(css, {
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      // always re-read on reload so Open Design edits show up immediately
      'Cache-Control': 'no-cache',
    },
  });
}
