import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'

export function WarpFlash() {
  const warping = useGameStore((s) => s.warping)
  const reducedMotion = useGameStore((s) => s.reducedMotion)

  return (
    <AnimatePresence>
      {warping && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.25 }}
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(110,168,255,0.65) 35%, rgba(5,3,10,0.98) 80%)',
          }}
        />
      )}
    </AnimatePresence>
  )
}
