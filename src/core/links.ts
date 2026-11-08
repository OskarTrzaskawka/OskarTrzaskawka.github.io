import type { LinkPreview, Persona, Project } from './types'

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/**
 * Fills projects that only have a `url` from the build-time link previews:
 * title, summary and cover come from the page's meta tags, and a "Website"
 * link is added. Anything you wrote yourself always wins.
 */
export function resolveLinks(persona: Persona, previews: Record<string, LinkPreview>): Persona {
  return {
    ...persona,
    sections: persona.sections.map((s) =>
      s.type !== 'projects'
        ? s
        : {
            ...s,
            items: s.items.map((item): Project => {
              if (!item.url) return item
              const pv = previews[item.url] ?? {}
              const image = item.image ?? pv.image
              const hasLink = item.links?.some((l) => l.href === item.url)
              return {
                ...item,
                id: item.id ?? host(item.url).replace(/[^a-z0-9]+/gi, '-'),
                title: item.title ?? pv.title ?? host(item.url),
                summary: item.summary ?? pv.description ?? '',
                image,
                // Social images are usually banners with text: show them whole.
                imageFit: item.imageFit ?? (!item.image && image ? 'contain' : undefined),
                links: hasLink ? item.links : [{ label: host(item.url), href: item.url, icon: 'globe' }, ...(item.links ?? [])],
              }
            }),
          },
    ),
  }
}
