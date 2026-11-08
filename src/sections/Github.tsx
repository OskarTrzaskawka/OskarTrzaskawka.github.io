import { ArrowUpRight, GitFork, Star } from 'lucide-react'
import { Component, Suspense, use, useMemo, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { Reveal, SectionHead } from '../components/primitives'
import type { GithubSection } from '../core/types'
import { ui } from '../core/ui'

interface Repo {
  name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  fork: boolean
  archived: boolean
  pushed_at: string
  topics?: string[]
}
interface User {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
}
interface Contributions {
  total: Record<string, number>
  contributions: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[]
}
interface GithubData {
  user: User
  repos: Repo[]
  contributions: Contributions | null
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5', Rust: '#dea584', Go: '#00ADD8',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600', Ruby: '#701516', PHP: '#4F5D95',
  HTML: '#e34c26', CSS: '#663399', Shell: '#89e051', Swift: '#F05138', Kotlin: '#A97BFF', Vue: '#41b883',
  Svelte: '#ff3e00', Dart: '#00B4AB', Lua: '#000080', Zig: '#ec915c', Astro: '#ff5a03',
}

const TTL = 60 * 60 * 1000
const cache = new Map<string, Promise<GithubData>>()

async function json<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json() as Promise<T>
}

/** Fetches once per session; cached in sessionStorage for an hour to stay well under the 60 req/h anonymous limit. */
function load(username: string, withContrib: boolean): Promise<GithubData> {
  const key = `pf:gh:${username}:${withContrib}`
  let p = cache.get(key)
  if (p) return p
  p = (async () => {
    try {
      const hit = JSON.parse(sessionStorage.getItem(key) ?? 'null') as { at: number; data: GithubData } | null
      if (hit && Date.now() - hit.at < TTL) return hit.data
    } catch {
      /* ignore */
    }
    const [user, repos, contributions] = await Promise.all([
      json<User>(`https://api.github.com/users/${username}`),
      json<Repo[]>(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`),
      withContrib ? json<Contributions>(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`).catch(() => null) : null,
    ])
    const data = { user, repos, contributions }
    try {
      sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }))
    } catch {
      /* ignore */
    }
    return data
  })()
  cache.set(key, p)
  return p
}

function Heatmap({ data }: { data: Contributions }) {
  const days = data.contributions.slice(-371)
  // Pad so the first column starts on Sunday.
  const pad = days.length ? new Date(days[0].date).getDay() : 0
  const cells = [...Array(pad).fill(null), ...days] as (Contributions['contributions'][number] | null)[]
  const total = data.total.lastYear ?? days.reduce((a, d) => a + d.count, 0)
  return (
    <div className="gh-heatmap">
      <div className="gh-heatmap-scroll">
        <div className="gh-heatmap-grid" role="img" aria-label={`${total} ${ui.contributions}`}>
          {cells.map((d, i) => (
            <i key={i} data-level={d?.level ?? -1} title={d ? `${d.count} on ${d.date}` : undefined} />
          ))}
        </div>
      </div>
      <div className="gh-heatmap-foot">
        <span>
          <strong>{total.toLocaleString('en')}</strong> {ui.contributions}
        </span>
        <span className="gh-legend" aria-hidden="true">
          Less {[0, 1, 2, 3, 4].map((l) => <i key={l} data-level={l} />)} More
        </span>
      </div>
    </div>
  )
}

