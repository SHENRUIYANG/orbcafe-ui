import { createReadStream, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Server-side bridge to the repo's theme generator (bin/lib/theme-core.mjs).
 *
 * The examples app runs with cwd = examples/, so the repo root is one level up.
 * The import is intentionally runtime-dynamic with webpackIgnore: theme-core is
 * plain Node ESM (fs-based) and must not be bundled into the route chunk.
 */

export interface BrandThemeInfo {
  slug: string;
  title: string;
  updatedAt: string;
  dir: string;
}

interface ThemeCore {
  findOpenDesignRoots: () => string[];
  listPresets: (roots: string[]) => BrandThemeInfo[];
  buildTheme: (
    presetDir: string,
    opts?: { brand?: string; tsImportFrom?: string; full?: boolean },
  ) => { css: string };
}

const THEME_CORE_PATH = resolve(process.cwd(), '..', 'bin', 'lib', 'theme-core.mjs');

let corePromise: Promise<ThemeCore> | null = null;

const loadCore = (): Promise<ThemeCore> => {
  corePromise ??= import(/* webpackIgnore: true */ pathToFileURL(THEME_CORE_PATH).href) as Promise<ThemeCore>;
  return corePromise;
};

export const listBrandThemes = async (): Promise<BrandThemeInfo[]> => {
  try {
    const core = await loadCore();
    return core.listPresets(core.findOpenDesignRoots());
  } catch {
    return [];
  }
};

export const findBrandTheme = async (slug: string): Promise<BrandThemeInfo | null> => {
  if (!/^[\w-]+$/.test(slug)) return null;
  const themes = await listBrandThemes();
  return themes.find((t) => t.slug === slug) ?? null;
};

export const buildBrandThemeCss = async (theme: BrandThemeInfo): Promise<string> => {
  const core = await loadCore();
  // brand = slug keeps generated font urls at ./<slug>/fonts/*, served by the
  // sibling fonts route below.
  return core.buildTheme(theme.dir, { brand: theme.slug }).css;
};

const FONT_MIME: Record<string, string> = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

/** Resolve a font file inside the preset's fonts dir, or null when invalid/missing. */
export const resolveBrandThemeFont = (theme: BrandThemeInfo, file: string) => {
  if (!/^[\w.-]+\.(woff2?|ttf|otf)$/i.test(file)) return null;
  const fontsDir = join(theme.dir, 'fonts');
  const filePath = resolve(fontsDir, file);
  if (!filePath.startsWith(resolve(fontsDir) + '/') || !existsSync(filePath)) return null;
  const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
  return { stream: createReadStream(filePath), mime: FONT_MIME[ext] ?? 'application/octet-stream' };
};
