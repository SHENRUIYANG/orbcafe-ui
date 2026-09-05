#!/usr/bin/env node
/**
 * orbcafe-theme — bridge ORBCAFE UI to local Open Design brand presets.
 *
 * Developers WITHOUT Open Design: the default ORBIS theme shipped in
 * orbcafe-ui/styles.css is active. Built-in theme packs are also available at
 * orbcafe-ui/themes/orbis.css and orbcafe-ui/themes/nvidia.css.
 *
 * Developers WITH Open Design: apply any brand preset (colors + fonts)
 * straight from the app's local data — no export step:
 *
 *   npx orbcafe-theme                 # status: Open Design found? presets?
 *   npx orbcafe-theme list [--json]   # list discovered brand presets
 *   npx orbcafe-theme show <slug>     # preview the token overrides
 *   npx orbcafe-theme apply [slug] [--out ./orbcafe-theme] [--full] [--json]
 *
 * apply writes <out>/<brand>.css (+ fonts + JS tokens) into your project.
 * Wire it up once, AFTER the base styles:
 *   import 'orbcafe-ui/styles.css'
 *   import './orbcafe-theme/<brand>.css'
 *
 * --full also maps borderRadius → --orb-r (default maps colors + fonts only).
 * --preset <dir> bypasses Open Design discovery and reads a preset directly.
 */

import { createInterface } from 'node:readline/promises'
import { basename, relative, resolve } from 'node:path'
import { findOpenDesignRoots, listPresets, buildTheme, generateTheme } from './lib/theme-core.mjs'

const argv = process.argv.slice(2)
const command = argv.find((a) => !a.startsWith('-') && ['status', 'list', 'show', 'apply'].includes(a)) ?? 'status'
const positional = argv.filter((a) => !a.startsWith('-') && a !== command)
const flag = (name) => argv.includes(`--${name}`)
const option = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i === -1 ? undefined : argv[i + 1]
}
const asJson = flag('json')

const fail = (message, code = 1) => {
  if (asJson) {
    console.log(JSON.stringify({ ok: false, error: message }))
  } else {
    console.error(`✗ ${message}`)
  }
  process.exit(code)
}

const NO_OD_MESSAGE =
  'Open Design not found on this machine — the default ORBIS theme from orbcafe-ui/styles.css is active. ' +
  'Install Open Design and create a brand design system to unlock one-command brand theming.'

/** Resolve which preset to use: --preset dir, explicit slug, single preset, or ask. */
const resolvePreset = async (slug) => {
  const presetDir = option('preset')
  if (presetDir) {
    const dir = resolve(presetDir)
    return { slug: option('name') ?? basename(dir), dir }
  }
  const roots = findOpenDesignRoots()
  if (!roots.length) fail(NO_OD_MESSAGE)
  const presets = listPresets(roots)
  if (!presets.length) fail(`Open Design found (${roots[0]}) but no design systems yet. Create one in Open Design first.`)
  if (slug) {
    const hit = presets.find((p) => p.slug === slug)
    if (!hit) fail(`No preset named "${slug}". Available: ${presets.map((p) => p.slug).join(', ')}`)
    return hit
  }
  if (presets.length === 1) return presets[0]
  if (!process.stdout.isTTY) {
    fail(`Multiple presets found; pick one: ${presets.map((p) => p.slug).join(', ')}`)
  }
  console.log('Multiple brand presets found:')
  presets.forEach((p, i) => console.log(`  ${i + 1}) ${p.title}  (${p.slug})`))
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(`Apply which? [1-${presets.length}]: `)
  rl.close()
  const idx = Number(answer.trim()) - 1
  if (!presets[idx]) fail('Aborted.')
  return presets[idx]
}

switch (command) {
  case 'status': {
    const roots = findOpenDesignRoots()
    const presets = roots.length ? listPresets(roots) : []
    if (asJson) {
      console.log(JSON.stringify({ ok: true, openDesignRoots: roots, presets }, null, 2))
      break
    }
    if (!roots.length) {
      console.log(NO_OD_MESSAGE)
      break
    }
    console.log(`Open Design: ${roots.join(', ')}`)
    console.log(`Brand presets: ${presets.length}`)
    for (const p of presets) console.log(`  • ${p.title}  (${p.slug})${p.updatedAt ? `  — updated ${p.updatedAt}` : ''}`)
    console.log('\nApply one with:  npx orbcafe-theme apply <slug>')
    break
  }

  case 'list': {
    const roots = findOpenDesignRoots()
    if (!roots.length) fail(NO_OD_MESSAGE)
    const presets = listPresets(roots)
    if (asJson) {
      console.log(JSON.stringify({ ok: true, presets }, null, 2))
    } else {
      if (!presets.length) console.log('No design systems found. Create one in Open Design first.')
      for (const p of presets) console.log(`${p.slug}\t${p.title}${p.updatedAt ? `\t${p.updatedAt}` : ''}`)
    }
    break
  }

  case 'show': {
    const preset = await resolvePreset(positional[0])
    const built = buildTheme(preset.dir, { brand: preset.slug, full: flag('full') })
    if (asJson) {
      console.log(JSON.stringify({ ok: true, brand: preset.slug, warning: built.warning, css: built.css }, null, 2))
    } else {
      console.log(built.css)
      if (built.warning) console.warn(`⚠ ${built.warning}`)
    }
    break
  }

  case 'apply': {
    const preset = await resolvePreset(positional[0])
    const outDir = resolve(option('out') ?? './orbcafe-theme')
    const result = generateTheme(preset.dir, {
      brand: preset.slug,
      outDir,
      tsImportFrom: 'orbcafe-ui',
      full: flag('full'),
    })
    const relCss = './' + relative(process.cwd(), result.cssPath)
    const importLine = `import '${relCss}' // after: import 'orbcafe-ui/styles.css'`
    if (asJson) {
      console.log(
        JSON.stringify(
          {
            ok: true,
            brand: result.brand,
            cssPath: result.cssPath,
            tokensMjsPath: result.mjsPath,
            tokensTsPath: result.tsPath,
            fonts: result.fonts,
            warning: result.warning,
            importLine,
          },
          null,
          2
        )
      )
      break
    }
    console.log(`✓ ${result.cssPath}`)
    console.log(`✓ ${result.mjsPath}`)
    console.log(`✓ ${result.tsPath}`)
    if (result.fonts.length) console.log(`✓ ${result.fonts.length} font file(s) → ${resolve(outDir, result.brand, 'fonts')}`)
    if (result.warning) console.warn(`⚠ ${result.warning}`)
    console.log('\nWire it up once, AFTER the base styles:')
    console.log(`  import 'orbcafe-ui/styles.css'`)
    console.log(`  import '${relCss}'`)
    console.log('\nJS tokens for charts/canvas:')
    console.log(`  import ORB_TOKENS from './${relative(process.cwd(), result.mjsPath)}'`)
    break
  }
}
