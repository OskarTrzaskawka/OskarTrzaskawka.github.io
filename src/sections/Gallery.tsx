import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Reveal, SectionHead } from '../components/primitives'
import { asset } from '../core/define'
import type { GalleryItem, GallerySection } from '../core/types'
import { ui } from '../core/ui'

function Lightbox({ items, index, onClose, onIndex }: { items: GalleryItem[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const item = items[index]
  const prev = useCallback(() => onIndex((index - 1 + items.length) % items.length), [index, items.length, onIndex])
  const next = useCallback(() => onIndex((index + 1) % items.length), [index, items.length, onIndex])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])
  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <button className="icon-btn lb-close" onClick={onClose} aria-label={ui.close} autoFocus>
        <X className="size-5" />
      </button>
      <button className="icon-btn lb-nav lb-prev" onClick={prev} aria-label={ui.previous}>
        <ChevronLeft className="size-5" />
      </button>
      <motion.figure
        key={item.src}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80) next()
          else if (info.offset.x > 80) prev()
        }}
      >
        <img src={asset(item.src)} alt={item.alt} width={item.width} height={item.height} draggable={false} />
        <figcaption>
          <span>{item.caption ?? item.alt}</span>
          {item.exif && <small>{item.exif}</small>}
          <small>
            {index + 1} / {items.length}
          </small>
        </figcaption>
      </motion.figure>
      <button className="icon-btn lb-nav lb-next" onClick={next} aria-label={ui.next}>
        <ChevronRight className="size-5" />
      </button>
    </motion.div>
  )
}

export function Gallery({ section, index }: { section: GallerySection; index: number }) {
  const [filter, setFilter] = useState<string | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const categories = useMemo(() => [...new Set(section.items.map((i) => i.category).filter(Boolean))] as string[], [section.items])
  const items = filter ? section.items.filter((i) => i.category === filter) : section.items
  const close = useCallback(() => setOpen(null), [])

  return (
    <div className="container wide">
      <SectionHead eyebrow={section.eyebrow} title={section.title} intro={section.intro} index={index} />
      <LayoutGroup>
        {section.filters && categories.length > 1 && (
          <Reveal className="chips">
            {[null, ...categories].map((c) => (
              <button key={c ?? 'all'} data-active={filter === c} onClick={() => setFilter(c)}>
                {filter === c && <motion.i layoutId="chip-gallery" className="chip-pill" />}
                <span>{c ?? ui.all}</span>
              </button>
            ))}
          </Reveal>
        )}
        <div className={`gallery gallery-${section.layout ?? 'masonry'}`}>
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.button
                layout
                key={item.src}
                className="gallery-item"
                onClick={() => setOpen(i)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -5% 0px' }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                style={{ aspectRatio: `${item.width} / ${item.height}` }}
                aria-label={item.alt}
              >
                <img src={asset(item.src)} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" />
                <span className="gallery-caption">
                  <span>{item.caption ?? item.alt}</span>
                  {item.category && <small>{item.category}</small>}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>
      <AnimatePresence>{open !== null && <Lightbox items={items} index={open} onClose={close} onIndex={setOpen} />}</AnimatePresence>
    </div>
  )
}
