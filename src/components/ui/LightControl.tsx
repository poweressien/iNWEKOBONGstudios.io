import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/store/appStore'
import { IconSun } from './Icons'

const PRESETS: { label: string; t: number }[] = [
  { label: 'Dawn', t: 0.12 },
  { label: 'Golden', t: 0.5 },
  { label: 'Dusk', t: 0.88 },
  { label: 'Night', t: 0 },
]

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} className="flex w-full items-center justify-between py-1.5 text-left text-[13px] text-white/80">
      {label}
      <span className={`relative h-5 w-9 rounded-full transition ${on ? 'bg-gold' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

/** Move the sun and watch the tower relight. */
export function LightControl() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const sunT = useApp((s) => s.sunT)
  const sunAuto = useApp((s) => s.sunAuto)
  const orbit = useApp((s) => s.orbit)
  const setSunT = useApp((s) => s.setSunT)
  const setSunAuto = useApp((s) => s.setSunAuto)
  const setOrbit = useApp((s) => s.setOrbit)

  useEffect(() => {
    if (!open) return
    const down = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const key = (e: KeyboardEvent) => e.code === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', down)
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('keydown', key)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Light and motion"
        aria-expanded={open}
        className={`glass-soft flex h-10 w-10 items-center justify-center rounded-full transition hover:border-white/30 ${open || sunAuto ? 'border-gold/60 text-gold' : ''}`}
      >
        <IconSun />
      </button>
      {open && (
        <div className="glass anim-rise absolute right-0 top-12 z-50 w-[264px] rounded-2xl p-4">
          <div className="eyebrow mb-3">Solar position</div>
          <input type="range" className="slider" min={0} max={1} step={0.001} value={sunT} onChange={(e) => setSunT(Number(e.target.value))} aria-label="Sun position" />
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => setSunT(p.t)} className="rounded-full border border-white/12 py-1.5 text-[11.5px] font-medium text-white/75 transition hover:border-white/35 hover:text-white">
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-3 border-t border-white/10 pt-2">
            <Switch on={sunAuto} onChange={setSunAuto} label="Cycle the sun" />
            <Switch on={orbit} onChange={setOrbit} label="Slow orbit" />
          </div>
        </div>
      )}
    </div>
  )
}
