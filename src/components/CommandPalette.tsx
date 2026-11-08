import { ArrowRight, Code2, Copy, CornerDownLeft, FileText, Hash, Moon, Search, Shuffle, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { asset } from '../core/define'
import { navItems } from '../core/hooks'
import { features, listPersonas, SHOWCASE } from '../core/registry'
import { useStore } from '../core/store'
import { AUTHOR, ui } from '../core/ui'
import { Icon } from './Icon'

interface Item {
  id: string
  group: string
  label: string
  hint?: string
  icon: ReactNode
  run: () => void
}

/** Prefix > substring > subsequence ("gh" → "GitHub"). 0 = no match. */
function score(label: string, query: string) {
  if (!query) return 1
  const l = label.toLowerCase()
  const q = query.toLowerCase()
  if (l.startsWith(q)) return 3
  if (l.includes(q)) return 2
  let i = 0
  for (const ch of l) if (ch === q[i]) i++
  return i === q.length ? 1 : 0
}

function openLink(href: string) {
  if (href.startsWith('#')) document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  else window.open(href, '_blank', 'noopener')
}

function PaletteBody({ onClose, onToast }: { onClose: () => void; onToast: (msg: string) => void }) {
  const { persona, scheme, toggleScheme, setPersona } = useStore()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const items = useMemo<Item[]>(() => {
    const then = (fn: () => void) => () => {
      onClose()
      fn()
    }
    const go = (id: string) => then(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))
    const list: Item[] = [
      { id: 'top', group: ui.navigation, label: 'Home', icon: <Hash />, run: go('top') },
      ...navItems(persona).map((n) => ({ id: `nav-${n.id}`, group: ui.navigation, label: n.label, icon: <Hash />, run: go(n.id) })),
      {
        id: 'theme',
        group: ui.actions,
        label: scheme === 'dark' ? ui.themeLight : ui.themeDark,
        icon: scheme === 'dark' ? <Sun /> : <Moon />,
        run: then(() => toggleScheme()),
      },
    ]
    const email = persona.person.email
    if (email) {
      list.push({
        id: 'copy',
        group: ui.actions,
        label: ui.copyEmail,
        hint: email,
        icon: <Copy />,
        run: then(() => navigator.clipboard.writeText(email).then(() => onToast(ui.copied))),
      })
    }
    if (persona.person.resume) {
      const href = asset(persona.person.resume)!
      list.push({ id: 'cv', group: ui.actions, label: ui.download, icon: <FileText />, run: then(() => openLink(href)) })
    }
    list.push({ id: 'source', group: ui.actions, label: `Template by ${AUTHOR.name}`, hint: 'GitHub', icon: <Code2 />, run: then(() => openLink(AUTHOR.github)) })
    for (const s of persona.socials) {
      list.push({ id: `s-${s.href}`, group: ui.links, label: s.label, hint: s.handle, icon: <Icon name={s.icon} />, run: then(() => openLink(s.href)) })
    }
    if (SHOWCASE) {
      for (const p of listPersonas()) {
        if (p.id !== persona.id)
          list.push({ id: `p-${p.id}`, group: ui.personas, label: `Switch to ${p.label}`, icon: <Shuffle />, run: then(() => setPersona(p.id)) })
      }
    }
    return list
  }, [persona, scheme, toggleScheme, setPersona, onToast, onClose])

  const grouped = useMemo(() => {
    const matches = items
      .map((item) => ({ item, s: score(item.label, query) || (query && score(item.group, query) ? 1 : 0) }))
      .filter((r) => r.s > 0)
      .toSorted((a, b) => b.s - a.s)
    const map = new Map<string, Item[]>()
    for (const { item } of matches) map.set(item.group, [...(map.get(item.group) ?? []), item])
    return [...map]
  }, [items, query])
  const flat = grouped.flatMap(([, list]) => list)
  const active = flat[Math.min(index, flat.length - 1)]

  useEffect(() => {
    listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  })

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = Math.max(flat.length, 1)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex((i) => (i + 1) % n)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex((i) => (i - 1 + n) % n)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      active?.run()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <motion.div
      className="palette-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
        onKeyDown={onKeyDown}
      >
        <label className="palette-search">
          <Search className="size-4" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIndex(0)
            }}
            placeholder={ui.search}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={active ? `pi-${active.id}` : undefined}
          />
          <kbd>esc</kbd>
        </label>
        <div className="palette-list" id="palette-list" role="listbox" ref={listRef}>
          {flat.length === 0 && <p className="palette-empty">{ui.noResults}</p>}
          {grouped.map(([group, list]) => (
            <div key={group} role="group" aria-label={group}>
              <p className="palette-group">{group}</p>
              {list.map((item) => {
                const i = flat.indexOf(item)
                const selected = item === active
                return (
                  <button
                    key={item.id}
                    id={`pi-${item.id}`}
                    role="option"
                    aria-selected={selected}
                    data-selected={selected}
                    onMouseMove={() => setIndex(i)}
                    onClick={item.run}
                  >
                    <span className="palette-icon">{item.icon}</span>
                    <span className="palette-label">{item.label}</span>
                    {item.hint && <span className="palette-hint">{item.hint}</span>}
                    {selected ? <CornerDownLeft className="palette-enter" /> : <ArrowRight className="palette-enter opacity-0" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <footer className="palette-foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> select
          </span>
          <span className="ml-auto">{persona.person.name}</span>
        </footer>
      </motion.div>
    </motion.div>
  )
}

/** ⌘K / Ctrl+K / "/" command palette. */
export function CommandPalette({ onToast }: { onToast: (msg: string) => void }) {
  const [open, setOpen] = useState(false)
  const close = useMemo(() => () => setOpen(false), [])

  useEffect(() => {
    if (!features.commandPalette) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === '/' && !(e.target as HTMLElement).closest('input, textarea')) {
        e.preventDefault()
        setOpen(true)
      }
    }
    const onOpen = () => setOpen(true)
    addEventListener('keydown', onKey)
    addEventListener('pf:palette', onOpen)
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('pf:palette', onOpen)
    }
  }, [])

  return <AnimatePresence>{open && <PaletteBody onClose={close} onToast={onToast} />}</AnimatePresence>
}
