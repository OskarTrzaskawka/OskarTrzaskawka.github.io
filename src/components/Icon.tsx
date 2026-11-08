import {
  Aperture, BookOpen, Camera, Code2, Coffee, Film, Globe, Heart, Layers, LayoutTemplate, Mail, Mic,
  Music, Palette, PenTool, Rss, Server, Shield, Sparkles, SquareTerminal, Zap, type LucideIcon,
} from 'lucide-react'
import {
  siBehance, siBluesky, siDiscord, siDribbble, siFacebook, siFigma, siGithub, siInstagram, siMastodon,
  siMedium, siPaypal, siVimeo, siX, siYoutube,
} from 'simple-icons'
import type { IconName } from '../core/types'

const LINKEDIN =
  'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z'

const brands: Partial<Record<IconName, string>> = {
  github: siGithub.path,
  x: siX.path,
  discord: siDiscord.path,
  instagram: siInstagram.path,
  dribbble: siDribbble.path,
  behance: siBehance.path,
  youtube: siYoutube.path,
  vimeo: siVimeo.path,
  medium: siMedium.path,
  facebook: siFacebook.path,
  mastodon: siMastodon.path,
  bluesky: siBluesky.path,
  paypal: siPaypal.path,
  figma: siFigma.path,
  linkedin: LINKEDIN,
}

const glyphs: Partial<Record<IconName, LucideIcon>> = {
  mail: Mail, globe: Globe, rss: Rss, code: Code2, camera: Camera, pen: PenTool, music: Music,
  server: Server, layers: Layers, sparkles: Sparkles, zap: Zap, shield: Shield, palette: Palette,
  layout: LayoutTemplate, aperture: Aperture, film: Film, book: BookOpen, mic: Mic, heart: Heart,
  coffee: Coffee, terminal: SquareTerminal,
}

export function Icon({ name, className = 'size-4' }: { name?: IconName; className?: string }) {
  if (!name) return null
  const path = brands[name]
  if (path) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d={path} />
      </svg>
    )
  }
  const Glyph = glyphs[name] ?? Globe
  return <Glyph className={className} aria-hidden="true" />
}
