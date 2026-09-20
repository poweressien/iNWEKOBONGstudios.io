import { Panel, Section } from '../Panel'
import { useApp } from '@/store/appStore'
import { portfolio } from '@/data/portfolio'
import { projects } from '@/data/projects'
import { levels } from '@/data/levels'
import { IconArrow } from '../Icons'

const lv = levels[0]

export default function StudioPanel() {
  const open = useApp((s) => s.open)
  return (
    <Panel eyebrow={`LEVEL ${lv.no} · ${lv.label}`} title={lv.title}>
      <p className="text-[17px] font-light leading-relaxed text-white/95">{portfolio.bio[0]}</p>
      {portfolio.bio.slice(1).map((p) => (
        <p key={p} className="mt-4 text-[14.5px] leading-relaxed text-white/65">
          {p}
        </p>
      ))}

      <div className="mt-7 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
        {[
          { n: String(projects.length), l: 'Products shipped' },
          { n: String(portfolio.skills.length), l: 'Technologies' },
          { n: '1', l: 'Engineer, end to end' },
        ].map((s) => (
          <div key={s.l} className="bg-[#080a14] px-4 py-4">
            <div className="text-[28px] font-light tracking-tight">{s.n}</div>
            <div className="mt-0.5 text-[11.5px] leading-tight text-white/50">{s.l}</div>
          </div>
        ))}
      </div>

      <Section title="Experience">
        <div className="space-y-5">
          {portfolio.experience.map((e) => (
            <div key={e.title} className="border-l border-white/15 pl-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <div className="text-[15.5px] font-medium">{e.title}</div>
                <div className="font-mono text-[11px] text-white/45">{e.period}</div>
              </div>
              <div className="text-[13px] text-gold">{e.org}</div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/60">{e.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Focus areas">
        <div className="flex flex-wrap gap-2">
          {portfolio.focus.map((f) => (
            <span key={f} className="chip">
              {f}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Education">
        <p className="text-[13.5px] leading-relaxed text-white/60">{portfolio.education}</p>
      </Section>

      <div className="mt-8 flex flex-wrap gap-3">
        <button className="btn btn-primary" onClick={() => open('work')}>
          View the work <IconArrow />
        </button>
        <button className="btn" onClick={() => open('signal')}>
          Get in touch
        </button>
      </div>
    </Panel>
  )
}
