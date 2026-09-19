import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { audioManager } from '@/lib/audio'
import { portfolio } from '@/data/portfolio'

export function IntroOverlay() {
  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)
  const isMobile = useGameStore((s) => s.isMobile)

  if (phase !== 'intro') return null

  const handleExplore = () => {
    audioManager.unlock()
    audioManager.uiClick()
    // Requested synchronously inside this click handler so the browser counts
    // it as a genuine user gesture, rather than relying solely on the effect
    // in Player.tsx that reacts to the phase change a tick later.
    if (!isMobile) {
      document.querySelector('canvas')?.requestPointerLock()
    }
    setPhase('playing')
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 px-6 text-center backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <div className="font-mono text-xs tracking-[0.35em] text-[#6ea8ff]">{portfolio.name.toUpperCase()}</div>
        <h1 className="font-display mt-3 text-4xl font-semibold text-white sm:text-5xl">WELCOME TO MY UNIVERSE</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="glass-panel mt-8 rounded-2xl px-6 py-5"
      >
        {isMobile ? (
          <div className="space-y-1.5 text-sm text-white/80">
            <div>Left stick — Move</div>
            <div>Drag right side — Look</div>
            <div>Tap the button — Interact</div>
          </div>
        ) : (
          <div className="space-y-1.5 text-sm text-white/80">
            <div>WASD — Move</div>
            <div>Mouse — Look</div>
            <div>E — Interact</div>
            <div>Esc — Pause</div>
          </div>
        )}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleExplore}
        className="mt-8 rounded-full bg-[#6ea8ff] px-8 py-3 font-display text-sm font-semibold tracking-wide text-[#05050b] shadow-[0_0_40px_rgba(110,168,255,0.35)] transition hover:bg-[#8bb9ff]"
      >
        EXPLORE
      </motion.button>
    </motion.div>
  )
}
