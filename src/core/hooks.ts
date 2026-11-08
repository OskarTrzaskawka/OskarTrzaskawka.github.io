import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Persona, Section } from './types'

export const sectionId = (s: Section) => s.id ?? s.type

export function navItems(persona: Persona) {
  return persona.sections
    .filter((s) => s.nav !== false)
    .map((s) => ({ id: sectionId(s), label: typeof s.nav === 'string' ? s.nav : s.title.replace(/\*/g, '') }))
}

function subscribeClock(cb: () => void) {
  const t = setInterval(cb, 15_000)
  return () => clearInterval(t)
}

/** Live clock in a given IANA time zone, ticking every 15s. */
export function useLocalTime(timeZone?: string) {
  const read = useCallback(() => {
    if (!timeZone) return ''
    try {
      return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone }).format(new Date())
    } catch {
      return ''
    }
  }, [timeZone])
  return useSyncExternalStore(subscribeClock, read, () => '')
}

/** Tracks which section is currently in view. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join('|')
  useEffect(() => {
    const visible = new Map<string, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        let best: string | null = null
        let ratio = 0
        for (const [id, r] of visible) if (r > ratio) [best, ratio] = [id, r]
        setActive(best)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.5, 1] },
    )
    for (const id of key.split('|')) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [key])
  return active
}

export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), timeout)
      } catch {
        setCopied(false)
      }
    },
    [timeout],
  )
  return { copied, copy }
}

function subscribeScroll(cb: () => void) {
  addEventListener('scroll', cb, { passive: true })
  return () => removeEventListener('scroll', cb)
}
/** True once the page has scrolled past `offset` pixels. */
export function useScrolled(offset = 24) {
  return useSyncExternalStore(subscribeScroll, () => scrollY > offset, () => false)
}

export const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
