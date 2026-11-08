import base from 'virtual:active-persona'
import previews from 'virtual:link-previews'
import { applyEnv, features as readFeatures } from './env'
import { resolveLinks } from './links'
import type { Persona } from './types'

const env = import.meta.env as unknown as Record<string, string | undefined>

export const SHOWCASE = import.meta.env.VITE_SHOWCASE === 'true'
export const features = readFeatures(env)

/** The persona chosen by VITE_PERSONA, with every .env override applied. */
const active = resolveLinks(applyEnv(base, env), previews)

/**
 * Normal builds bundle only the active persona. Showcase builds bundle every
 * file in `src/personas` so visitors can switch live (`?persona=designer`).
 */
const all: Record<string, Persona> = SHOWCASE
  ? Object.fromEntries(
      Object.values(import.meta.glob<{ default: Persona }>('../personas/*.ts', { eager: true })).map((m) => [
        m.default.id,
        m.default.id === active.id ? active : resolveLinks(m.default, previews),
      ]),
    )
  : { [active.id]: active }

export function getPersona(id: string | null | undefined): Persona {
  return (id && all[id]) || active
}

export function listPersonas(): Persona[] {
  return Object.values(all)
}
