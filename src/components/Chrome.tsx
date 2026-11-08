import { ArrowUp, ArrowUpRight, Command, Menu, Moon, Sun, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { asset } from '../core/define'
import { isMac, navItems, useActiveSection, useLocalTime, useScrolled } from '../core/hooks'
import { features, listPersonas, SHOWCASE } from '../core/registry'
import { useStore } from '../core/store'
import { templates } from '../core/templates'
import { AUTHOR, ui } from '../core/ui'
import { Icon } from './Icon'
import { Initials } from './primitives'

const YEAR = new Date().getFullYear()

export function openPalette() {
  dispatchEvent(new CustomEvent('pf:palette'))
}

export function Avatar({ className = '' }: { className?: string }) {
  const { persona } = useStore()
  return persona.person.avatar ? (
    <img className={`avatar ${className}`} src={asset(persona.person.avatar)} alt="" width={64} height={64} />
  ) : (
    <Initials name={persona.person.name} className={`avatar ${className}`} />
  )
}

export function ThemeToggle() {
  const { scheme, toggleScheme } = useStore()
  if (!features.themeToggle) return null
  return (
    <button
      className="icon-btn"
      onClick={(e) => toggleScheme({ x: e.clientX, y: e.clientY })}
      aria-label={scheme === 'dark' ? ui.themeLight : ui.themeDark}
      title={scheme === 'dark' ? ui.themeLight : ui.themeDark}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={scheme}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25 }}
          className="grid place-items-center"
        >
          {scheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

export function Nav() {
  const { persona } = useStore()
  const items = navItems(persona)
  const active = useActiveSection(items.map((i) => i.id))
  const scrolled = useScrolled()
  const [open, setOpen] = useState(false)
  const name = persona.person.shortName ?? persona.person.name

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="nav" data-scrolled={scrolled}>
      <div className="nav-inner">
        <a href="#top" className="brand" onClick={() => setOpen(false)}>
          <Avatar />
          <span>{name}</span>
        </a>
        <nav aria-label="Primary" className="nav-links">
          {items.map((item) => (
            <a key={item.id} href={`#${item.id}`} data-active={active === item.id} aria-current={active === item.id ? 'true' : undefined}>
              {active === item.id && <motion.i layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="nav-tools">
          {features.commandPalette && (
            <button className="kbd-btn" onClick={openPalette} aria-label="Open command palette">
              <Command className="size-3.5" />
              <kbd>{isMac() ? '⌘' : 'Ctrl'} K</kbd>
            </button>
          )}
          <ThemeToggle />
          <button className="icon-btn menu-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-menu" aria-label={ui.menu}>
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            className="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            aria-label="Mobile"
          >
            {items.map((item, i) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <small>{String(i + 1).padStart(2, '0')}</small>
                {item.label}
              </motion.a>
            ))}
            <div className="mobile-socials">
              {persona.socials.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                  <Icon name={s.icon} className="size-5" />
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

/** Pure-CSS scroll-driven progress bar (animation-timeline: scroll()). */
export function ScrollProgress() {
  return features.scrollProgress ? <div className="scroll-progress" aria-hidden="true" /> : null
}

/** Soft spotlight that follows the pointer. Writes CSS variables, no re-renders. */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!features.cursorGlow || matchMedia('(pointer: coarse)').matches) return
    let raf = 0
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        ref.current?.style.setProperty('--x', `${e.clientX}px`)
        ref.current?.style.setProperty('--y', `${e.clientY}px`)
        document.documentElement.style.setProperty('--mx', `${e.clientX}px`)
        document.documentElement.style.setProperty('--my', `${e.clientY}px`)
      })
    }
    addEventListener('pointermove', move, { passive: true })
    return () => {
      removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])
  return features.cursorGlow ? <div ref={ref} className="cursor-glow" aria-hidden="true" /> : null
}

export function BackToTop() {
  const scrolled = useScrolled(900)
  if (!features.backToTop) return null
  return (
    <AnimatePresence>
      {scrolled && (
        <motion.a
          href="#top"
          className="back-to-top"
          aria-label={ui.backToTop}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
        >
          <ArrowUp className="size-4" />
        </motion.a>
      )}
    </AnimatePresence>
  )
}

export function Footer() {
  const { persona } = useStore()
  const time = useLocalTime(persona.person.timeZone)
  return (
    <footer className="site-footer">
      <div className="footer-big" aria-hidden="true">
        {persona.person.name}
      </div>
      <div className="footer-row">
        <div className="footer-socials">
          {persona.socials.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noreferrer">
              <Icon name={s.icon} />
              {s.label}
            </a>
          ))}
        </div>
        {features.localTime && time && (
          <span className="footer-time">
            {persona.person.location} · {time}
          </span>
        )}
      </div>
      <div className="footer-row footer-legal">
        <span>
          © {YEAR} {persona.person.name}. {persona.footer?.note}
        </span>
        <span className="credit">
          Website designed &amp; built by{' '}
          <a href={AUTHOR.github} target="_blank" rel="noreferrer author">
            {AUTHOR.name}
            <ArrowUpRight className="size-3" />
          </a>
        </span>
      </div>
    </footer>
  )
}

/** Floating persona switcher, only in showcase builds (VITE_SHOWCASE=true). */
export function ShowcaseDock() {
  const { persona, setPersona } = useStore()
  if (!SHOWCASE) return null
  return (
    <div className="showcase-dock" role="toolbar" aria-label={ui.showcase}>
      <span className="dock-label">{ui.showcase}</span>
      {listPersonas().map((p) => (
        <button key={p.id} data-active={p.id === persona.id} onClick={() => setPersona(p.id)} title={templates[p.template].description}>
          {p.id === persona.id && <motion.i layoutId="dock-pill" className="dock-pill" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
          <span>{p.label}</span>
        </button>
      ))}
    </div>
  )
}
