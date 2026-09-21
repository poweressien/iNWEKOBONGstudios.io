import { useEffect } from 'react'
import { useApp } from '@/store/appStore'
import { levels } from '@/data/levels'
import { IconBack, IconPause, IconPlay, IconClose } from './Icons'

const STEP_MS = 8000

/** Guided tour: the camera visits each level in turn with a short caption. */
export function TourCard() {
  const tour = useApp((s) => s.tour)
  const tourGo = useApp((s) => s.tourGo)
  const tourPause = useApp((s) => s.tourPause)
  const endTour = useApp((s) => s.endTour)
  const open = useApp((s) => s.open)
  const last = levels.length - 1

  useEffect(() => {
    if (!tour.active || tour.paused || tour.step >= last) return
    const id = setTimeout(() => tourGo(tour.step + 1), STEP_MS)
    return () => clearTimeout(id)
  }, [tour.active, tour.paused, tour.step, last, tourGo])

  if (!tour.active) return null
  const lv = levels[tour.step]
  const ctl = 'flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white disabled:opacity-30'

  return (
    <div className="anim-rise fixed inset-x-3 bottom-3 z-40 min-[900px]:inset-x-auto min-[900px]:bottom-8 min-[900px]:left-1/2 min-[900px]:w-[520px] min-[900px]:-translate-x-1/2" style={{ paddingBottom: 'var(--safe-b)' }}>
      <div className="glass overflow-hidden rounded-[20px]">
        <div className="h-[2px] w-full bg-white/10">
          {!(tour.step >= last) && (
            <div key={`${tour.step}-${tour.paused}`} className="h-full origin-left bg-gold" style={{ animation: `grow ${STEP_MS}ms linear both`, animationPlayState: tour.paused ? 'paused' : 'running' }} />
          )}
        </div>
        <div className="p-5">
          <div className="eyebrow !text-gold">
            Tour · {String(tour.step + 1).padStart(2, '0')} / {String(levels.length).padStart(2, '0')} · {lv.label}
          </div>
          <h3 className="mt-1.5 text-[22px] font-semibold tracking-tight">{lv.title}</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-white/70">{lv.tour}</p>
          <div className="mt-4 flex items-center gap-2">
            <button className={ctl} onClick={() => tourGo(tour.step - 1)} disabled={tour.step === 0} aria-label="Previous">
              <IconBack />
            </button>
            <button className={ctl} onClick={() => tourPause(!tour.paused)} aria-label={tour.paused ? 'Resume' : 'Pause'}>
              {tour.paused ? <IconPlay size={14} /> : <IconPause size={14} />}
            </button>
            {tour.step < last ? (
              <button className="btn btn-primary ml-auto" onClick={() => tourGo(tour.step + 1)}>
                Next
              </button>
            ) : (
              <button className="btn btn-primary ml-auto" onClick={() => open('signal')}>
                Get in touch
              </button>
            )}
            <button className={ctl} onClick={endTour} aria-label="End tour">
              <IconClose size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
