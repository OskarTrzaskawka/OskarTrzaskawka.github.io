import { ArrowDown, ArrowUpRight, Clock, Download, MapPin } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'
import { asset } from '../core/define'
import { useLocalTime } from '../core/hooks'
import { features } from '../core/registry'
import { useStore } from '../core/store'
import type { Cta, Persona } from '../core/types'
import { ui } from '../core/ui'
import { Avatar } from './Chrome'
import { Icon } from './Icon'
import { Artwork, Rich, Rotator } from './primitives'

const ease = [0.16, 1, 0.3, 1] as const
const intro = (i: number) =>
  features.animations
    ? { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: 0.1 + i * 0.08, ease } }
    : {}

function Ctas({ ctas, resume }: { ctas?: Cta[]; resume?: string }) {
  return (
    <div className="hero-ctas">
      {ctas?.map((c) => (
        <a key={c.href} href={c.href} className={c.variant === 'ghost' ? 'btn btn-ghost' : 'btn btn-primary'}>
          {c.label}
          {c.href.startsWith('#') ? <ArrowDown className="size-4" /> : <ArrowUpRight className="size-4" />}
        </a>
      ))}
      {resume && (
        <a href={asset(resume)} className="btn btn-ghost" download>
          {ui.download} <Download className="size-4" />
        </a>
      )}
    </div>
  )
}

function Availability({ persona }: { persona: Persona }) {
  const a = persona.person.availability
  if (!a) return null
  return (
    <span className="availability" data-status={a.status}>
      <i />
      {a.label}
    </span>
  )
}

function MetaRow({ persona }: { persona: Persona }) {
  const time = useLocalTime(persona.person.timeZone)
  return (
    <div className="hero-meta">
      {persona.person.location && (
        <span>
          <MapPin className="size-3.5" />
          {persona.person.location}
        </span>
      )}
      {features.localTime && time && (
        <span title={ui.localTime}>
          <Clock className="size-3.5" />
          {time}
        </span>
      )}
      <span className="hero-socials">
        {persona.socials.map((s) => (
          <a key={s.href} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} title={s.label}>
            <Icon name={s.icon} />
          </a>
        ))}
      </span>
    </div>
  )
}

/* -------------------------------- Developer -------------------------------- */

function CodeCard({ persona }: { persona: Persona }) {
  const skills = persona.sections.flatMap((s) => (s.type === 'skills' ? s.groups.flatMap((g) => g.items.map((i) => i.name)) : [])).slice(0, 4)
  const varName = persona.person.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '') || 'me'
  const lines: [string, string][] = [
    ['name', persona.person.name],
    ['role', persona.person.role],
    ['location', persona.person.location ?? 'Earth'],
  ]
  return (
    <motion.div className="code-card" {...intro(4)}>
      <div className="code-bar">
        <i />
        <i />
        <i />
        <span>{varName}.ts</span>
      </div>
      <pre>
        <code>
          <span className="tok-k">const</span> <span className="tok-v">{varName}</span> <span className="tok-p">=</span> {'{'}
          {'\n'}
          {lines.map(([k, v]) => (
            <span key={k}>
              {'  '}
              <span className="tok-prop">{k}</span>
              <span className="tok-p">:</span> <span className="tok-s">'{v}'</span>,{'\n'}
            </span>
          ))}
          {'  '}
          <span className="tok-prop">stack</span>
          <span className="tok-p">:</span> [{skills.map((s, i) => (
            <span key={s}>
              <span className="tok-s">'{s}'</span>
              {i < skills.length - 1 ? ', ' : ''}
            </span>
          ))}],{'\n'}
          {'  '}
          <span className="tok-prop">available</span>
          <span className="tok-p">:</span> <span className="tok-k">{String(persona.person.availability?.status === 'open')}</span>,{'\n'}
          {'}'}
          {'\n\n'}
          <span className="tok-c">{'// '}press ⌘K to explore</span>
          <span className="caret" />
        </code>
      </pre>
    </motion.div>
  )
}

function DeveloperHero({ persona }: { persona: Persona }) {
  const { hero } = persona
  return (
    <section className="hero hero-developer" id="top">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid container">
        <div className="hero-copy">
          <motion.div className="hero-top" {...intro(0)}>
            <Availability persona={persona} />
            {hero.eyebrow && <span className="eyebrow">{hero.eyebrow}</span>}
          </motion.div>
          <motion.h1 {...intro(1)}>
            <Rich text={hero.title} /> {hero.rotating && <Rotator words={hero.rotating} />}
          </motion.h1>
          <motion.p className="hero-sub" {...intro(2)}>
            <Rich text={hero.subtitle} />
          </motion.p>
          <motion.div {...intro(3)}>
            <Ctas ctas={hero.ctas} resume={persona.person.resume} />
          </motion.div>
          <motion.div {...intro(4)}>
            <MetaRow persona={persona} />
          </motion.div>
        </div>
        <CodeCard persona={persona} />
      </div>
    </section>
  )
}

/* --------------------------------- Designer -------------------------------- */

