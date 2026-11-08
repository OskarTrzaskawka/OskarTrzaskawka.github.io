import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { LinkPreview, Persona } from '../src/core/types.ts'

/**
 * Build-time link previews: for every project with a `url`, read the page's
 * <title>, meta description and og:image, and download the image so the site
 * never hotlinks. Results are cached in node_modules/.cache for a day.
 */

const TTL = 24 * 60 * 60 * 1000
const UA = 'Mozilla/5.0 (compatible; PersonaFolio/1.0; +https://github.com/OskarTrzaskawka/persona-folio)'
const IMAGE_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
}

export interface PreviewResult {
  /** url → preview (image is a root-relative path to a file in `files`). */
  previews: Record<string, LinkPreview>
  /** file name → absolute path in the cache. */
  files: Record<string, string>
}

const decode = (s: string) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

/** Reads `<meta property|name="key" content="…">` in either attribute order. */
function meta(html: string, key: string): string | undefined {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const name = /\b(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]
    if (name?.toLowerCase() !== key) continue
    const content = /\bcontent\s*=\s*"([^"]*)"|\bcontent\s*=\s*'([^']*)'/i.exec(tag)
    const v = content?.[1] ?? content?.[2]
    if (v?.trim()) return decode(v)
  }
}

/** "Muzes | Discord Music Bot" → "Muzes". Site name wins when the page sets one. */
function shortTitle(html: string): string | undefined {
  const site = meta(html, 'og:site_name')
  if (site) return site
  const full = meta(html, 'og:title') ?? meta(html, 'twitter:title') ?? decode(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] ?? '')
  return full ? full.split(/\s+[|—–·:]\s+|\s+-\s+/)[0].trim() : undefined
}

export const slug = (url: string) =>
  url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

async function fetchPreview(url: string, cacheDir: string): Promise<{ preview: LinkPreview; file?: string }> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  const html = await res.text()
  const preview: LinkPreview = {
    title: shortTitle(html),
    description: meta(html, 'description') ?? meta(html, 'og:description') ?? meta(html, 'twitter:description'),
  }
  const raw = meta(html, 'og:image') ?? meta(html, 'og:image:url') ?? meta(html, 'twitter:image')
  if (!raw) return { preview }

  const imageUrl = new URL(raw, res.url).href
  const img = await fetch(imageUrl, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15_000) })
  const ext = IMAGE_EXT[img.headers.get('content-type')?.split(';')[0].trim() ?? '']
  if (!img.ok || !ext) return { preview }
  const file = `${slug(url)}.${ext}`
  writeFileSync(join(cacheDir, file), Buffer.from(await img.arrayBuffer()))
  return { preview: { ...preview, image: `/og/${file}` }, file }
}

export async function loadLinkPreviews(persona: Persona, root: string): Promise<PreviewResult> {
  const urls = [
    ...new Set(persona.sections.flatMap((s) => (s.type === 'projects' ? s.items.map((i) => i.url).filter((u): u is string => !!u) : []))),
  ]
  const result: PreviewResult = { previews: {}, files: {} }
  if (!urls.length) return result

  const cacheDir = join(root, 'node_modules/.cache/persona-folio/og')
  const indexFile = join(cacheDir, 'index.json')
  mkdirSync(cacheDir, { recursive: true })
  let index: Record<string, { at: number; preview: LinkPreview; file?: string }> = {}
  try {
    index = JSON.parse(readFileSync(indexFile, 'utf8'))
  } catch {
    /* first run */
  }

  await Promise.all(
    urls.map(async (url) => {
      const hit = index[url]
      const fresh = hit && Date.now() - hit.at < TTL && (!hit.file || existsSync(join(cacheDir, hit.file)))
      if (!fresh) {
        try {
          index[url] = { at: Date.now(), ...(await fetchPreview(url, cacheDir)) }
        } catch (e) {
          console.warn(`[persona-folio] link preview for ${url} failed (${(e as Error).message})${hit ? ' — using cached copy' : ''}.`)
          if (!hit) return
        }
      }
      const entry = index[url]
      result.previews[url] = entry.preview
      if (entry.file) result.files[entry.file] = join(cacheDir, entry.file)
    }),
  )
  writeFileSync(indexFile, JSON.stringify(index, null, 2))
  return result
}
