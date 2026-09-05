import { listBrandThemes } from './core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/brand-themes — brand presets discovered in the local Open Design app. */
export async function GET() {
  const themes = await listBrandThemes();
  return Response.json({
    ok: true,
    openDesign: themes.length > 0,
    presets: themes.map(({ slug, title, updatedAt }) => ({ slug, title, updatedAt })),
  });
}
