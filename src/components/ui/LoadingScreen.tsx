import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { portfolio } from '@/data/portfolio'

const DISPLAY_MS = 1500

export function LoadingScreen() {
  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)
  const [displayed, setDisplayed] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (phase !== 'loading') return
    let raf: number
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t
      const elapsed = t - startRef.current
      const pct = Math.min(100, (elapsed / DISPLAY_MS) * 100)
      setDisplayed(pct)
      if (pct >= 100) {
        setPhase('intro')
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, setPhase])

  if (phase !== 'loading') return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05050b]"
      exit={{ opacity: 0 }}
    >
      <div className="font-display text-sm tracking-[0.3em] text-white/50">{portfolio.name.toUpperCase()}</div>
      <div className="mt-3 font-display text-2xl font-semibold text-white">INITIALIZING UNIVERSE</div>
      <div className="mt-8 h-[3px] w-64 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6ea8ff] to-[#a685ff]"
          style={{ width: `${displayed}%` }}
        />
      </div>
      <div className="mt-3 font-mono text-xs text-white/40">{Math.round(displayed)}%</div>
    </motion.div>
  )
}
