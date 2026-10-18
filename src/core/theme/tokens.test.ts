import fs from 'fs'
import path from 'path'

import { themeColors } from './palette'
import { semanticColors } from './tokens'

/** global.css değişken adı → semanticColors anahtarı */
const CSS_TO_TOKEN: Record<string, keyof typeof semanticColors.light> = {
  bg: 'bg',
  surface: 'surface',
  border: 'border',
  'border-strong': 'borderStrong',
  text: 'text',
  'text-muted': 'textMuted',
  primary: 'primary',
  'on-primary': 'onPrimary',
  'primary-text': 'primaryText',
  accent: 'accent',
  'on-accent': 'onAccent',
  'on-accent-muted': 'onAccentMuted',
  'accent-line': 'accentLine',
  'accent-soft': 'accentSoft',
  'on-accent-soft': 'onAccentSoft',
  link: 'link',
  danger: 'danger',
  'danger-soft': 'dangerSoft',
  'on-danger-soft': 'onDangerSoft',
  'danger-fill': 'dangerFill',
  'on-danger': 'onDanger',
  focus: 'focus',
}

function hexToTriple(hex: string): string {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ')
}

function readBlock(css: string, selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`)
  const end = css.indexOf('}', start)
  const block = css.slice(start, end)
  const out: Record<string, string> = {}
  for (const m of block.matchAll(/--color-([a-z-]+):\s*([\d\s]+);/g)) {
    const name = m[1]
    const value = m[2]
    if (name && value) out[name] = value.trim().replace(/\s+/g, ' ')
  }
  return out
}

describe('theme tokens', () => {
  const css = fs.readFileSync(path.join(__dirname, '../../../global.css'), 'utf8')

  it.each([
    ['light', ':root'],
    ['dark', '.dark:root'],
  ] as const)('global.css %s değişkenleri tokens.ts ile birebir aynı', (scheme, selector) => {
    const vars = readBlock(css, selector)
    for (const [cssName, token] of Object.entries(CSS_TO_TOKEN)) {
      expect({ cssName, value: vars[cssName] }).toEqual({
        cssName,
        value: hexToTriple(semanticColors[scheme][token]),
      })
    }
  })

  it('legacy palette names point to v2 semantic colors', () => {
    expect(themeColors.light.brand).toBe(semanticColors.light.primary)
    expect(themeColors.dark.contentPrimary).toBe(semanticColors.dark.text)
    expect(themeColors.light.error).toBe(semanticColors.light.danger)
  })
})
