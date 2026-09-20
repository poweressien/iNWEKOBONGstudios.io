import { useState } from 'react'
import { Panel, Tabs } from '../Panel'
import { useGame } from '@/store/gameStore'
import { portfolio } from '@/data/portfolio'
import { projects } from '@/data/projects'
import { IconCheck } from '../Icons'

type Tab = 'story' | 'skills' | 'journey'

export default function AboutPanel() {
  const [tab, setTab] = useState<Tab>('story')
  const orbs = useGame((s) => s.orbs)
  const openPanel = useGame((s) => s.openPanel)
  const accent = portfolio.planetHome.color

  return (
    <Panel title={portfolio.name} kicker={`${portfolio.role.toUpperCase()} · ${portfolio.location.toUpperCase()}`} accent={accent}>
      <Tabs
        accent={accent}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'story', label: 'STORY' },
          { id: 'skills', label: 'SKILLS' },
          { id: 'journey', label: 'JOURNEY' },
        ]}
      />

      {tab === 'story' && (
        <div>
          <p className="text-[15px] leading-relaxed text-white/85">{portfolio.bio}</p>
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {[
              { n: projects.length, l: 'Projects' },
              { n: portfolio.skills.length, l: 'Technologies' },
              { n: '100%', l: 'Self-taught' },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
                <div className="font-display text-2xl font-bold" style={{ color: accent }}>
                  {s.n}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-white/55">{s.l}</div>
              </div>
            ))}
          </div>
          <blockquote className="mt-5 rounded-xl border-l-4 bg-white/5 px-4 py-3 text-sm italic text-white/75" style={{ borderColor: accent }}>
            {portfolio.planetHome.blurb}
          </blockquote>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button className="btn btn-primary" onClick={() => openPanel('projects')}>
              See the projects
            </button>
            <button className="btn" onClick={() => openPanel('contact')}>
              Get in touch
            </button>
          </div>
        </div>
      )}

      {tab === 'skills' && (
        <div>
          <p className="mb-3 text-sm text-white/65">
            Every skill is also a glowing orb somewhere in the universe.{' '}
            <span className="font-semibold text-white">
              {orbs.length}/{portfolio.skills.length}
            </span>{' '}
            collected.
          </p>
          <div className="flex flex-wrap gap-2">
            {portfolio.skills.map((s, i) => {
              const got = orbs.includes(`orb-${i}`)
              return (
                <span
                  key={s.name}
                  className="chip !text-[13px]"
                  style={got ? { borderColor: `${s.color}aa`, background: `${s.color}22`, color: '#fff' } : undefined}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color, boxShadow: got ? `0 0 10px ${s.color}` : undefined, opacity: got ? 1 : 0.5 }} />
                  {s.name}
                  {got && <IconCheck size={13} className="text-mint" />}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'journey' && (
        <div className="space-y-3">
          {portfolio.experience.map((e) => (
            <div key={e.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-display text-lg font-bold">{e.title}</div>
                <span className="chip !py-0.5">{e.period}</span>
              </div>
              <div className="text-sm" style={{ color: accent }}>
                {e.org}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">{e.description}</p>
            </div>
          ))}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-display text-lg font-bold">Education</div>
            <p className="mt-1 text-sm leading-relaxed text-white/70">{portfolio.education}</p>
          </div>
          <div>
            <div className="mb-2 font-mono text-[10px] tracking-[0.3em] text-white/45">INTERESTS</div>
            <div className="flex flex-wrap gap-2">
              {portfolio.interests.map((i) => (
                <span key={i} className="chip">
                  {i}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </Panel>
  )
}
