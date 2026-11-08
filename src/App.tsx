import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useCallback, useState } from 'react'
import { BackToTop, CursorGlow, Footer, Nav, ScrollProgress, ShowcaseDock } from './components/Chrome'
import { CommandPalette } from './components/CommandPalette'
import { Hero } from './components/Hero'
import { features } from './core/registry'
import { StoreProvider, useStore } from './core/store'
import { ui } from './core/ui'
import { Sections } from './sections'

function Page() {
  const { persona } = useStore()
  const [toast, setToast] = useState<string | null>(null)
  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }, [])

  return (
    // `key` remounts the page when switching personas in showcase mode.
    <div className="site" key={persona.id}>
      <a href="#main" className="skip-link">
        {ui.skip}
      </a>
      <ScrollProgress />
      <CursorGlow />
      {features.grain && <div className="grain" aria-hidden="true" />}
      <Nav />
      <main id="main">
        <Hero />
        <Sections sections={persona.sections} />
      </main>
      <Footer />
      <BackToTop />
      <ShowcaseDock />
      <CommandPalette onToast={showToast} />
      <AnimatePresence>
        {toast && (
          <motion.div className="toast" role="status" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion={features.animations ? 'user' : 'always'}>
      <StoreProvider>
        <Page />
      </StoreProvider>
    </MotionConfig>
  )
}
