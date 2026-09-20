import { useEffect, useState } from 'react'
import { useApp } from '@/store/appStore'
import { ambience } from '@/lib/audio'
import { portfolio } from '@/data/portfolio'
import { levels } from '@/data/levels'
import { Monolith, IconChat, IconSoundOn, IconSoundOff } from './Icons'

/** Width the open panel takes on desktop, so HUD elements can step aside. */
export function usePanelShift() {
  const open = useApp((s) => s.panel !== null)
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1200 : window.innerWidth))
  useEffect(() => {
    const on = () => setW(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return open && w >= 900 ? Math.min(540, w * 0.46) + 32 : 0
}

export function Hud() {
  const ready = useApp((s) => s.ready)
  const sound = useApp((s) => s.sound)
  const panel = useApp((s) => s.panel)
  const setSound = useApp((s) => s.setSound)
  const open = useApp((s) => s.open)
  const close = useApp((s) => s.close)
  const shift = usePanelShift()

  const toggleSound = () => {
    ambience.setOn(!sound)
    setSound(!sound)
  }

  return (
    <div className={`transition-opacity duration-1000 ${ready ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
      <div
        className="absolute left-0 top-0 z-30 flex items-center gap-2.5 p-4 min-[900px]:p-7"
        style={{ paddingTop: 'calc(var(--safe-t) + 18px)', paddingLeft: 'calc(var(--safe-l) + 18px)' }}
      >
        <button onClick={close} className="flex items-center gap-2.5 text-left" aria-label={`${portfolio.name}${portfolio.domain}`}>
          <Monolith />
          <span className="text-[15px] tracking-tight">
            <span className="font-semibold">{portfolio.name}</span>
            <span className="font-light text-white/70">{portfolio.domain}</span>
          </span>
        </button>
      </div>

      <div
        className="absolute top-0 z-30 flex items-center gap-2 p-4 transition-[right] duration-500 min-[900px]:p-7"
        style={{ right: shift, paddingTop: 'calc(var(--safe-t) + 14px)', paddingRight: 'calc(var(--safe-r) + 18px)' }}
      >
        <button
          onClick={() => open('concierge')}
          className={`glass-soft flex h-10 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium transition hover:border-white/30 min-[900px]:px-4 ${panel === 'concierge' ? 'border-gold/60 text-gold' : ''}`}
        >
          <IconChat size={16} />
          <span className="hidden min-[520px]:inline">{portfolio.concierge.name}</span>
        </button>
        <button onClick={toggleSound} aria-label={sound ? 'Mute ambience' : 'Play ambience'} aria-pressed={sound} className="glass-soft flex h-10 w-10 items-center justify-center rounded-full transition hover:border-white/30">
          {sound ? <IconSoundOn size={16} /> : <IconSoundOff size={16} />}
        </button>
      </div>

      {/* bottom-left statement + hint (desktop, no panel) */}
      <div className={`pointer-events-none absolute bottom-0 left-0 z-20 hidden max-w-[420px] p-8 transition-opacity duration-500 min-[900px]:block ${panel ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-[19px] font-light leading-snug tracking-tight text-white/90">{portfolio.headline}</p>
        <p className="eyebrow mt-4">Drag to orbit · Scroll to zoom</p>
      </div>
      <span className="sr-only">
        {levels.map((l) => l.title).join(', ')}
      </span>
    </div>
  )
}
