import type { ColorScheme, IconName, Link, Persona, TemplateId } from './types.ts'

/**
 * Everything configurable from `.env`. Pure function: used by the browser
 * (import.meta.env) AND by the Vite plugin (loadEnv) so the static HTML,
 * sitemap and manifest match what the page renders.
 */
export type Env = Record<string, string | undefined>

const TEMPLATES: TemplateId[] = ['developer', 'designer', 'photographer', 'minimal']

const SOCIAL_ENV: [key: string, label: string, icon: IconName][] = [
  ['VITE_LINKEDIN_URL', 'LinkedIn', 'linkedin'],
  ['VITE_X_URL', 'X', 'x'],
  ['VITE_BLUESKY_URL', 'Bluesky', 'bluesky'],
  ['VITE_MASTODON_URL', 'Mastodon', 'mastodon'],
  ['VITE_INSTAGRAM_URL', 'Instagram', 'instagram'],
  ['VITE_DRIBBBLE_URL', 'Dribbble', 'dribbble'],
  ['VITE_BEHANCE_URL', 'Behance', 'behance'],
  ['VITE_YOUTUBE_URL', 'YouTube', 'youtube'],
  ['VITE_VIMEO_URL', 'Vimeo', 'vimeo'],
  ['VITE_DISCORD_URL', 'Discord', 'discord'],
  ['VITE_MEDIUM_URL', 'Medium', 'medium'],
  ['VITE_FACEBOOK_URL', 'Facebook', 'facebook'],
]

const val = (env: Env, key: string) => {
  const v = env[key]?.trim()
  return v ? v : undefined
}

export function flag(env: Env, key: string, fallback = true): boolean {
  const v = val(env, key)
  if (v === undefined) return fallback
  return !['false', '0', 'off', 'no'].includes(v.toLowerCase())
}

export function list(env: Env, key: string): string[] {
  return (val(env, key) ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Apply `.env` overrides to a persona. Unset variables leave the persona untouched. */
export function applyEnv(base: Persona, env: Env): Persona {
  const p: Persona = structuredClone(base)

  const template = val(env, 'VITE_TEMPLATE') as TemplateId | undefined
  if (template && TEMPLATES.includes(template)) p.template = template

  const scheme = val(env, 'VITE_DEFAULT_SCHEME') as ColorScheme | 'system' | undefined
  if (scheme && ['dark', 'light', 'system'].includes(scheme)) p.defaultScheme = scheme

  const accent = val(env, 'VITE_ACCENT_COLOR')
  const accent2 = val(env, 'VITE_ACCENT_COLOR_2')
  if (accent || accent2) p.theme = { ...p.theme, ...(accent && { accent }), ...(accent2 && { accent2 }) }

  // Identity
  const person = p.person
  person.name = val(env, 'VITE_NAME') ?? person.name
  if (val(env, 'VITE_NAME') && !val(env, 'VITE_SHORT_NAME')) person.shortName = undefined
  person.shortName = val(env, 'VITE_SHORT_NAME') ?? person.shortName
  person.role = val(env, 'VITE_ROLE') ?? person.role
  person.location = val(env, 'VITE_LOCATION') ?? person.location
  person.timeZone = val(env, 'VITE_TIMEZONE') ?? person.timeZone
  person.email = val(env, 'VITE_EMAIL') ?? person.email
  person.avatar = val(env, 'VITE_AVATAR_URL') ?? person.avatar
  person.resume = val(env, 'VITE_RESUME_URL') ?? person.resume
  const status = val(env, 'VITE_AVAILABILITY')
  if (status === 'hidden') person.availability = undefined
  else if (status === 'open' || status === 'limited' || status === 'closed') {
    person.availability = { status, label: val(env, 'VITE_AVAILABILITY_LABEL') ?? person.availability?.label ?? status }
  } else if (val(env, 'VITE_AVAILABILITY_LABEL') && person.availability) {
    person.availability.label = val(env, 'VITE_AVAILABILITY_LABEL')!
  }

  // Hero
  p.hero.title = val(env, 'VITE_HERO_TITLE')?.replaceAll('\\n', '\n') ?? p.hero.title
  p.hero.subtitle = val(env, 'VITE_HERO_SUBTITLE') ?? p.hero.subtitle

  // SEO
  p.meta.title = val(env, 'VITE_SITE_TITLE') ?? (val(env, 'VITE_NAME') ? `${person.name} — ${person.role}` : p.meta.title)
  p.meta.description = val(env, 'VITE_SITE_DESCRIPTION') ?? p.meta.description
  p.meta.url = val(env, 'VITE_SITE_URL') ?? p.meta.url
  p.meta.ogImage = val(env, 'VITE_OG_IMAGE') ?? p.meta.ogImage

  // Socials: env URLs replace a link with the same icon, or are appended.
  const upsert = (link: Link) => {
    const i = p.socials.findIndex((s) => s.icon === link.icon)
    if (i >= 0) p.socials[i] = link
    else p.socials.push(link)
  }
  const gh = val(env, 'VITE_GITHUB_USERNAME')
  if (gh) {
    upsert({ label: 'GitHub', href: `https://github.com/${gh}`, icon: 'github', handle: gh })
    for (const s of p.sections) if (s.type === 'github') s.username = gh
  }
  for (const [key, label, icon] of SOCIAL_ENV) {
    const href = val(env, key)
    if (href) upsert({ label, href, icon, handle: href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') })
  }
  if (val(env, 'VITE_EMAIL')) {
    for (const s of p.socials) if (s.icon === 'mail') Object.assign(s, { href: `mailto:${person.email}`, handle: person.email })
  }

  // Sections
  const hidden = list(env, 'VITE_HIDE_SECTIONS')
  if (hidden.length) p.sections = p.sections.filter((s) => !hidden.includes(s.type) && !hidden.includes(s.id ?? ''))
  const order = list(env, 'VITE_SECTION_ORDER')
  if (order.length) {
    const rank = (key: string) => {
      const i = order.indexOf(key)
      return i === -1 ? order.length : i
    }
    p.sections = p.sections.toSorted((a, b) => Math.min(rank(a.type), rank(a.id ?? '')) - Math.min(rank(b.type), rank(b.id ?? '')))
  }
  if (!flag(env, 'VITE_FEATURE_CONTACT_FORM')) for (const s of p.sections) if (s.type === 'contact') s.form = false

  return p
}

/** Feature flags read once at startup. */
export function features(env: Env) {
  return {
    commandPalette: flag(env, 'VITE_FEATURE_COMMAND_PALETTE'),
    themeToggle: flag(env, 'VITE_FEATURE_THEME_TOGGLE'),
    scrollProgress: flag(env, 'VITE_FEATURE_SCROLL_PROGRESS'),
    cursorGlow: flag(env, 'VITE_FEATURE_CURSOR_GLOW'),
    animations: flag(env, 'VITE_FEATURE_ANIMATIONS'),
    localTime: flag(env, 'VITE_FEATURE_LOCAL_TIME'),
    backToTop: flag(env, 'VITE_FEATURE_BACK_TO_TOP'),
    grain: flag(env, 'VITE_FEATURE_GRAIN'),
  }
}
