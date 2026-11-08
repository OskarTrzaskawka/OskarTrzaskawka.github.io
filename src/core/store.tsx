import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { getPersona, SHOWCASE } from './registry'
import { fontHref, templates } from './templates'
import type { ColorScheme, Persona } from './types'

const SCHEME_KEY = 'pf:scheme'

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private mode — the preference just won't persist */
  }
}

function schemeFor(persona: Persona, useSaved: boolean): ColorScheme {
  const saved = useSaved ? read(SCHEME_KEY) : null
  if (saved === 'dark' || saved === 'light') return saved
  const pref = persona.defaultScheme ?? templates[persona.template].defaultScheme
  if (pref === 'system') return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  return pref
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

interface Store {
  persona: Persona
  scheme: ColorScheme
  /** Toggles the scheme with a circular View Transition from (x, y). */
  toggleScheme: (origin?: { x: number; y: number }) => void
  setPersona: (id: string) => void
}

const Ctx = createContext<Store | null>(null)

export function useStore(): Store {
  const store = use(Ctx)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(() =>
    getPersona(SHOWCASE ? new URLSearchParams(location.search).get('persona') : null),
  )
  const [scheme, setScheme] = useState<ColorScheme>(() => schemeFor(persona, true))

  useEffect(() => {
    const root = document.documentElement
    const template = templates[persona.template]
    root.dataset.template = persona.template
    root.dataset.scheme = scheme
    root.style.colorScheme = scheme
    for (const [prop, value] of [
      ['--accent', persona.theme?.accent],
      ['--accent-2', persona.theme?.accent2],
    ] as const) {
      if (value) root.style.setProperty(prop, value)
      else root.style.removeProperty(prop)
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', template.themeColor[scheme])

    // Load fonts for templates the HTML plugin did not preload (showcase switching).
    if (!document.querySelector(`link[data-template-font="${persona.template}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = fontHref(template.fonts)
      link.dataset.templateFont = persona.template
      document.head.append(link)
    }
  }, [persona, scheme])

  useEffect(() => {
    document.title = persona.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', persona.meta.description)
  }, [persona])

  const toggleScheme = useCallback(
    (origin?: { x: number; y: number }) => {
      const next: ColorScheme = scheme === 'dark' ? 'light' : 'dark'
      write(SCHEME_KEY, next)
      if (!document.startViewTransition || reducedMotion()) {
        setScheme(next)
        return
      }
      const x = origin?.x ?? innerWidth - 40
      const y = origin?.y ?? 40
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
      const transition = document.startViewTransition(() => flushSync(() => setScheme(next)))
      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 650, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' },
        )
      })
    },
    [scheme],
  )

  const setPersona = useCallback((id: string) => {
    const next = getPersona(id)
    const url = new URL(location.href)
    url.searchParams.set('persona', next.id)
    url.hash = ''
    history.replaceState(null, '', url)
    const apply = () => {
      setPersonaState(next)
      setScheme(schemeFor(next, false))
      scrollTo({ top: 0, behavior: 'instant' })
    }
    if (document.startViewTransition && !reducedMotion()) document.startViewTransition(() => flushSync(apply))
    else apply()
  }, [])

  const value = useMemo<Store>(() => ({ persona, scheme, toggleScheme, setPersona }), [persona, scheme, toggleScheme, setPersona])

  return <Ctx value={value}>{children}</Ctx>
}
