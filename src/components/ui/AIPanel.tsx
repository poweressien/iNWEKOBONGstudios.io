import { useState } from 'react'
import { Modal } from './Modal'
import { useGameStore } from '@/store/gameStore'
import { portfolio } from '@/data/portfolio'
import { audioManager } from '@/lib/audio'

export function AIPanel() {
  const activePanel = useGameStore((s) => s.activePanel)
  const closePanel = useGameStore((s) => s.closePanel)
  const open = activePanel === 'ai'
  const [lineIndex, setLineIndex] = useState(0)
  const ai = portfolio.aiAssistant

  return (
    <Modal
      open={open}
      onClose={() => {
        audioManager.uiClick()
        closePanel()
        setLineIndex(0)
      }}
      title={ai.name}
      subtitle={ai.tagline}
      maxWidthClass="max-w-md"
    >
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/85">
        {ai.lines[lineIndex % ai.lines.length]}
      </div>
      <button
        onClick={() => {
          audioManager.uiClick()
          setLineIndex((i) => i + 1)
        }}
        className="mt-4 w-full rounded-lg bg-[#6ea8ff] px-4 py-2 text-sm font-semibold text-[#0a0a12] transition hover:bg-[#8bb9ff]"
      >
        Ask {ai.name} something else
      </button>
    </Modal>
  )
}
