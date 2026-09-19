import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  maxWidthClass?: string
}

export function Modal({ open, onClose, title, subtitle, children, maxWidthClass = 'max-w-lg' }: ModalProps) {
  const reducedMotion = useGameStore((s) => s.reducedMotion)
  const transition = reducedMotion ? { duration: 0.01 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
        >
          <div className="absolute inset-0 bg-black/55" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`glass-panel relative w-full ${maxWidthClass} max-h-[85vh] overflow-y-auto rounded-2xl p-6 text-white shadow-2xl`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={transition}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold">{title}</h2>
                {subtitle && <p className="mt-0.5 text-sm text-white/60">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Esc
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
