import { animate, motion, useInView, useReducedMotion } from 'motion/react'
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { features } from '../core/registry'

const lines = (s: string) =>
  s.split('\n').map((line, i, all) => (
    <Fragment key={i}>
      {line}
      {i < all.length - 1 && <br />}
    </Fragment>
  ))

/** Renders `*highlight*` as <em> and `\n` as line breaks. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, j) =>
        part.length > 2 && part.startsWith('*') && part.endsWith('*') ? (
          <em key={j}>{lines(part.slice(1, -1))}</em>
        ) : (
          <Fragment key={j}>{lines(part)}</Fragment>
        ),
      )}
    </>
  )
}

/** Fade-and-rise on first scroll into view. Disabled by reduced motion or VITE_FEATURE_ANIMATIONS=false. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'article' | 'header'
}) {
  const reduce = useReducedMotion()
  if (!features.animations || reduce) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </M>
  )
}

export function SectionHead({ eyebrow, title, intro, index }: { eyebrow?: string; title: string; intro?: string; index?: number }) {
  return (
    <Reveal as="header" className="section-head">
      {(eyebrow || index !== undefined) && (
        <span className="eyebrow">
          {index !== undefined && <b>{String(index).padStart(2, '0')}</b>}
          {eyebrow}
        </span>
      )}
      <h2>
        <Rich text={title} />
      </h2>
      {intro && <p className="lead">{intro}</p>}
    </Reveal>
  )
}

/** Counts up from 0 when scrolled into view. */
export function Counter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce || !features.animations ? value : 0)
  useEffect(() => {
    if (!inView || reduce || !features.animations) return
    const controls = animate(0, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) })
    return () => controls.stop()
  }, [inView, value, reduce])
  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString('en')}
      {suffix}
    </span>
  )
}

/* ------------------------------ Generative art ----------------------------- */

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Deterministic SVG cover: mesh-gradient blobs, a grid and one bold shape. No image files needed. */
export function Artwork({ seed, palette = ['#7c3aed', '#22d3ee', '#0b1020'], label }: { seed: number; palette?: string[]; label?: string }) {
  const art = useMemo(() => {
    const r = mulberry32(seed)
    const [a, b, bg] = [palette[0], palette[1] ?? palette[0], palette[2] ?? '#0b0b0f']
    const blobs = Array.from({ length: 4 }, (_, i) => ({
      cx: 80 + r() * 640,
      cy: 60 + r() * 380,
      rad: 140 + r() * 220,
      fill: i % 2 ? a : b,
      o: 0.55 + r() * 0.4,
    }))
    const shape = Math.floor(r() * 4)
    const sx = 260 + r() * 280
    const sy = 150 + r() * 200
    const size = 90 + r() * 70
    const rot = Math.floor(r() * 90)
    return { a, b, bg, blobs, shape, sx, sy, size, rot }
  }, [seed, palette])
  const id = `art-${seed}`
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="artwork" role="img" aria-label={label ?? 'Abstract cover art'}>
      <defs>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="70" />
        </filter>
        <filter id={`${id}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0" />
        </filter>
        <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#fff" strokeOpacity=".07" />
        </pattern>
      </defs>
      <rect width="800" height="500" fill={art.bg} />
      <g filter={`url(#${id}-blur)`}>
        {art.blobs.map((bl, i) => (
          <circle key={i} cx={bl.cx} cy={bl.cy} r={bl.rad} fill={bl.fill} opacity={bl.o} />
        ))}
      </g>
      <rect width="800" height="500" fill={`url(#${id}-grid)`} />
      <g transform={`translate(${art.sx} ${art.sy}) rotate(${art.rot})`} fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="2">
        {art.shape === 0 && <circle r={art.size} />}
        {art.shape === 1 && <rect x={-art.size} y={-art.size} width={art.size * 2} height={art.size * 2} rx="18" />}
        {art.shape === 2 && <path d={`M0 ${-art.size} L${art.size} ${art.size * 0.8} L${-art.size} ${art.size * 0.8}Z`} />}
        {art.shape === 3 && (
          <>
            <circle r={art.size} />
            <circle r={art.size * 0.6} />
            <circle r={art.size * 0.2} fill="#fff" />
          </>
        )}
      </g>
      <rect width="800" height="500" filter={`url(#${id}-grain)`} />
    </svg>
  )
}

export function Initials({ name, className }: { name: string; className?: string }) {
  const letters = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <span className={`initials ${className ?? ''}`} aria-hidden="true">
      {letters}
    </span>
  )
}

/** Cycles through words with a vertical slide. */
export function Rotator({ words, interval = 2400 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (words.length < 2 || reduce) return
    const t = setInterval(() => setI((v) => (v + 1) % words.length), interval)
    return () => clearInterval(t)
  }, [words.length, interval, reduce])
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '')
  return (
    <span className="rotator" aria-live="polite">
      <span className="rotator-sizer" aria-hidden="true">
        {longest}
      </span>
      {words.map((w, j) => (
        <span key={w} className="rotator-word" data-active={i === j} aria-hidden={i !== j}>
          {w}
        </span>
      ))}
    </span>
  )
}
