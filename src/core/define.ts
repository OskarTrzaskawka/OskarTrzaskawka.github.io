import type { Persona, PersonaInput } from './types'

/**
 * Identity helper that gives you autocompletion and type-checking in persona files.
 * Link-only projects (`{ url }`) are completed at startup by `resolveLinks`.
 */
export function definePersona(persona: PersonaInput): Persona {
  return persona as Persona
}

/** Prefix root-relative public paths with Vite's base (needed for GitHub Pages sub-paths). */
export function asset(path: string | undefined): string | undefined {
  if (!path) return path
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
