import type { ReactNode } from 'react'
import { useApp } from '@/store/appStore'
import { IconClose } from './Icons'

interface Props {
  eyebrow?: string
  title: string
  children: ReactNode
  footer?: ReactNode
  /** Fixed-height body (chat) instead of sizing to content. */
  fill?: boolean
}

/** Right-hand drawer on desktop, bottom sheet on phones. The scene reframes itself to stay visible. */
export function Panel({ eyebrow, title, children, footer, fill }: Props) {
  const close = useApp((s) => s.close)
  return (
    <section
      role="dialog"
      aria-label={title}
      className="glass anim-slide fixed inset-x-0 bottom-0 z-40 flex h-[60dvh] flex-col overflow-hidden rounded-t-[22px] min-[900px]:inset-x-auto min-[900px]:bottom-4 min-[900px]:right-4 min-[900px]:top-4 min-[900px]:h-auto min-[900px]:w-[min(540px,46vw)] min-[900px]:rounded-[22px]"
      style={{ paddingBottom: 'var(--safe-b)' }}
    >
      <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/15 min-[900px]:hidden" />
      <header className="flex shrink-0 items-start justify-between gap-4 px-6 pb-3 pt-4 min-[900px]:pt-6">
        <div className="min-w-0">
          {eyebrow && <div className="eyebrow !text-gold">{eyebrow}</div>}
          <h2 className="mt-1.5 text-[26px] font-semibold leading-[1.1] tracking-tight min-[900px]:text-[32px]">{title}</h2>
        </div>
        <button
          onClick={close}
          aria-label="Close"
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white/35 hover:text-white"
        >
          <IconClose />
        </button>
      </header>
      <div className={`scroll-y min-h-0 px-6 pb-6 ${fill ? 'flex flex-1 flex-col' : 'flex-1'}`}>{children}</div>
      {footer}
    </section>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-7">
      <div className="eyebrow mb-3">{title}</div>
      {children}
    </div>
  )
}
