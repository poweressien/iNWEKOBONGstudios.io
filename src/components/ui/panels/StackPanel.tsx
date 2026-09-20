import { useState } from 'react'
import { Panel, Section } from '../Panel'
import { useApp } from '@/store/appStore'
import { portfolio } from '@/data/portfolio'
import { levels } from '@/data/levels'
import { projectsForSkill } from '@/lib/ai'
import { IconArrow } from '../Icons'

const lv = levels[2]
const GROUPS = ['Backend', 'Frontend & Mobile', 'Graphics & Tooling'] as const

export default function StackPanel() {
  const [sel, setSel] = useState<string | null>(null)
  const open = useApp((s) => s.open)
  const used = sel ? projectsForSkill(sel) : []

  return (
    <Panel eyebrow={`LEVEL ${lv.no} · ${lv.label}`} title={lv.title}>
      <p className="text-[14.5px] leading-relaxed text-white/60">Choose a technology to see where it is used in shipped work.</p>
      {GROUPS.map((g) => (
        <Section key={g} title={g}>
          <div className="flex flex-wrap gap-2">
            {portfolio.skills
              .filter((s) => s.group === g)
              .map((s) => (
                <button
                  key={s.name}
                  onClick={() => setSel(sel === s.name ? null : s.name)}
                  aria-pressed={sel === s.name}
                  className={`rounded-full border px-4 py-2 text-[13.5px] font-medium transition ${sel === s.name ? 'border-gold bg-gold/15 text-white' : 'border-white/15 text-white/80 hover:border-white/40 hover:text-white'}`}
                >
                  {s.name}
                </button>
              ))}
          </div>
        </Section>
      ))}

      <div className="mt-8 min-h-[120px] rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        {!sel && <p className="text-[13.5px] text-white/45">Nothing selected.</p>}
        {sel && used.length === 0 && <p className="text-[13.5px] leading-relaxed text-white/60">{sel} is part of the everyday toolchain and is applied across the work rather than tied to a single product.</p>}
        {sel && used.length > 0 && (
          <div>
            <div className="eyebrow mb-3">{sel} is used in</div>
            <ul className="divide-y divide-white/10">
              {used.map((p) => (
                <li key={p.id}>
                  <button onClick={() => open('project', p.id)} className="group flex w-full items-center justify-between py-2.5 text-left">
                    <span className="text-[15px] font-medium">{p.title}</span>
                    <IconArrow className="text-white/30 transition group-hover:translate-x-1 group-hover:text-white" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Panel>
  )
}
