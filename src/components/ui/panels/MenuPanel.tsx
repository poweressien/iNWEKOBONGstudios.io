import { useState } from 'react'
import { Panel, Tabs } from '../Panel'
import { useGame } from '@/store/gameStore'
import { TROPHIES, levelInfo, LEVELS } from '@/game/progress'
import { IconCheck, IconTrophy } from '../Icons'

type Tab = 'menu' | 'trophies' | 'help'

function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:bg-white/[0.08]"
    >
      <span>
        <span className="font-display block text-[17px] font-bold tracking-wide">{label}</span>
        {hint && <span className="block text-xs text-white/50">{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-accent' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

export default function MenuPanel() {
  const [tab, setTab] = useState<Tab>('menu')
  const [confirm, setConfirm] = useState(false)
  const s = useGame()
  const lv = levelInfo(s.xp)
  const closePanel = useGame((st) => st.closePanel)
  const canFs = typeof document !== 'undefined' && document.fullscreenEnabled && !s.touch

  return (
    <Panel title="Menu" kicker={`LEVEL ${lv.level} · ${lv.title.toUpperCase()}`} accent="#9b7bff">
      <Tabs
        accent="#9b7bff"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'menu', label: 'SETTINGS' },
          { id: 'trophies', label: `TROPHIES ${s.trophies.length}/${TROPHIES.length}` },
          { id: 'help', label: 'HELP' },
        ]}
      />

      {tab === 'menu' && (
        <div className="space-y-2.5">
          <button className="btn btn-primary w-full !min-h-[48px]" onClick={closePanel}>
            Resume
          </button>
          <Toggle on={s.sound} onChange={s.setSound} label="Sound" hint="Synth effects & ambient hum — nothing to download" />
          <Toggle on={s.reducedMotion} onChange={s.setReducedMotion} label="Reduce motion" hint="Calmer UI animation, no screen shake" />

          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="font-display text-[17px] font-bold tracking-wide">Graphics</div>
            <div className="mb-2 text-xs text-white/50">Auto lowers resolution on slow devices to keep it smooth.</div>
            <div className="grid grid-cols-3 gap-2">
              {(['auto', 'high', 'low'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => s.setQuality(q)}
                  aria-pressed={s.quality === q}
                  className={`font-display rounded-lg border py-2 text-sm font-bold uppercase tracking-widest transition ${
                    s.quality === q ? 'border-violet/70 bg-violet/25 text-white' : 'border-white/12 bg-white/5 text-white/65 hover:bg-white/10'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {canFs && (
            <button
              className="btn w-full"
              onClick={() => {
                if (document.fullscreenElement) void document.exitFullscreen()
                else void document.documentElement.requestFullscreen().catch(() => {})
              }}
            >
              Toggle fullscreen
            </button>
          )}

          {!confirm ? (
            <button className="btn w-full !text-white/60" onClick={() => setConfirm(true)}>
              Reset progress
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-pink/40 bg-pink/10 p-3">
              <span className="flex-1 text-sm">Erase XP, orbs and trophies?</span>
              <button className="btn !min-h-[38px] !px-3" onClick={() => setConfirm(false)}>
                Cancel
              </button>
              <button
                className="btn !min-h-[38px] !border-pink/60 !bg-pink/30 !px-3"
                onClick={() => {
                  s.resetProgress()
                  setConfirm(false)
                }}
              >
                Erase
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'trophies' && (
        <div>
          <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-lg font-bold">
                LV {lv.level} · {lv.title}
              </span>
              <span className="font-mono text-xs text-white/55">
                {s.xp} XP{!lv.max && ` · next at ${LEVELS[lv.level].at}`}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-accent to-violet" style={{ width: `${Math.round(lv.pct * 100)}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            {TROPHIES.map((t) => {
              const got = s.trophies.includes(t.id)
              const val = Math.min(t.target, t.value(s))
              return (
                <div key={t.id} className={`flex items-center gap-3 rounded-xl border p-3 ${got ? 'border-gold/50 bg-gold/10' : 'border-white/10 bg-white/[0.03]'}`}>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${got ? 'bg-gold/25 text-gold' : 'bg-white/5 text-white/30'}`}>
                    {got ? <IconTrophy size={20} /> : <IconTrophy size={20} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`font-display block text-[17px] font-bold leading-tight ${got ? '' : 'text-white/75'}`}>{t.name}</span>
                    <span className="block text-xs text-white/50">{t.desc}</span>
                    {!got && (
                      <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/10">
                        <span className="block h-full rounded-full bg-accent/80" style={{ width: `${(val / t.target) * 100}%` }} />
                      </span>
                    )}
                  </span>
                  {got ? <IconCheck className="text-mint" /> : <span className="font-mono text-[11px] text-white/40">{val}/{t.target}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'help' && (
        <div className="space-y-4 text-[15px] leading-relaxed text-white/80">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className="font-display mb-2 text-lg font-bold">{s.touch ? 'Touch controls' : 'Controls'}</div>
            {s.touch ? (
              <ul className="space-y-1.5 text-sm">
                <li>Drag anywhere — move (joystick appears under your thumb)</li>
                <li>⚡ button — dash</li>
                <li>Glowing E button — interact with what's in front of you</li>
              </ul>
            ) : (
              <ul className="space-y-1.5 text-sm">
                <li>
                  <span className="kbd">W</span> <span className="kbd">A</span> <span className="kbd">S</span> <span className="kbd">D</span> or arrows — move
                </li>
                <li>
                  <span className="kbd">Shift</span> / <span className="kbd">Space</span> — dash
                </li>
                <li>
                  <span className="kbd">E</span> / <span className="kbd">Enter</span> — interact
                </li>
                <li>
                  <span className="kbd">M</span> — map · <span className="kbd">Esc</span> — menu
                </li>
                <li>Click the ground to walk there</li>
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm">
            <div className="font-display mb-2 text-lg font-bold">What to do</div>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Four landmarks: About (east), GitHub (west), Projects (north), Contact (south).</li>
              <li>Collect the glowing skill orbs for XP — each one is a technology I use.</li>
              <li>Walk up to the arcade cabinets to inspect each project.</li>
              <li>Talk to OBI — ask anything about the work, or how to hire me.</li>
              <li>Press the buttons on the hub's south-west rim. You know you want to.</li>
            </ul>
          </div>
        </div>
      )}
    </Panel>
  )
}
