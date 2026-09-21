import { useState } from 'react'
import { Panel } from '../Panel'
import { useApp } from '@/store/appStore'
import { projects } from '@/data/projects'
import { levels } from '@/data/levels'
import { IconArrow } from '../Icons'
import { ProjectMark } from '../ProjectMark'
import type { ProjectTag } from '@/types'

const lv = levels[1]
const FILTERS: { id: 'all' | ProjectTag; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'web', label: 'Web' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'game', label: 'Games' },
]
const firstSentence = (s: string) => (s.match(/^.*?[.!?](\s|$)/)?.[0] ?? s).trim()

export default function WorkPanel() {
  const [filter, setFilter] = useState<'all' | ProjectTag>('all')
  const open = useApp((s) => s.open)
  const list = projects.map((p, i) => ({ p, i })).filter(({ p }) => filter === 'all' || p.tags.includes(filter))

  return (
    <Panel eyebrow={`LEVEL ${lv.no} · ${lv.label}`} title={lv.title}>
      <div className="mb-2 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition ${filter === f.id ? 'border-white bg-white text-[#070912]' : 'border-white/15 text-white/70 hover:border-white/35 hover:text-white'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-white/10">
        {list.map(({ p, i }) => (
          <li key={p.id}>
            <button onClick={() => open('project', p.id)} className="group flex w-full items-start gap-4 py-4 text-left">
              <span className="w-[52px] shrink-0">
                <ProjectMark id={p.id} accent={p.accent} width={52} height={52} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-medium tracking-tight">
                  <span className="mr-2 font-mono text-[11px] text-gold">{String(i + 1).padStart(2, '0')}</span>
                  {p.title}
                </span>
                <span className="mt-1 line-clamp-2 block text-[13.5px] leading-snug text-white/55">{firstSentence(p.description)}</span>
                <span className="mt-2.5 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full border border-white/12 px-2.5 py-0.5 text-[10.5px] uppercase tracking-[0.14em] text-white/55">
                      {t}
                    </span>
                  ))}
                </span>
              </span>
              <IconArrow className="mt-1.5 shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-white" />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
