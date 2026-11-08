import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runnerImport, type Plugin } from 'vite'
import { applyEnv, type Env } from '../src/core/env.ts'
import { fontHref, templates } from '../src/core/templates.ts'
import { loadLinkPreviews, type PreviewResult } from './link-previews.ts'
import type { GithubSection, Persona, PrivateRepo } from '../src/core/types.ts'

const VIRTUAL = 'virtual:active-persona'
const RESOLVED = '\0' + VIRTUAL
const PRIVATE = 'virtual:private-repos'
const PRIVATE_RESOLVED = '\0' + PRIVATE
const PREVIEWS = 'virtual:link-previews'
const PREVIEWS_RESOLVED = '\0' + PREVIEWS

/** Token for private repos: env first, then the local GitHub CLI. Never exposed to the client. */
function githubToken(): string | undefined {
  const t = process.env.GH_PRIVATE_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  if (t) return t
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || undefined
  } catch {
    return undefined
  }
}

/** Lists the user's own private repos and keeps only display-safe fields. */
async function fetchPrivateRepos(username: string, exclude: string[] = []): Promise<PrivateRepo[]> {
  const token = githubToken()
  if (!token) {
    console.warn('[persona-folio] privateRepos: no token (set GH_PRIVATE_TOKEN or run `gh auth login`) — skipping.')
    return []
  }
  try {
    const res = await fetch('https://api.github.com/user/repos?visibility=private&affiliation=owner&per_page=100&sort=pushed', {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    type Raw = PrivateRepo & { private: boolean; fork: boolean; archived: boolean; owner: { login: string } }
    const repos = (await res.json()) as Raw[]
    return repos
      .filter(
        (r) => r.private && !r.fork && !r.archived && r.owner.login.toLowerCase() === username.toLowerCase() && !exclude.includes(r.name),
      )
      .map(({ name, description, language, stargazers_count, forks_count, pushed_at }) => ({
        name,
        description,
        language,
        stargazers_count,
        forks_count,
        pushed_at,
      }))
  } catch (e) {
    console.warn(`[persona-folio] privateRepos: fetch failed (${(e as Error).message}) — skipping.`)
    return []
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Persona Folio build plugin.
 *  - resolves `virtual:active-persona` to `src/personas/<VITE_PERSONA>.ts`
 *  - injects SEO, Open Graph, Twitter, JSON-LD, fonts and a no-flash theme script into index.html
 *  - emits robots.txt, sitemap.xml and manifest.webmanifest
 *  - reads meta tags + og:image for link-only projects (`virtual:link-previews`)
 */
export function persona(env: Env, root: string): Plugin {
  const dir = resolve(root, 'src/personas')
  const available = readdirSync(dir)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => f.slice(0, -3))
  const id = env.VITE_PERSONA?.trim() || 'developer'
  const file = resolve(dir, `${id}.ts`)
  if (!existsSync(file)) {
    throw new Error(
      `\n[persona-folio] VITE_PERSONA="${id}" not found.\n  Available personas: ${available.join(', ')}\n  Create one with: npm run new-persona -- <name> <template>\n`,
    )
  }
  const showcase = env.VITE_SHOWCASE === 'true'
  let p: Persona
  let base = '/'
  let privateRepos: PrivateRepo[] = []
  let links: PreviewResult = { previews: {}, files: {} }

  return {
    name: 'persona-folio',
    enforce: 'pre',

    async configResolved(config) {
      base = config.base
      const { module } = await runnerImport<{ default: Persona }>(file)
      p = applyEnv(module.default, env)
      const gh = p.sections.find((s): s is GithubSection => s.type === 'github' && !!s.privateRepos)
      if (gh && !showcase) privateRepos = await fetchPrivateRepos(gh.username, gh.exclude)
      links = await loadLinkPreviews(p, root)
    },

    resolveId(source) {
      if (source === VIRTUAL) return RESOLVED
      if (source === PRIVATE) return PRIVATE_RESOLVED
      if (source === PREVIEWS) return PREVIEWS_RESOLVED
    },
    load(source) {
      if (source === PRIVATE_RESOLVED) return `export default ${JSON.stringify(privateRepos)}`
      if (source === PREVIEWS_RESOLVED) return `export default ${JSON.stringify(links.previews)}`
      if (source === RESOLVED) return `export { default } from ${JSON.stringify(file.replaceAll('\\', '/'))}`
    },

    transformIndexHtml(html) {
      const t = templates[p.template]
      const siteUrl = p.meta.url?.replace(/\/$/, '')
      const abs = (path?: string) =>
        !path ? undefined : /^https?:/.test(path) ? path : siteUrl ? `${siteUrl}/${path.replace(/^\//, '')}` : path
      const og = abs(p.meta.ogImage)
      const fonts = showcase ? Object.keys(templates) : [p.template]
      const scheme = p.defaultScheme ?? t.defaultScheme

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: p.person.name,
        jobTitle: p.person.role,
        description: p.meta.description,
        ...(p.person.email && { email: `mailto:${p.person.email}` }),
        ...(siteUrl && { url: siteUrl }),
        ...(p.person.avatar && { image: abs(p.person.avatar) }),
        ...(p.person.location && { address: p.person.location }),
        sameAs: p.socials.filter((s) => s.href.startsWith('http')).map((s) => s.href),
        knowsAbout: p.meta.keywords ?? [],
      }

      const head = [
        `<title>${esc(p.meta.title)}</title>`,
        `<meta name="description" content="${esc(p.meta.description)}" />`,
        `<meta name="author" content="${esc(p.person.name)}" />`,
        p.meta.keywords && `<meta name="keywords" content="${esc(p.meta.keywords.join(', '))}" />`,
        `<meta name="theme-color" content="${t.themeColor[scheme === 'light' ? 'light' : 'dark']}" />`,
        siteUrl && `<link rel="canonical" href="${siteUrl}/" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:title" content="${esc(p.meta.title)}" />`,
        `<meta property="og:description" content="${esc(p.meta.description)}" />`,
        siteUrl && `<meta property="og:url" content="${siteUrl}/" />`,
        og && `<meta property="og:image" content="${esc(og)}" />`,
        `<meta name="twitter:card" content="${og ? 'summary_large_image' : 'summary'}" />`,
        `<meta name="twitter:title" content="${esc(p.meta.title)}" />`,
        `<meta name="twitter:description" content="${esc(p.meta.description)}" />`,
        og && `<meta name="twitter:image" content="${esc(og)}" />`,
        `<link rel="manifest" href="${base}manifest.webmanifest" />`,
        `<link rel="preconnect" href="https://fonts.googleapis.com" />`,
        `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`,
        ...fonts.map(
          (k) => `<link rel="stylesheet" data-template-font="${k}" href="${fontHref(templates[k as keyof typeof templates].fonts)}" />`,
        ),
        `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
        // Apply template + scheme before first paint — no flash of the wrong theme.
        `<script>(function(){var d=document.documentElement,s=null;try{s=localStorage.getItem('pf:scheme')}catch(e){}` +
          `var q=${showcase} && new URLSearchParams(location.search).get('persona');` +
          `var pref=${JSON.stringify(scheme)};if(pref==='system')pref=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';` +
          `d.dataset.template=${JSON.stringify(p.template)};d.dataset.scheme=(!q&&(s==='dark'||s==='light'))?s:pref;d.style.colorScheme=d.dataset.scheme})()</script>`,
        env.VITE_PLAUSIBLE_DOMAIN &&
          `<script defer data-domain="${esc(env.VITE_PLAUSIBLE_DOMAIN)}" src="https://plausible.io/js/script.js"></script>`,
        env.VITE_UMAMI_WEBSITE_ID &&
          `<script defer data-website-id="${esc(env.VITE_UMAMI_WEBSITE_ID)}" src="${esc(env.VITE_UMAMI_SRC || 'https://cloud.umami.is/script.js')}"></script>`,
      ]
        .filter(Boolean)
        .join('\n    ')

      return html
        .replace('<!--persona:head-->', head)
        .replace('<html lang="en">', `<html lang="en" data-template="${p.template}">`)
    },

    generateBundle() {
      for (const [name, path] of Object.entries(links.files)) {
        this.emitFile({ type: 'asset', fileName: `og/${name}`, source: readFileSync(path) })
      }
      const siteUrl = p.meta.url?.replace(/\/$/, '')
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}`,
      })
      if (siteUrl) {
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`,
        })
      }
      const t = templates[p.template]
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.webmanifest',
        source: JSON.stringify(
          {
            name: p.meta.title,
            short_name: p.person.shortName ?? p.person.name,
            description: p.meta.description,
            start_url: base,
            display: 'standalone',
            background_color: t.themeColor.dark,
            theme_color: t.themeColor.dark,
            icons: [{ src: `${base}favicon.svg`, sizes: 'any', type: 'image/svg+xml' }],
          },
          null,
          2,
        ),
      })
    },

    configureServer(server) {
      // Downloaded link-preview images live in the cache; serve them in dev.
      server.middlewares.use(`${base.replace(/\/$/, '')}/og`, (req, res, next) => {
        const path = links.files[decodeURIComponent(req.url ?? '').replace(/^\//, '').split('?')[0]]
        if (!path) return next()
        const ext = path.split('.').pop() ?? ''
        res.setHeader('Content-Type', ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`)
        res.end(readFileSync(path))
      })
      server.middlewares.use('/manifest.webmanifest', (_req, res) => {
        res.setHeader('Content-Type', 'application/manifest+json')
        res.end(JSON.stringify({ name: p.meta.title, start_url: '/', display: 'standalone' }))
      })
    },
  }
}
