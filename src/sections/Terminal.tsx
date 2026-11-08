import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Reveal, SectionHead } from '../components/primitives'
import { useStore } from '../core/store'
import type { TerminalSection } from '../core/types'
import { AUTHOR, ui } from '../core/ui'

type Line = { kind: 'in' | 'out' | 'err'; text: string }

export function Terminal({ section, index }: { section: TerminalSection; index: number }) {
  const { persona, toggleScheme, scheme } = useStore()
  const [lines, setLines] = useState<Line[]>([
    { kind: 'out', text: `Welcome to ${persona.person.name}'s terminal. ${ui.terminalHint}.` },
  ])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [cursor, setCursor] = useState(-1)
  const scroller = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [lines])

  const custom = section.commands ?? {}
  const projects = persona.sections.flatMap((s) => (s.type === 'projects' ? s.items : []))
  const skills = persona.sections.flatMap((s) => (s.type === 'skills' ? s.groups.flatMap((g) => g.items.map((i) => i.name)) : []))

  const builtins: Record<string, () => string | string[] | null> = {
    help: () => [
      'Available commands:',
      ...['whoami', 'projects', 'skills', 'socials', 'contact', 'theme', 'date', 'clear', 'credits', ...Object.keys(custom)].map(
        (c) => `  ${c}`,
      ),
    ],
    whoami: () => `${persona.person.name} — ${persona.person.role}${persona.person.location ? `, ${persona.person.location}` : ''}`,
    projects: () => (projects.length ? projects.map((p) => `  ${p.title.padEnd(16)} ${p.summary}`) : 'No projects yet.'),
    skills: () => skills.join(' · ') || 'Curiosity.',
    socials: () => persona.socials.map((s) => `  ${s.label.padEnd(12)} ${s.href}`),
    contact: () => (persona.person.email ? `Email: ${persona.person.email}` : 'See the contact section below.'),
    theme: () => {
      toggleScheme()
      return `Switched to ${scheme === 'dark' ? 'light' : 'dark'} mode.`
    },
    date: () => new Date().toString(),
    credits: () => `Portfolio engine by ${AUTHOR.name} — ${AUTHOR.github}`,
    sudo: () => 'Nice try. This incident will be reported. 🚨',
    ls: () => 'about.md  projects/  skills.json  contact.txt',
    clear: () => {
      setLines([])
      return null
    },
  }

  const run = (raw: string) => {
    const cmd = raw.trim()
    if (!cmd) return
    const [name] = cmd.split(/\s+/)
    const key = name.toLowerCase()
    const next: Line[] = [{ kind: 'in', text: cmd }]
    if (key in custom) {
      const out = custom[key]
      for (const l of Array.isArray(out) ? out : [out]) next.push({ kind: 'out', text: l })
    } else if (key in builtins) {
      const out = builtins[key]()
      if (out === null) {
        setHistory((h) => [cmd, ...h])
        return
      }
      for (const l of Array.isArray(out) ? out : [out]) next.push({ kind: 'out', text: l })
    } else {
      next.push({ kind: 'err', text: `command not found: ${name}. Type "help".` })
    }
    setLines((l) => [...l, ...next])
    setHistory((h) => [cmd, ...h])
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    run(value)
    setValue('')
    setCursor(-1)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const c = Math.min(cursor + 1, history.length - 1)
      setCursor(c)
      setValue(history[c] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const c = Math.max(cursor - 1, -1)
      setCursor(c)
      setValue(c === -1 ? '' : history[c])
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const all = [...Object.keys(builtins), ...Object.keys(custom)]
      const match = all.find((c) => c.startsWith(value.toLowerCase()))
      if (match) setValue(match)
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  const suggestions = ['help', 'whoami', 'projects', ...Object.keys(custom).slice(0, 2)]

  return (
    <div className="container">
      <SectionHead eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} />
      <Reveal className="terminal">
        <div className="code-bar">
          <i />
          <i />
          <i />
          <span>{section.prompt} — zsh</span>
        </div>
        {/* Clicking anywhere in the screen focuses the prompt — keyboard users reach the input directly. */}
        {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className="terminal-screen" ref={scroller} onClick={() => input.current?.focus()}>
          {lines.map((l, i) => (
            <div key={i} className={`term-line term-${l.kind}`}>
              {l.kind === 'in' && <span className="term-prompt">{section.prompt} ~ %</span>}
              {l.text}
            </div>
          ))}
          <form onSubmit={onSubmit} className="term-line term-input">
            <label htmlFor="term-input" className="term-prompt">
              {section.prompt} ~ %
            </label>
            <input
              id="term-input"
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Terminal input"
            />
          </form>
        </div>
        <div className="terminal-chips">
          {suggestions.map((s) => (
            <button key={s} onClick={() => run(s)}>
              {s}
            </button>
          ))}
        </div>
      </Reveal>
    </div>
  )
}
