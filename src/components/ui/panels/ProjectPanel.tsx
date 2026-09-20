import { Panel } from '../Panel'
import { useGame } from '@/store/gameStore'
import { projects } from '@/data/projects'
import { IconChevronLeft, IconChevronRight, IconExternal, IconGithub } from '../Icons'

export default function ProjectPanel() {
  const id = useGame((s) => s.projectId)
  const openPanel = useGame((s) => s.openPanel)
  const viewProject = useGame((s) => s.viewProject)

  const idx = projects.findIndex((p) => p.id === id)
  const p = projects[idx]
  if (!p) return null

  const go = (n: number) => {
    const next = projects[(idx + n + projects.length) % projects.length]
    viewProject(next.id)
    openPanel('project', next.id)
  }

  const hasLink = !!(p.githubUrl || p.liveUrl)

  return (
    <Panel
      title={p.title}
      kicker={`PROJECT ${String(idx + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`}
      accent={p.accent}
      footer={
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
          <button className="btn !px-3" onClick={() => go(-1)} aria-label="Previous project">
            <IconChevronLeft /> <span className="hidden sm:inline">Prev</span>
          </button>
          <button className="btn" onClick={() => openPanel('projects')}>
            All projects
          </button>
          <button className="btn !px-3" onClick={() => go(1)} aria-label="Next project">
            <span className="hidden sm:inline">Next</span> <IconChevronRight />
          </button>
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {p.tags.map((t) => (
          <span key={t} className="rounded-md px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider" style={{ background: `${p.accent}26`, color: p.accent }}>
            {t}
          </span>
        ))}
      </div>

      <p className="text-[15px] leading-relaxed text-white/85">{p.description}</p>

      <div className="mt-5">
        <div className="mb-2 font-mono text-[10px] tracking-[0.3em] text-white/45">BUILT WITH</div>
        <div className="flex flex-wrap gap-2">
          {p.tech.map((t) => (
            <span key={t} className="chip !text-[13px]" style={{ borderColor: `${p.accent}66` }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5">
        {p.githubUrl && (
          <a className="btn btn-primary" href={p.githubUrl} target="_blank" rel="noreferrer noopener">
            <IconGithub size={18} /> View code
          </a>
        )}
        {p.liveUrl && (
          <a className="btn btn-primary" href={p.liveUrl} target="_blank" rel="noreferrer noopener">
            <IconExternal /> Open live
          </a>
        )}
        {!hasLink && (
          <button className="btn" onClick={() => openPanel('contact')}>
            Ask about this project
          </button>
        )}
      </div>
      {!hasLink && <p className="mt-3 text-xs text-white/45">A public link isn't published yet — get in touch for a walkthrough.</p>}
    </Panel>
  )
}
