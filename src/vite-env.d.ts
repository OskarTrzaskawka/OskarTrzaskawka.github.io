/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Which persona file in src/personas to build. */
  readonly VITE_PERSONA?: string
  /** Bundle every persona and show the persona switcher. */
  readonly VITE_SHOWCASE?: string
  /** Optional form endpoint (Formspree, Web3Forms, Getform…). Falls back to mailto. */
  readonly VITE_CONTACT_ENDPOINT?: string
  /** Public form key some services need (Web3Forms `access_key`). */
  readonly VITE_CONTACT_ACCESS_KEY?: string
  /** Optional Plausible / Umami domain. Cookieless, no banner needed. */
  readonly VITE_PLAUSIBLE_DOMAIN?: string
  readonly VITE_UMAMI_WEBSITE_ID?: string
  readonly VITE_UMAMI_SRC?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'virtual:active-persona' {
  const persona: import('./core/types').Persona
  export default persona
}
