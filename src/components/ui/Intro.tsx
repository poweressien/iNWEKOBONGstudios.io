import { useApp } from '@/store/appStore'
import { portfolio } from '@/data/portfolio'

/** A quiet title card while the tower powers up. */
export function Intro() {
  const ready = useApp((s) => s.ready)
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end px-6 pb-[13vh] text-center transition-opacity duration-[1400ms] ${ready ? 'opacity-0' : 'opacity-100'}`}
      aria-hidden={ready}
    >
      <div className="anim-fade text-[clamp(22px,4vw,40px)] tracking-tight" style={{ animationDelay: '0.4s' }}>
        <span className="font-semibold">{portfolio.name}</span>
        <span className="font-light text-white/70">{portfolio.domain}</span>
      </div>
      <div className="eyebrow anim-fade mt-4" style={{ animationDelay: '1s' }}>
        {portfolio.role} · {portfolio.location}
      </div>
      <div className="mt-6 h-px w-40 overflow-hidden bg-white/10">
        <div className="h-full w-full origin-left bg-white/70" style={{ animation: 'fade-in 0.4s both, grow 3.4s cubic-bezier(.3,.7,.2,1) both' }} />
      </div>
      <style>{'@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}'}</style>
    </div>
  )
}
