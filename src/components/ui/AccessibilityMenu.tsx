import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { audioManager } from '@/lib/audio'

export function AccessibilityMenu() {
  const open = useGameStore((s) => s.accessibilityMenuOpen)
  const setOpen = useGameStore((s) => s.setAccessibilityMenuOpen)
  const openPanel = useGameStore((s) => s.openPanel)
  const reducedMotion = useGameStore((s) => s.reducedMotion)

  const items: { label: string; action: () => void }[] = [
    { label: 'About', action: () => openPanel('about') },
    { label: 'Projects', action: () => openPanel('projects-list') },
    { label: 'Contact', action: () => openPanel('contact') },
    { label: 'GitHub', action: () => openPanel('github') },
  ]

  return (
    <div className="pointer-events-auto fixed bottom-4 left-4 z-30">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.18 }}
            className="glass-panel mb-2 w-52 rounded-xl p-2"
          >
            <div className="px-2 pb-1.5 pt-1 text-[11px] uppercase tracking-wider text-white/40">Quick navigation</div>
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  audioManager.uiClick()
                  item.action()
                  setOpen(false)
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/10"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => { audioManager.uiClick(); setOpen(!open) }}
        aria-label="Accessibility quick navigation"
        className="glass-panel flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:text-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="4" r="1.6" fill="currentColor" stroke="none" />
          <path d="M4 8h16M12 8v5m0 0-4 8m4-8 4 8" />
        </svg>
      </button>
    </div>
  )
}
