import { useGame } from '@/store/gameStore'
import { levelInfo, TOTAL_LANDMARKS, TOTAL_ORBS } from '@/game/progress'
import { portfolio } from '@/data/portfolio'
import { sfx } from '@/game/audio'
import { LogoMark, IconMap, IconMenu, IconSoundOn, IconSoundOff, IconFullscreen, IconMail } from './Icons'

function IconBtn({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        sfx.click()
        onClick()
      }}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`hud-chip flex h-11 w-11 items-center justify-center transition hover:bg-white/10 active:scale-95 ${active ? 'text-accent' : 'text-white/85'}`}
    >
      {children}
    </button>
  )
}

export function HUD() {
  const xp = useGame((s) => s.xp)
  const visited = useGame((s) => s.visited.length)
  const orbs = useGame((s) => s.orbs.length)
  const moved = useGame((s) => s.moved)
  const focus = useGame((s) => s.focus)
  const touch = useGame((s) => s.touch)
  const panel = useGame((s) => s.panel)
  const sound = useGame((s) => s.sound)
  const setSound = useGame((s) => s.setSound)
  const openPanel = useGame((s) => s.openPanel)

  const lv = levelInfo(xp)

  let objective: string
  if (!moved) objective = touch ? 'Drag anywhere to move' : 'Move with WASD or click to walk'
  else if (visited < TOTAL_LANDMARKS) objective = `Discover landmarks  ${visited}/${TOTAL_LANDMARKS} — follow the arrow`
  else if (orbs < TOTAL_ORBS) objective = `Collect skill orbs  ${orbs}/${TOTAL_ORBS}`
  else objective = 'Everything found. Say hi to OBI — or hire me.'

  const canFullscreen = typeof document !== 'undefined' && document.fullscreenEnabled
  const toggleFs = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen().catch(() => {})
  }

  return (
    <>
      {/* top-left: identity, level, objective */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-20 p-3 sm:p-5"
        style={{ paddingTop: 'calc(var(--safe-t) + 12px)', paddingLeft: 'calc(var(--safe-l) + 12px)' }}
      >
        <div className="hud-chip pointer-events-auto flex w-fit items-center gap-2 py-1.5 pl-2 pr-4">
          <LogoMark size={26} />
          <span className="font-display text-lg font-bold tracking-wide">{portfolio.name}</span>
        </div>
        <div className="hud-chip mt-2 w-[228px] !rounded-2xl px-3 py-2 sm:w-[264px]">
          <div className="font-display flex items-baseline justify-between text-sm font-semibold tracking-wide">
            <span>
              LV {lv.level} <span className="text-white/55">· {lv.title}</span>
            </span>
            <span className="font-mono text-[11px] text-white/50">{xp} XP</span>
          </div>
          <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-violet transition-[width] duration-500"
              style={{ width: `${Math.round(lv.pct * 100)}%` }}
            />
          </div>
          <div className="mt-1.5 text-[11px] leading-snug text-white/70">{objective}</div>
        </div>
      </div>

      {/* top-right: buttons */}
      <div
        className="absolute right-0 top-0 z-20 flex items-center gap-2 p-3 sm:p-5"
        style={{ paddingTop: 'calc(var(--safe-t) + 12px)', paddingRight: 'calc(var(--safe-r) + 12px)' }}
      >
        <button
          onClick={() => {
            sfx.click()
            openPanel('contact')
          }}
          className="hud-chip font-display hidden h-11 items-center gap-2 !rounded-full bg-gradient-to-r from-mint/25 to-accent/20 px-4 text-[15px] font-bold tracking-wider text-white transition hover:brightness-125 sm:flex"
        >
          <IconMail size={17} /> HIRE ME
        </button>
        <IconBtn label="Map & fast travel (M)" onClick={() => openPanel('map')} active={panel === 'map'}>
          <IconMap />
        </IconBtn>
        <IconBtn label={sound ? 'Mute sound' : 'Unmute sound'} onClick={() => setSound(!sound)}>
          {sound ? <IconSoundOn /> : <IconSoundOff />}
        </IconBtn>
        {canFullscreen && !touch && (
          <IconBtn label="Fullscreen" onClick={toggleFs}>
            <IconFullscreen />
          </IconBtn>
        )}
        <IconBtn label="Menu (Esc)" onClick={() => openPanel('menu')} active={panel === 'menu'}>
          <IconMenu />
        </IconBtn>
      </div>

      {/* desktop interaction prompt */}
      {!touch && !panel && focus && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-8" style={{ paddingBottom: 'calc(var(--safe-b) + 28px)' }}>
          <div className="anim-toast hud-chip flex items-center gap-3 py-2 pl-2.5 pr-5">
            <span className="kbd">E</span>
            <span className="font-display text-[17px] font-semibold tracking-wide">{focus.prompt}</span>
          </div>
        </div>
      )}
    </>
  )
}
