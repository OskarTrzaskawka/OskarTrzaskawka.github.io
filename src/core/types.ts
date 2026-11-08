/**
 * Persona schema — the single source of truth for a portfolio.
 *
 * A persona is pure data: no JSX, no imports of assets. That keeps it
 * readable by non-coders and lets the Vite plugin read it at build time
 * to generate SEO tags, sitemap, robots.txt and the web manifest.
 */

/** Plain text. Kept as an alias so the schema reads clearly. */
export type Text = string

export type TemplateId = 'developer' | 'designer' | 'photographer' | 'minimal'

export type ColorScheme = 'dark' | 'light'

/** Icon names resolved by `src/components/Icon.tsx`. */
export type IconName =
  | 'github' | 'linkedin' | 'x' | 'discord' | 'instagram' | 'dribbble' | 'behance'
  | 'youtube' | 'mail' | 'globe' | 'facebook' | 'mastodon' | 'bluesky' | 'rss'
  | 'paypal' | 'figma' | 'vimeo' | 'medium' | 'code' | 'camera' | 'pen' | 'music'
  | 'server' | 'layers' | 'sparkles' | 'zap' | 'shield' | 'palette' | 'layout'
  | 'aperture' | 'film' | 'book' | 'mic' | 'heart' | 'coffee' | 'terminal'

export interface Link {
  label: Text
  href: string
  icon?: IconName
  /** Shown next to the label, e.g. "@oskar". */
  handle?: string
}

export interface Cta {
  label: Text
  href: string
  variant?: 'primary' | 'ghost'
  icon?: IconName
}

export interface Fact {
  label: Text
  value: Text
}

export interface Project {
  id: string
  title: Text
  summary: Text
  /** Longer case-study copy shown in the project dialog. Paragraphs. */
  body?: Text[]
  year?: string
  role?: Text
  tags?: string[]
  /** Used by the filter chips. Defaults to the first tag. */
  category?: string
  image?: string
  logo?: string
  /** Generative cover when no image is provided — a seed + palette. */
  art?: { seed: number; palette?: string[] }
  links?: Link[]
  featured?: boolean
  metrics?: Fact[]
  status?: Text
}

export interface GalleryItem {
  src: string
  alt: Text
  width: number
  height: number
  caption?: Text
  category?: string
  exif?: string
}

/* -------------------------------------------------------------------------- */
/*                                  Sections                                  */
/* -------------------------------------------------------------------------- */

interface SectionBase {
  /** Anchor id. Defaults to the section type. */
  id?: string
  /** Label used in the nav and command palette. Defaults to `title`. */
  nav?: Text | false
  eyebrow?: Text
  title: Text
  intro?: Text
}

export interface AboutSection extends SectionBase {
  type: 'about'
  body: Text[]
  facts?: Fact[]
  image?: string
}

export interface ProjectsSection extends SectionBase {
  type: 'projects'
  layout?: 'cards' | 'bento' | 'list' | 'spotlight'
  filters?: boolean
  items: Project[]
}

export interface GithubSection extends SectionBase {
  type: 'github'
  username: string
  /** Max repositories to list. */
  limit?: number
  contributions?: boolean
  languages?: boolean
  /** Repos to hide (forks are always hidden). */
  exclude?: string[]
}

export interface SkillsSection extends SectionBase {
  type: 'skills'
  variant?: 'meters' | 'tags' | 'columns'
  note?: Text
  groups: { name: Text; items: { name: string; level?: number; note?: Text }[] }[]
}

export interface ExperienceSection extends SectionBase {
  type: 'experience'
  items: {
    role: Text
    org: string
    href?: string
    period: Text
    place?: Text
    summary: Text
    tags?: string[]
  }[]
}

export interface GallerySection extends SectionBase {
  type: 'gallery'
  layout?: 'masonry' | 'grid'
  filters?: boolean
  items: GalleryItem[]
}

export interface ServicesSection extends SectionBase {
  type: 'services'
  items: { icon?: IconName; title: Text; text: Text; price?: Text; bullets?: Text[] }[]
}

export interface ProcessSection extends SectionBase {
  type: 'process'
  steps: { title: Text; text: Text }[]
}

export interface TestimonialsSection extends SectionBase {
  type: 'testimonials'
  items: { quote: Text; name: string; role: Text; avatar?: string }[]
}

export interface StatsSection extends SectionBase {
  type: 'stats'
  items: { value: number; suffix?: string; prefix?: string; label: Text }[]
}

export interface TerminalSection extends SectionBase {
  type: 'terminal'
  /** Shell prompt, e.g. "jane@portfolio". */
  prompt: string
  /** Extra commands. Built-ins: help, whoami, projects, skills, socials, contact, clear, theme, date. */
  commands?: Record<string, Text | Text[]>
}

export interface MarqueeSection extends SectionBase {
  type: 'marquee'
  items: Text[]
}

export interface WritingSection extends SectionBase {
  type: 'writing'
  posts: { title: Text; date: string; href: string; excerpt?: Text; readTime?: number; tag?: string }[]
}

export interface ContactSection extends SectionBase {
  type: 'contact'
  text: Text
  /** Rotating words appended to the headline. */
  rotating?: Text[]
  form?: boolean
}

export type Section =
  | AboutSection
  | ProjectsSection
  | GithubSection
  | SkillsSection
  | ExperienceSection
  | GallerySection
  | ServicesSection
  | ProcessSection
  | TestimonialsSection
  | StatsSection
  | TerminalSection
  | MarqueeSection
  | WritingSection
  | ContactSection

export type SectionType = Section['type']

/* -------------------------------------------------------------------------- */
/*                                   Persona                                  */
/* -------------------------------------------------------------------------- */

export interface Persona {
  /** Must match the file name in `src/personas`. */
  id: string
  /** Visual template. Each persona can pick any template. */
  template: TemplateId
  /** Short label used by the showcase switcher. */
  label: string
  defaultScheme?: ColorScheme | 'system'
  /** Override template tokens. Any CSS color works (oklch, hex, …). */
  theme?: { accent?: string; accent2?: string }

  meta: {
    title: Text
    description: Text
    keywords?: string[]
    /** Absolute or root-relative path. */
    ogImage?: string
    /** Public site URL, used for canonical/sitemap. Overridden by VITE_SITE_URL. */
    url?: string
  }

  person: {
    name: string
    /** Used in the nav. Defaults to `name`. */
    shortName?: string
    role: Text
    location?: Text
    /** IANA time zone — shows a live local clock in the hero. */
    timeZone?: string
    avatar?: string
    email?: string
    availability?: { status: 'open' | 'limited' | 'closed'; label: Text }
    resume?: string
  }

  socials: Link[]

  hero: {
    eyebrow?: Text
    /** Wrap words in *asterisks* to highlight them. Use \n for line breaks. */
    title: Text
    subtitle: Text
    /** Words cycled after the title (developer / designer heroes). */
    rotating?: Text[]
    ctas?: Cta[]
    /** Photographer hero slideshow or designer feature image. */
    images?: string[]
  }

  sections: Section[]

  footer?: { note?: Text }
}
