import { useState } from 'react'
import { Panel } from '../Panel'
import { useGame } from '@/store/gameStore'
import { projects } from '@/data/projects'
import { IconCheck } from '../Icons'
import type { ProjectTag } from '@/types'

const FILTERS: { id: 'all' | ProjectTag; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'game', label: 'GAMES' },
  { id: 'web', label: 'WEB' },
  { id: 'mobile', label: 'MOBILE' },
]

const firstSentence = (s: string) => (s.match(/^.*?[.!?](\s|$)/)?.[0] ?? s).trim()

export default function ProjectsPanel() {
  const [filter, setFilter] = useState<'all' | ProjectTag>('all')
  const seen = useGame((s) => s.seenProjects)
  const openPanel = useGame((s) => s.openPanel)
  const viewProject = useGame((s) => s.viewProject)
  const list = projects.filter((p) => filter === 'all' || p.tags.includes(filter))

  return (
    <Panel title="Project Tower" kicker={`${projects.length} BUILDS · ${seen.length} INSPECTED`} accent="#ffb15e" size="lg">
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`font-display rounded-full border px-4 py-1.5 text-sm font-bold tracking-widest transition ${
              filter === f.id ? 'border-gold/70 bg-gold/20 text-white' : 'border-white/12 bg-white/5 text-white/65 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((p) => {
          const done = seen.includes(p.id)
          return (
            <button
              key={p.id}
              onClick={() => {
                viewProject(p.id)
                openPanel('project', p.id)
              }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
              style={{ borderLeft: `4px solid ${p.accent}` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-display text-xl font-bold leading-tight tracking-wide">{p.title}</div>
                {done && <IconCheck size={16} className="mt-1 shrink-0 text-mint" />}
              </div>
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-white/65">{firstSentence(p.description)}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider" style={{ background: `${p.accent}26`, color: p.accent }}>
                    {t}
                  </span>
                ))}
                <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/55">{p.tech[0]}</span>
              </div>
            </button>
          )
        })}
      </div>
    </Panel>
  )
}
