import { Modal } from './Modal'
import { useGameStore } from '@/store/gameStore'
import { audioManager } from '@/lib/audio'

export function SettingsPanel() {
  const activePanel = useGameStore((s) => s.activePanel)
  const closePanel = useGameStore((s) => s.closePanel)
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const toggleSound = useGameStore((s) => s.toggleSound)
  const reducedMotion = useGameStore((s) => s.reducedMotion)
  const toggleReducedMotion = useGameStore((s) => s.toggleReducedMotion)
  const phase = useGameStore((s) => s.phase)
  const open = activePanel === 'settings'

  const toggleFullscreen = () => {
    audioManager.uiClick()
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen().catch(() => {})
  }

  return (
    <Modal open={open} onClose={closePanel} title={phase === 'playing' ? 'Paused' : 'Settings'} maxWidthClass="max-w-sm">
      <div className="space-y-3">
        <Row label="Sound" value={soundEnabled} onToggle={() => { toggleSound(); audioManager.uiClick() }} />
        <Row label="Reduced motion" value={reducedMotion} onToggle={() => { toggleReducedMotion(); audioManager.uiClick() }} />
        <button
          onClick={toggleFullscreen}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-left text-sm transition hover:bg-white/10"
        >
          Toggle fullscreen
        </button>
      </div>

      <button
        onClick={() => { audioManager.uiClick(); closePanel() }}
        className="mt-5 w-full rounded-lg bg-[#6ea8ff] px-4 py-2 text-sm font-semibold text-[#0a0a12] transition hover:bg-[#8bb9ff]"
      >
        Resume
      </button>
    </Modal>
  )
}

function Row({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition ${value ? 'bg-[#6ea8ff]' : 'bg-white/15'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${value ? 'left-[18px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  )
}
