import type { ReactNode } from 'react'
import { useGame } from '@/store/gameStore'
import { IconClose } from './Icons'

interface Props {
  title: string
  kicker?: string
  accent?: string
  size?: 'md' | 'lg'
  /** Give the body a fixed height (chat, map) instead of sizing to content. */
  fill?: boolean
  children: ReactNode
  footer?: ReactNode
}

export function Panel({ title, kicker, accent = '#5aa9ff', size = 'md', fill, children, footer }: Props) {
  const close = useGame((s) => s.closePanel)
  return (
    <div className="anim-fade absolute inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-[#02030a]/70" onClick={close} />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`panel-surface anim-sheet relative z-10 flex w-full flex-col overflow-hidden rounded-t-[22px] sm:rounded-[20px] ${
          size === 'lg' ? 'sm:max-w-[760px]' : 'sm:max-w-[620px]'
        } ${fill ? 'h-[86dvh] sm:h-[min(640px,82dvh)]' : 'max-h-[88dvh] sm:max-h-[84dvh]'}`}
        style={{ paddingBottom: 'var(--safe-b)' }}
      >
        <div className="h-[3px] w-full shrink-0" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
        <header className="flex shrink-0 items-start justify-between gap-4 px-5 pb-3 pt-4">
          <div className="min-w-0">
            {kicker && (
              <div className="font-mono text-[10px] tracking-[0.3em]" style={{ color: accent }}>
                {kicker}
              </div>
            )}
            <h2 className="font-display mt-0.5 text-[26px] font-bold leading-tight tracking-wide sm:text-[30px]">{title}</h2>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/80 transition hover:bg-white/12 hover:text-white active:scale-90"
          >
            <IconClose size={18} />
          </button>
        </header>
        <div className={`scroll-y min-h-0 px-5 pb-5 ${fill ? 'flex-1' : ''}`}>{children}</div>
        {footer}
      </section>
    </div>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange, accent = '#5aa9ff' }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void; accent?: string }) {
  return (
    <div className="mb-4 flex gap-1 rounded-xl bg-white/5 p-1" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className="font-display flex-1 rounded-lg px-3 py-2 text-[15px] font-semibold tracking-wider transition"
          style={value === t.id ? { background: `${accent}2e`, color: '#fff', boxShadow: `inset 0 0 0 1px ${accent}66` } : { color: 'rgba(232,236,255,0.6)' }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