function GithubBody({ section, promise }: { section: GithubSection; promise: Promise<GithubData> }) {
  const { user, repos, contributions } = use(promise)
  const own = useMemo(
    () => repos.filter((r) => !r.fork && !r.archived && !section.exclude?.includes(r.name)),
    [repos, section.exclude],
  )
  const stars = own.reduce((a, r) => a + r.stargazers_count, 0)
  const top = own
    .toSorted((a, b) => b.stargazers_count - a.stargazers_count || +new Date(b.pushed_at) - +new Date(a.pushed_at))
    .slice(0, section.limit ?? 6)
  const langs = useMemo(() => {
    const count = new Map<string, number>()
    for (const r of own) if (r.language) count.set(r.language, (count.get(r.language) ?? 0) + 1)
    const total = [...count.values()].reduce((a, b) => a + b, 0) || 1
    return [...count]
      .toSorted((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, n]) => ({ name, pct: (n / total) * 100 }))
  }, [own])

  return (
    <>
      <Reveal className="gh-profile">
        <a href={user.html_url} target="_blank" rel="noreferrer" className="gh-user" aria-label={`${user.name ?? user.login} on GitHub`}>
          <img src={user.avatar_url} alt="" width={56} height={56} loading="lazy" />
          <span>
            <strong>{user.name ?? user.login}</strong>
            <small>@{user.login}</small>
          </span>
        </a>
        <dl className="gh-stats">
          <div>
            <dd>{user.public_repos}</dd>
            <dt>{ui.repos}</dt>
          </div>
          <div>
            <dd>{stars.toLocaleString('en')}</dd>
            <dt>{ui.stars}</dt>
          </div>
          <div>
            <dd>{user.followers.toLocaleString('en')}</dd>
            <dt>{ui.followers}</dt>
          </div>
        </dl>
      </Reveal>

      {section.contributions !== false && contributions && (
        <Reveal>
          <Heatmap data={contributions} />
        </Reveal>
      )}

      {section.languages !== false && langs.length > 0 && (
        <Reveal className="gh-langs">
          <div className="gh-langbar" role="img" aria-label={langs.map((l) => `${l.name} ${l.pct.toFixed(0)}%`).join(', ')}>
            {langs.map((l) => (
              <i key={l.name} style={{ width: `${l.pct}%`, background: LANG_COLORS[l.name] ?? 'var(--muted)' }} />
            ))}
          </div>
          <ul>
            {langs.map((l) => (
              <li key={l.name}>
                <i style={{ background: LANG_COLORS[l.name] ?? 'var(--muted)' }} />
                {l.name} <small>{l.pct.toFixed(0)}%</small>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      <div className="gh-repos">
        {top.map((r, i) => (
          <Reveal key={r.name} delay={i * 0.05}>
            <a href={r.html_url} target="_blank" rel="noreferrer" className="gh-repo">
              <div className="gh-repo-head">
                <Icon name="book" className="size-4" />
                <strong>{r.name}</strong>
                <ArrowUpRight className="size-4 project-arrow" />
              </div>
              <p>{r.description ?? 'No description yet.'}</p>
              <div className="gh-repo-foot">
                {r.language && (
                  <span>
                    <i style={{ background: LANG_COLORS[r.language] ?? 'var(--muted)' }} />
                    {r.language}
                  </span>
                )}
                <span>
                  <Star className="size-3.5" />
                  {r.stargazers_count}
                </span>
                <span>
                  <GitFork className="size-3.5" />
                  {r.forks_count}
                </span>
                <span className="ml-auto">{new Date(r.pushed_at).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </>
  )
}

function Skeleton() {
  return (
    <div className="gh-skeleton" aria-busy="true" aria-label="Loading GitHub data">
      <i />
      <i />
      <div>
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
    </div>
  )
}

class Boundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function Github({ section, index }: { section: GithubSection; index: number }) {
  const promise = useMemo(() => load(section.username, section.contributions !== false), [section.username, section.contributions])
  return (
    <div className="container">
      <SectionHead eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} />
      <Boundary
        fallback={
          <p className="gh-error">
            {ui.githubError}{' '}
            <a href={`https://github.com/${section.username}`} target="_blank" rel="noreferrer">
              {ui.viewOnGithub} →
            </a>
          </p>
        }
      >
        <Suspense fallback={<Skeleton />}>
          <GithubBody section={section} promise={promise} />
        </Suspense>
      </Boundary>
    </div>
  )
}