function DesignerHero({ persona }: { persona: Persona }) {
  const { hero } = persona
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 800], [0, reduce ? 0 : -120])
  const rotate = useTransform(scrollY, [0, 800], [-6, reduce ? -6 : 8])
  const featured = persona.sections.flatMap((s) => (s.type === 'projects' ? s.items : [])).find((p) => p.art)
  return (
    <section className="hero hero-designer" id="top">
      <div className="container">
        <motion.div className="hero-top" {...intro(0)}>
          {hero.eyebrow && <span className="eyebrow">{hero.eyebrow}</span>}
          <Availability persona={persona} />
        </motion.div>
        <motion.h1 {...intro(1)}>
          <Rich text={hero.title} />
        </motion.h1>
        <div className="hero-designer-row">
          <motion.p className="hero-sub" {...intro(2)}>
            <Rich text={hero.subtitle} />
          </motion.p>
          <motion.div {...intro(3)}>
            <Ctas ctas={hero.ctas} resume={persona.person.resume} />
          </motion.div>
        </div>
        {featured?.art && (
          <motion.a href="#work" className="hero-float" style={{ y, rotate }} {...intro(4)} aria-label="Selected work">
            <Artwork seed={featured.art.seed} palette={featured.art.palette} />
            <span>
              {featured.title} — {featured.year}
            </span>
          </motion.a>
        )}
        <motion.div {...intro(5)}>
          <MetaRow persona={persona} />
        </motion.div>
      </div>
      {hero.rotating && (
        <div className="hero-ticker" aria-hidden="true">
          <div>
            {[...hero.rotating, ...hero.rotating, ...hero.rotating].map((w, i) => (
              <span key={i}>
                {w} <b>✦</b>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

/* ------------------------------- Photographer ------------------------------ */

function PhotographerHero({ persona }: { persona: Persona }) {
  const { hero } = persona
  const images = hero.images?.map((i) => asset(i)!) ?? []
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (images.length < 2 || reduce) return
    const t = setInterval(() => setI((v) => (v + 1) % images.length), 6000)
    return () => clearInterval(t)
  }, [images.length, reduce])
  return (
    <section className="hero hero-photographer" id="top">
      <div className="hero-slides" aria-hidden="true">
        <AnimatePresence initial={false}>
          {images.length > 0 && (
            <motion.img
              key={images[i]}
              src={images[i]}
              alt=""
              initial={{ opacity: 0, scale: 1.12 }}
              animate={{ opacity: 1, scale: reduce ? 1.12 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.6 }, scale: { duration: 7, ease: 'linear' } }}
              fetchPriority={i === 0 ? 'high' : 'auto'}
            />
          )}
        </AnimatePresence>
        <div className="hero-shade" />
      </div>
      <div className="container hero-photo-content">
        <motion.span className="eyebrow" {...intro(0)}>
          {hero.eyebrow}
        </motion.span>
        <motion.h1 {...intro(1)}>
          <Rich text={hero.title} />
        </motion.h1>
        <div className="hero-photo-row">
          <motion.p className="hero-sub" {...intro(2)}>
            <Rich text={hero.subtitle} />
          </motion.p>
          <motion.div {...intro(3)}>
            <Ctas ctas={hero.ctas} />
          </motion.div>
        </div>
        <motion.div className="hero-photo-foot" {...intro(4)}>
          <Availability persona={persona} />
          {images.length > 1 && (
            <div className="slide-dots" role="tablist" aria-label="Hero images">
              {images.map((src, j) => (
                <button key={src} role="tab" aria-selected={i === j} aria-label={`Image ${j + 1}`} onClick={() => setI(j)}>
                  <i data-active={i === j} />
                </button>
              ))}
              <span>
                {String(i + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

/* --------------------------------- Minimal --------------------------------- */

function MinimalHero({ persona }: { persona: Persona }) {
  const { hero, person } = persona
  return (
    <section className="hero hero-minimal" id="top">
      <div className="container narrow">
        <motion.div className="minimal-id" {...intro(0)}>
          <Avatar className="avatar-lg" />
          <div>
            <h1>{hero.title}</h1>
            <p className="minimal-role">{person.role}</p>
          </div>
        </motion.div>
        <motion.p className="hero-sub" {...intro(1)}>
          <Rich text={hero.subtitle} />
        </motion.p>
        <motion.div {...intro(2)}>
          <Availability persona={persona} />
          <MetaRow persona={persona} />
        </motion.div>
        {person.resume && (
          <motion.div {...intro(3)}>
            <Ctas ctas={hero.ctas} resume={person.resume} />
          </motion.div>
        )}
      </div>
    </section>
  )
}

export function Hero() {
  const { persona } = useStore()
  switch (persona.template) {
    case 'designer':
      return <DesignerHero persona={persona} />
    case 'photographer':
      return <PhotographerHero persona={persona} />
    case 'minimal':
      return <MinimalHero persona={persona} />
    default:
      return <DeveloperHero persona={persona} />
  }
}
