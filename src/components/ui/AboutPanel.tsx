import { Modal } from './Modal'
import { useGameStore } from '@/store/gameStore'
import { portfolio } from '@/data/portfolio'
import { audioManager } from '@/lib/audio'

export function AboutPanel() {
  const activePanel = useGameStore((s) => s.activePanel)
  const closePanel = useGameStore((s) => s.closePanel)
  const open = activePanel === 'about'

  return (
    <Modal open={open} onClose={() => { audioManager.uiClick(); closePanel() }} title={portfolio.name} subtitle={`${portfolio.role} · ${portfolio.studio}`} maxWidthClass="max-w-2xl">
      <p className="text-sm leading-relaxed text-white/80">{portfolio.bio}</p>

      <div className="mt-5">
        <h3 className="font-display text-sm font-semibold text-[#6ea8ff]">Skills</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {portfolio.skills.map((s) => (
            <span
              key={s.name}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs"
              style={{ boxShadow: `inset 0 0 0 1px ${s.color}33` }}
            >
              {s.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="font-display text-sm font-semibold text-[#ffd9a8]">Experience</h3>
        <div className="mt-2 space-y-3">
          {portfolio.experience.map((exp) => (
            <div key={exp.title} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-medium">{exp.title} · <span className="text-white/60">{exp.org}</span></div>
              <div className="text-xs text-white/50">{exp.period}</div>
              <p className="mt-1 text-xs leading-relaxed text-white/70">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="font-display text-sm font-semibold text-[#ffd9a8]">Education</h3>
        <p className="mt-1 text-xs leading-relaxed text-white/70">{portfolio.education}</p>
      </div>

      <div className="mt-5">
        <h3 className="font-display text-sm font-semibold text-[#a685ff]">Interests</h3>
        <p className="mt-1 text-xs leading-relaxed text-white/70">{portfolio.interests.join(' · ')}</p>
      </div>
    </Modal>
  )
}
