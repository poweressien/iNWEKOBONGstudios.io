import { useApp } from '@/store/appStore'
import { levels } from '@/data/levels'
import { usePanelShift } from './TopBar'

export function Dock() {
  const ready = useApp((s) => s.ready)
  const panel = useApp((s) => s.panel)
  const hover = useApp((s) => s.hover)
  const open = useApp((s) => s.open)
  const setHover = useApp((s) => s.setHover)
  const shift = usePanelShift()

  const activeIdx = panel === 'project' ? 1 : levels.findIndex((l) => l.panel === panel)

  return (
    <nav
      aria-label="Levels"
      className={`absolute inset-x-0 bottom-0 z-30 flex justify-center px-3 transition-all duration-700 ${ready ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'} ${panel ? 'max-[899px]:pointer-events-none max-[899px]:translate-y-6 max-[899px]:opacity-0' : ''}`}
      style={{ paddingBottom: 'calc(var(--safe-b) + 18px)', paddingRight: shift ? shift + 12 : undefined }}
    >
      <div className="glass-soft flex items-center gap-0.5 rounded-full p-1 min-[900px]:gap-1 min-[900px]:p-1.5">
        {levels.map((l, i) => {
          const on = i === activeIdx
          const hot = hover === i
          return (
            <button
              key={l.id}
              onClick={() => open(l.panel)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              aria-current={on ? 'true' : undefined}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[10.5px] font-medium uppercase tracking-[0.14em] transition min-[900px]:px-4 min-[900px]:text-[12px] min-[900px]:tracking-[0.18em] ${
                on ? 'bg-white text-[#070912]' : hot ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              <span className={`hidden font-mono text-[10px] min-[900px]:inline ${on ? 'text-[#8a5a12]' : 'text-gold'}`}>{l.no}</span>
              {l.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
