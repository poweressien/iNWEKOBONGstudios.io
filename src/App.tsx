import { useEffect } from 'react'
import { GameCanvas } from '@/components/GameCanvas'
import { TitleScreen } from '@/components/ui/TitleScreen'
import { HUD } from '@/components/ui/HUD'
import { TouchControls } from '@/components/ui/TouchControls'
import { Toasts } from '@/components/ui/Toasts'
import { Panels } from '@/components/ui/Panels'
import { useGame } from '@/store/gameStore'
import { sfx } from '@/game/audio'

export default function App() {
  const phase = useGame((s) => s.phase)
  const sound = useGame((s) => s.sound)
  const warping = useGame((s) => s.warping)
  const reduced = useGame((s) => s.reducedMotion)

  useEffect(() => {
    sfx.setEnabled(sound)
    sfx.ambient(sound && phase === 'playing')
  }, [sound, phase])

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduced)
  }, [reduced])

  // Ready as soon as the display font is in (or after a short timeout — never block on it).
  useEffect(() => {
    let done = false
    const go = () => {
      if (done) return
      done = true
      useGame.getState().setReady()
    }
    const t = setTimeout(go, 1200)
    Promise.all([document.fonts?.load('700 20px Rajdhani'), document.fonts?.load('600 14px Rajdhani')])
      .then(() => {
        clearTimeout(t)
        go()
      })
      .catch(go)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden bg-void">
      <GameCanvas />

      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(2,3,10,0.7) 100%)' }}
      />

      {phase === 'playing' && <HUD />}
      <TouchControls />
      <Toasts />
      <Panels />
      {phase !== 'playing' && <TitleScreen />}

      {/* warp flash */}
      <div
        className="pointer-events-none absolute inset-0 z-[60] transition-opacity duration-300"
        style={{
          opacity: warping ? 1 : 0,
          background: 'radial-gradient(circle at center, #ffffff 0%, #7fd0ff 25%, #5a4bff 60%, #05060f 100%)',
        }}
      />
    </div>
  )
}
