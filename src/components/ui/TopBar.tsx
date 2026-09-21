import { useEffect, useState } from 'react'
import { useApp } from '@/store/appStore'
import { ambience } from '@/lib/audio'
import { portfolio } from '@/data/portfolio'
import { Monolith, IconChat, IconSoundOn, IconSoundOff, IconPlay, IconSearch } from './Icons'
import { LightControl } from './LightControl'

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

function LocalTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20000)
    return () => clearInterval(id)
  }, [])
  const t = now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' })
  return (
    <p className="eyebrow mt-2 flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
      {portfolio.location} · {t} WAT
    </p>
  )
}

const btn = 'glass-soft flex h-10 items-center justify-center gap-2 rounded-full text-[13px] font-medium transition hover:border-white/30'

export function Hud() {
  const ready = useApp((s) => s.ready)
  const sound = useApp((s) => s.sound)
  const panel = useApp((s) => s.panel)
  const tourOn = useApp((s) => s.tour.active)
  const setSound = useApp((s) => s.setSound)
  const open = useApp((s) => s.open)
  const close = useApp((s) => s.close)
  const startTour = useApp((s) => s.startTour)
  const setPalette = useApp((s) => s.setPalette)
  const shift = usePanelShift()

  const toggleSound = () => {
    ambience.setOn(!sound)
    setSound(!sound)
  }

  return (
    <div className={`transition-opacity duration-1000 ${ready ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
      <div className="absolute left-0 top-0 z-30 flex items-center gap-2.5 p-4 min-[900px]:p-7" style={{ paddingTop: 'calc(var(--safe-t) + 18px)', paddingLeft: 'calc(var(--safe-l) + 18px)' }}>
        <button onClick={close} className="flex items-center gap-2.5 text-left" aria-label={`${portfolio.name}${portfolio.domain}`}>
          <Monolith />
          <span className="text-[15px] tracking-tight">
            <span className="font-semibold">{portfolio.name}</span>
            <span className="hidden font-light text-white/70 min-[520px]:inline">{portfolio.domain}</span>
          </span>
        </button>
      </div>

      <div
        className="absolute top-0 z-30 flex items-center gap-2 p-4 transition-[right] duration-500 min-[900px]:p-7"
        style={{ right: shift, paddingTop: 'calc(var(--safe-t) + 14px)', paddingRight: 'calc(var(--safe-r) + 18px)' }}
      >
        <button onClick={() => (tourOn ? useApp.getState().endTour() : startTour())} aria-label="Guided tour" className={`${btn} w-10 ${shift ? '' : 'min-[900px]:w-auto min-[900px]:px-4'} ${tourOn ? 'border-gold/60 text-gold' : ''}`}>
          <IconPlay size={14} />
          <span className={`hidden ${shift ? '' : 'min-[900px]:inline'}`}>{tourOn ? 'Stop tour' : 'Tour'}</span>
        </button>
        <button onClick={() => setPalette(true)} aria-label="Search and commands" className={`${btn} hidden ${shift ? 'w-10' : 'px-3.5'} min-[900px]:flex`}>
          <IconSearch size={15} />
          {!shift && <span className="kbd">Ctrl K</span>}
        </button>
        <LightControl />
        <button onClick={() => open('concierge')} aria-label="Concierge" className={`${btn} w-10 ${shift ? '' : 'min-[900px]:w-auto min-[900px]:px-4'} ${panel === 'concierge' ? 'border-gold/60 text-gold' : ''}`}>
          <IconChat size={16} />
          <span className={`hidden ${shift ? '' : 'min-[900px]:inline'}`}>{portfolio.concierge.name}</span>
        </button>
        <button onClick={toggleSound} aria-label={sound ? 'Mute ambience' : 'Play ambience'} aria-pressed={sound} className={`${btn} w-10`}>
          {sound ? <IconSoundOn size={16} /> : <IconSoundOff size={16} />}
        </button>
      </div>

      <div className={`pointer-events-none absolute bottom-0 left-0 z-20 hidden max-w-[560px] p-8 transition-opacity duration-500 min-[900px]:block ${panel || tourOn ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-[19px] font-light leading-snug tracking-tight text-white/90">{portfolio.headline}</p>
        <p className="eyebrow mt-4">Drag to orbit · Scroll to zoom · Click the beacon</p>
        <LocalTime />
      </div>
    </div>
  )
}
