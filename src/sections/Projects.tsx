import { ArrowUpRight, X } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { Icon } from '../components/Icon'
import { Artwork, Reveal, SectionHead } from '../components/primitives'
import { asset } from '../core/define'
import type { Project, ProjectsSection } from '../core/types'
import { ui } from '../core/ui'

const categoryOf = (p: Project) => p.category ?? p.tags?.[0] ?? 'Other'

/** Card spotlight: writes pointer position into CSS variables on the card. */
function track(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--px', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--py', `${e.clientY - r.top}px`)
}

function Cover({ project, sizes }: { project: Project; sizes?: string }) {
  return (
    <motion.div layoutId={`cover-${project.id}`} className="cover" data-fit={project.imageFit}>
      {project.image ? (
        <img src={asset(project.image)} alt="" loading="lazy" decoding="async" sizes={sizes} />
      ) : (
        <Artwork seed={project.art?.seed ?? project.id.length * 7} palette={project.art?.palette} label={`${project.title} cover`} />
      )}
      {project.logo && <img className="cover-logo" src={asset(project.logo)} alt="" loading="lazy" />}
    </motion.div>
  )
}

function Card({ project, onOpen, big }: { project: Project; onOpen: () => void; big?: boolean }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="project-card"
      data-big={big}
      onPointerMove={track}
    >
      <button className="project-hit" onClick={onOpen} aria-label={`${ui.viewProject}: ${project.title}`} />
      <Cover project={project} />
      <div className="project-body">
        <div className="project-meta">
          <span>{project.year}</span>
          {project.status && <span className="project-status">{project.status}</span>}
        </div>
        <h3>
          {project.title}
          <ArrowUpRight className="project-arrow" />
        </h3>
        <p>{project.summary}</p>
        {project.tags && (
          <ul className="tags">
            {project.tags.slice(0, big ? 6 : 4).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </div>
    </motion.article>
  )
}

function ListRow({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  return (
    <Reveal as="li" className="project-row" delay={index * 0.05}>
      <button onClick={onOpen} className="project-row-btn">
        <span className="project-row-year">{project.year}</span>
        <span className="project-row-main">
          <strong>{project.title}</strong>
          <span>{project.summary}</span>
        </span>
        <span className="project-row-tags">{project.tags?.join(' · ')}</span>
        <ArrowUpRight className="size-4 project-arrow" />
      </button>
    </Reveal>
  )
}

function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [onClose])
  return (
    <motion.div
      className="dialog-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={ref}
        tabIndex={-1}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`dlg-${project.id}`}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.12, duration: 0.5 }}
      >
        <button className="icon-btn dialog-close" onClick={onClose} aria-label={ui.close}>
          <X className="size-4" />
        </button>
        <Cover project={project} />
        <div className="dialog-body">
          <div className="dialog-head">
            <h3 id={`dlg-${project.id}`}>{project.title}</h3>
            <p className="lead">{project.summary}</p>
          </div>
          <dl className="dialog-facts">
            {project.role && (
              <div>
                <dt>{ui.role}</dt>
                <dd>{project.role}</dd>
              </div>
            )}
            {project.year && (
              <div>
                <dt>{ui.year}</dt>
                <dd>{project.year}</dd>
              </div>
            )}
            {project.status && (
              <div>
                <dt>{ui.status}</dt>
                <dd>{project.status}</dd>
              </div>
            )}
            {project.tags && (
              <div>
                <dt>{ui.stack}</dt>
                <dd>{project.tags.join(', ')}</dd>
              </div>
            )}
          </dl>
          {project.metrics && (
            <div className="dialog-metrics">
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <strong>{m.value}</strong>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          )}
          {project.body?.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {project.links && (
            <div className="hero-ctas">
              {project.links.map((l, i) => (
                <a key={l.href + i} href={l.href} target="_blank" rel="noreferrer" className={i === 0 ? 'btn btn-primary' : 'btn btn-ghost'}>
                  <Icon name={l.icon} />
                  {l.label}
                  <ArrowUpRight className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Projects({ section, index }: { section: ProjectsSection; index: number }) {
  const [filter, setFilter] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const layout = section.layout ?? 'cards'
  const categories = useMemo(() => [...new Set(section.items.map(categoryOf))], [section.items])
  const items = filter ? section.items.filter((p) => categoryOf(p) === filter) : section.items
  const open = section.items.find((p) => p.id === openId)
  const close = useCallback(() => setOpenId(null), [])

  return (
    <div className="container">
      <SectionHead eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} />
      <LayoutGroup>
        {section.filters && categories.length > 1 && (
          <Reveal className="chips" as="div">
            {[null, ...categories].map((c) => (
              <button key={c ?? 'all'} data-active={filter === c} onClick={() => setFilter(c)}>
                {filter === c && <motion.i layoutId={`chip-${section.id ?? 'p'}`} className="chip-pill" />}
                <span>{c ?? ui.all}</span>
                <small>{c ? section.items.filter((p) => categoryOf(p) === c).length : section.items.length}</small>
              </button>
            ))}
          </Reveal>
        )}

        {layout === 'list' ? (
          <ol className="project-list">
            {items.map((p, i) => (
              <ListRow key={p.id} project={p} index={i} onOpen={() => setOpenId(p.id)} />
            ))}
          </ol>
        ) : (
          <Reveal>
            <motion.div layout className={`projects projects-${layout}`}>
              <AnimatePresence mode="popLayout">
                {items.map((p, i) => (
                  <Card
                    key={p.id}
                    project={p}
                    big={(layout === 'spotlight' && i === 0 && !!p.featured) || (layout === 'bento' && p.featured)}
                    onOpen={() => setOpenId(p.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </Reveal>
        )}
        <AnimatePresence>{open && <ProjectDialog key={open.id} project={open} onClose={close} />}</AnimatePresence>
      </LayoutGroup>
    </div>
  )
}
