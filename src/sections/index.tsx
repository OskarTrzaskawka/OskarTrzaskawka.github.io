import { lazy, Suspense, type ComponentType } from 'react'
import { sectionId } from '../core/hooks'
import type { Section, SectionType } from '../core/types'
import { About, Contact, Experience, Marquee, Process, Services, Skills, Stats, Testimonials, Writing } from './Content'
import { Projects } from './Projects'

// Heavier, persona-specific sections are code-split and only downloaded when a persona uses them.
const Github = lazy(() => import('./Github').then((m) => ({ default: m.Github })))
const Gallery = lazy(() => import('./Gallery').then((m) => ({ default: m.Gallery })))
const Terminal = lazy(() => import('./Terminal').then((m) => ({ default: m.Terminal })))

/** Section registry — add a new section type here and in core/types.ts. */
// oxlint-disable-next-line typescript/no-explicit-any
const registry: Record<SectionType, ComponentType<{ section: any; index: number }>> = {
  about: About,
  projects: Projects,
  github: Github,
  skills: Skills,
  experience: Experience,
  gallery: Gallery,
  services: Services,
  process: Process,
  testimonials: Testimonials,
  stats: Stats,
  terminal: Terminal,
  marquee: Marquee,
  writing: Writing,
  contact: Contact,
}

/** Sections without a numbered heading. */
const unnumbered = new Set<SectionType>(['stats', 'marquee', 'contact'])

export function Sections({ sections }: { sections: Section[] }) {
  let n = 0
  return sections.map((section) => {
    const Component = registry[section.type]
    if (!Component) return null
    const index = unnumbered.has(section.type) ? 0 : ++n
    const id = sectionId(section)
    return (
      <section key={id} id={id} className={`section section-${section.type}`} data-section={section.type}>
        <Suspense fallback={<div className="container section-loading" aria-busy="true" />}>
          <Component section={section} index={index} />
        </Suspense>
      </section>
    )
  })
}
