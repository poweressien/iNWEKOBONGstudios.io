import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'

export function InteractionPrompt() {
  const prompt = useGameStore((s) => s.interactionPrompt)
  const phase = useGameStore((s) => s.phase)
  const activePanel = useGameStore((s) => s.activePanel)
  const reducedMotion = useGameStore((s) => s.reducedMotion)

  const visible = phase === 'playing' && !activePanel && !!prompt

  return (
    <div className="pointer-events-none fixed bottom-8 right-6 z-20 sm:bottom-10 sm:right-10">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.16 }}
            className="glass-panel flex items-center gap-2 rounded-full px-4 py-2"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/25 font-mono text-xs font-semibold text-white">
              E
            </span>
            <span className="font-display text-sm tracking-wide text-white/90">{prompt}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
