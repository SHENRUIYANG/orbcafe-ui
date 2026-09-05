#!/usr/bin/env node
/**
 * build-theme.mjs — repo-internal wrapper around bin/lib/theme-core.mjs.
 *
 * Regenerates the example theme packs shipped in src/styles/themes/ from an
 * Open Design preset directory. Consumers should use `npx orbcafe-theme`
 * instead — it discovers presets automatically and writes into THEIR project.
 *
 * Usage:
 *   node scripts/build-theme.mjs --preset "<path to design-system dir>" [--name <slug>]
 */

import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateTheme } from '../bin/lib/theme-core.mjs'

const REPO_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')

const args = process.argv.slice(2)
const arg = (name) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? undefined : args[i + 1]
}
const presetArg = arg('preset')
if (!presetArg) {
  console.error('Usage: node scripts/build-theme.mjs --preset <design-system dir> [--name <slug>]')
  process.exit(1)
}
const presetDir = resolve(presetArg)
const brand = arg('name') ?? presetDir.split('/').filter(Boolean).pop()

const result = generateTheme(presetDir, {
  brand,
  outDir: join(REPO_ROOT, 'src/styles/themes'),
  tokensTsPath: join(REPO_ROOT, 'src/config', `orbis-tokens.${brand}.ts`),
  tsImportFrom: './orbis-tokens',
  full: true, // repo example packs map radius too
})

console.log(`✓ ${result.cssPath}`)
console.log(`✓ ${result.mjsPath}`)
console.log(`✓ ${result.tsPath}`)
if (result.fonts.length) console.log(`✓ ${result.fonts.length} font file(s) → ${join(REPO_ROOT, 'src/styles/themes', brand, 'fonts')}`)
if (result.warning) console.warn(`⚠ ${result.warning}`)
