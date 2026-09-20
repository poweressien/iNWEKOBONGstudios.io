import { useGame } from '@/store/gameStore'
import { sfx } from '@/game/audio'
import { portfolio } from '@/data/portfolio'
import { LogoMark, IconSoundOn, IconSoundOff } from './Icons'

export function TitleScreen() {
  const ready = useGame((s) => s.ready)
  const touch = useGame((s) => s.touch)
  const sound = useGame((s) => s.sound)
  const setSound = useGame((s) => s.setSound)
  const start = useGame((s) => s.start)

  const play = () => {
    sfx.unlock()
    sfx.setEnabled(sound)
    sfx.click()
    start()
  }

  return (
    <div
      className="anim-fade absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
      style={{
        background: 'radial-gradient(ellipse at 50% 42%, rgba(5,6,15,0.25) 0%, rgba(5,6,15,0.78) 70%)',
        paddingTop: 'var(--safe-t)',
        paddingBottom: 'var(--safe-b)',
      }}
    >
      <div className="anim-float mb-3">
        <LogoMark size={54} />
      </div>
      <div className="font-mono text-[11px] tracking-[0.42em] text-accent/90 sm:text-xs">{portfolio.studio.toUpperCase()}</div>

      <h1 className="font-display text-glow mt-2 text-[clamp(52px,13vw,120px)] font-bold leading-[0.9] tracking-[0.02em] text-white">
        {portfolio.name}
      </h1>

      {/* tri-band accent */}
      <div className="mt-4 flex h-[5px] w-24 overflow-hidden rounded-full" aria-hidden="true">
        <span className="flex-1 bg-[#0a9f5d]" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-[#0a9f5d]" />
      </div>

      <p className="font-display mt-4 text-lg font-semibold tracking-[0.12em] text-white/90 sm:text-2xl">
        {portfolio.headline.toUpperCase()}
      </p>
      <p className="mt-2 max-w-md text-sm text-white/60 sm:text-base">{portfolio.tagline}</p>

      <div className="mt-8 flex flex-col items-center gap-3">
        {ready ? (
          <button
            onClick={play}
            className="btn btn-primary font-display anim-pulse !min-h-[58px] !rounded-full !px-12 !text-[22px] !font-bold tracking-[0.18em]"
            autoFocus
          >
            ▶ PLAY
          </button>
        ) : (
          <div className="flex h-[58px] w-56 flex-col items-center justify-center gap-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-accent to-violet" />
            </div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-white/40">LOADING</span>
          </div>
        )}

        <button
          onClick={() => setSound(!sound)}
          className="chip !min-h-[34px] hover:bg-white/10"
          aria-pressed={sound}
          aria-label="Toggle sound"
        >
          {sound ? <IconSoundOn size={15} /> : <IconSoundOff size={15} />}
          Sound {sound ? 'on' : 'off'}
        </button>
      </div>

      <div className="mt-8 flex max-w-lg flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/55">
        {touch ? (
          <>
            <span>Drag anywhere to move</span>
            <span>Tap ⚡ to dash</span>
            <span>Tap the glowing button to interact</span>
          </>
        ) : (
          <>
            <span>
              <span className="kbd">W</span> <span className="kbd">A</span> <span className="kbd">S</span> <span className="kbd">D</span> move
            </span>
            <span>
              <span className="kbd">Shift</span> dash
            </span>
            <span>
              <span className="kbd">E</span> interact
            </span>
            <span>Click to walk</span>
          </>
        )}
      </div>
    </div>
  )
}
