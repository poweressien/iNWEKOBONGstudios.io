import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { audioManager } from '@/lib/audio'
import { portfolio } from '@/data/portfolio'
import { InteractionPrompt } from './InteractionPrompt'
import { AccessibilityMenu } from './AccessibilityMenu'

function CornerButton({ onClick, active, label, children }: { onClick: () => void; active?: boolean; label: string; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`glass-panel flex h-9 w-9 items-center justify-center rounded-full transition ${
        active ? 'text-[#6ea8ff]' : 'text-white/70 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

export function HUD() {
  const phase = useGameStore((s) => s.phase)
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const toggleSound = useGameStore((s) => s.toggleSound)
  const openPanel = useGameStore((s) => s.openPanel)

  if (phase !== 'playing') return null

  const toggleFullscreen = () => {
    audioManager.uiClick()
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen().catch(() => {})
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pointer-events-auto fixed left-4 top-4 sm:left-6 sm:top-6"
      >
        <div className="glass-panel rounded-full px-4 py-2">
          <span className="font-display text-sm font-semibold tracking-wide text-white/90">{portfolio.name}</span>
        </div>
      </motion.div>

      <div className="pointer-events-auto fixed right-4 top-4 flex gap-2 sm:right-6 sm:top-6">
        <CornerButton onClick={() => { toggleSound(); audioManager.unlock() }} active={soundEnabled} label="Toggle sound">
          {soundEnabled ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9v6h4l5 5V4L8 9H4Z" /><path d="M17 8a5 5 0 0 1 0 8" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9v6h4l5 5V4L8 9H4Z" /><path d="m17 9 5 6M22 9l-5 6" /></svg>
          )}
        </CornerButton>
        <CornerButton onClick={toggleFullscreen} label="Toggle fullscreen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
        </CornerButton>
        <CornerButton onClick={() => { audioManager.uiClick(); openPanel('settings') }} label="Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.36.22.75.22 1.15V10.85c.28.14.6.22.94.22H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
        </CornerButton>
      </div>

      <InteractionPrompt />
      <AccessibilityMenu />
    </div>
  )
}
