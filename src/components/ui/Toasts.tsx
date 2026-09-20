import { useGame } from '@/store/gameStore'
import { IconTrophy, IconStar, IconBolt } from './Icons'

export function Toasts() {
  const toasts = useGame((s) => s.toasts)
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-[calc(var(--safe-t)+150px)] z-50 flex flex-col items-center gap-2 px-3 sm:top-[calc(var(--safe-t)+78px)]"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const color = t.kind === 'trophy' ? '#ffb15e' : t.kind === 'level' ? '#9b7bff' : t.kind === 'xp' ? '#2ee6a6' : '#5aa9ff'
        return (
          <div
            key={t.id}
            className="anim-toast flex max-w-[92vw] items-center gap-3 rounded-2xl border bg-[rgba(8,10,26,0.9)] py-2.5 pl-3 pr-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] sm:max-w-md"
            style={{ borderColor: `${color}88` }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}22`, color }}>
              {t.kind === 'trophy' ? <IconTrophy size={19} /> : t.kind === 'level' ? <IconBolt size={18} /> : <IconStar size={17} />}
            </span>
            <span className="min-w-0">
              {t.kind === 'trophy' && <span className="block font-mono text-[10px] tracking-[0.25em]" style={{ color }}>TROPHY UNLOCKED</span>}
              <span className="font-display block text-[17px] font-bold leading-tight tracking-wide">{t.text}</span>
              {t.sub && <span className="block text-xs leading-snug text-white/65">{t.sub}</span>}
            </span>
          </div>
        )
      })}
    </div>
  )
}
