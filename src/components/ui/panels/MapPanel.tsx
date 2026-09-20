import { Panel } from '../Panel'
import { useGame } from '@/store/gameStore'
import { getGame } from '@/game/engine'
import { destinations, shapes, orbs, WORLD_BOUNDS } from '@/game/world'
import { IconCheck, IconWarp } from '../Icons'

export default function MapPanel() {
  const visited = useGame((s) => s.visited)
  const collected = useGame((s) => s.orbs)
  const pos = getGame()?.playerPos() ?? { x: 0, y: 0 }
  const vb = `${WORLD_BOUNDS.minX} ${WORLD_BOUNDS.minY} ${WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX} ${WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY}`

  const warp = (x: number, y: number) => getGame()?.teleport(x, y)

  return (
    <Panel title="Universe Map" kicker="TAP A LOCATION TO WARP" accent="#5aa9ff" size="lg">
      <div className="rounded-2xl border border-white/10 bg-[#05060f] p-2">
        <svg viewBox={vb} className="mx-auto block max-h-[42dvh] w-full" role="img" aria-label="Map of the universe">
          {shapes.map((s, i) =>
            s.t === 'circle' ? (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.accent} fillOpacity={0.22} stroke={s.accent} strokeOpacity={0.8} strokeWidth={10} />
            ) : (
              <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.radius} fill={s.accent} fillOpacity={s.island ? 0.22 : 0.3} stroke={s.accent} strokeOpacity={0.8} strokeWidth={s.island ? 10 : 6} />
            ),
          )}
          {orbs.map((o) => (!collected.includes(o.id) ? <circle key={o.id} cx={o.x} cy={o.y} r={14} fill="#fff" fillOpacity={0.8} /> : null))}
          {destinations.map((d) => {
            const done = d.landmark ? visited.includes(d.landmark) : false
            return (
              <g key={d.id} onClick={() => warp(d.x, d.y)} style={{ cursor: 'pointer' }}>
                <circle cx={d.x} cy={d.y} r={74} fill={d.color} fillOpacity={0.18} />
                <circle cx={d.x} cy={d.y} r={44} fill={done ? '#2ee6a6' : d.color} stroke="#fff" strokeWidth={8} />
                <text x={d.x} y={d.y + 138} textAnchor="middle" fontSize={96} fontWeight={700} fill="#fff" style={{ fontFamily: 'Rajdhani, system-ui, sans-serif', paintOrder: 'stroke', stroke: '#05060f', strokeWidth: 16 }}>
                  {d.label}
                </text>
              </g>
            )
          })}
          <circle cx={pos.x} cy={pos.y} r={30} fill="#fff" stroke="#5aa9ff" strokeWidth={12} />
        </svg>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {destinations.map((d) => {
          const done = d.landmark ? visited.includes(d.landmark) : false
          return (
            <button key={d.id} className="btn !justify-between !px-3.5" onClick={() => warp(d.x, d.y)}>
              <span className="flex items-center gap-2.5">
                <span className="h-3 w-3 rounded-full" style={{ background: d.color, boxShadow: `0 0 10px ${d.color}` }} />
                <span className="font-display text-[17px] font-bold tracking-wide">{d.label}</span>
              </span>
              {done ? <IconCheck className="text-mint" /> : <IconWarp className="text-white/50" />}
            </button>
          )
        })}
      </div>
    </Panel>
  )
}
