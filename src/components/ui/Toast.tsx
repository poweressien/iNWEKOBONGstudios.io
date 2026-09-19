import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'

export function Toast() {
  const message = useGameStore((s) => s.toastMessage)
  const reducedMotion = useGameStore((s) => s.reducedMotion)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-30 flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.22 }}
            className="glass-panel max-w-md rounded-xl px-5 py-3 text-center text-sm text-white/90 shadow-lg"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
