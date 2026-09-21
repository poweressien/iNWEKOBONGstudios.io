import { useApp } from '@/store/appStore'

export function Notice() {
  const msg = useApp((s) => s.notice)
  if (!msg) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4" style={{ top: 'calc(var(--safe-t) + 74px)' }} aria-live="polite">
      <div key={msg} className="glass-soft anim-rise rounded-full px-5 py-2 text-[13px] font-medium tracking-tight text-white/90">
        {msg}
      </div>
    </div>
  )
}
