import { Panel, Section } from '../Panel'
import { useApp } from '@/store/appStore'
import { projects } from '@/data/projects'
import { IconArrowUR, IconBack, IconGithub } from '../Icons'

export default function ProjectPanel() {
  const id = useApp((s) => s.projectId)
  const open = useApp((s) => s.open)
  const idx = projects.findIndex((p) => p.id === id)
  const p = projects[idx]
  if (!p) return null
  const go = (n: number) => open('project', projects[(idx + n + projects.length) % projects.length].id)
  const hasLink = !!(p.githubUrl || p.liveUrl)

  return (
    <Panel
      eyebrow={`LEVEL 02 · WORK · ${String(idx + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`}
      title={p.title}
      footer={
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 px-5 py-3">
          <button className="btn !px-4" onClick={() => go(-1)}>
            <IconBack /> Prev
          </button>
          <button className="btn" onClick={() => open('work')}>
            All work
          </button>
          <button className="btn !px-4" onClick={() => go(1)}>
            Next <IconBack className="rotate-180" />
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        {p.tags.map((t) => (
          <span key={t} className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/65">
            {t}
          </span>
        ))}
      </div>
      <p className="mt-5 text-[16px] font-light leading-relaxed text-white/90">{p.description}</p>

      <Section title="Built with">
        <div className="flex flex-wrap gap-2">
          {p.tech.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      </Section>

      <div className="mt-8 flex flex-wrap gap-3">
        {p.githubUrl && (
          <a className="btn btn-primary" href={p.githubUrl} target="_blank" rel="noreferrer noopener">
            <IconGithub size={16} /> View code
          </a>
        )}
        {p.liveUrl && (
          <a className="btn btn-primary" href={p.liveUrl} target="_blank" rel="noreferrer noopener">
            Open live <IconArrowUR />
          </a>
        )}
        {!hasLink && (
          <button className="btn" onClick={() => open('signal')}>
            Request a walkthrough
          </button>
        )}
      </div>
      {!hasLink && <p className="mt-3 text-[12.5px] text-white/40">A public link isn't published for this project yet.</p>}
    </Panel>
  )
}
