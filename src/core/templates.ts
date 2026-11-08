import type { ColorScheme, TemplateId } from './types.ts'

/**
 * Template metadata. Pure data — also imported by the Vite plugin, so the
 * right fonts and theme-color end up in the static HTML (no font flash).
 * Colors and layout live in `src/styles/templates/*.css`.
 */
export interface TemplateDef {
  label: string
  description: string
  /** Google Fonts `family=` query (without the leading `family=`). */
  fonts: string[]
  defaultScheme: ColorScheme
  themeColor: Record<ColorScheme, string>
}

export const templates: Record<TemplateId, TemplateDef> = {
  developer: {
    label: 'Terminal Noir',
    description: 'Dark, technical, monospace accents, live GitHub data and an interactive terminal.',
    fonts: ['Geist:wght@300..800', 'Geist+Mono:wght@400..600'],
    defaultScheme: 'dark',
    themeColor: { dark: '#09090b', light: '#f7f7f4' },
  },
  designer: {
    label: 'Studio',
    description: 'Editorial typography, generative artwork covers, bento grid and marquee.',
    fonts: ['Instrument+Serif:ital@0;1', 'Inter+Tight:wght@300..800'],
    defaultScheme: 'light',
    themeColor: { dark: '#141210', light: '#f4efe6' },
  },
  photographer: {
    label: 'Darkroom',
    description: 'Full-bleed imagery, Ken Burns hero, masonry gallery with keyboard lightbox.',
    fonts: ['Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700', 'Manrope:wght@300..700'],
    defaultScheme: 'dark',
    themeColor: { dark: '#060606', light: '#f2f0ec' },
  },
  minimal: {
    label: 'Paper',
    description: 'Text-first, résumé-like and print-ready. Fast, quiet, elegant.',
    fonts: ['Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700', 'Inter:wght@400..700'],
    defaultScheme: 'light',
    themeColor: { dark: '#121212', light: '#fbfaf7' },
  },
}

export function fontHref(fonts: string[]): string {
  return `https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${f}`).join('&')}&display=swap`
}
