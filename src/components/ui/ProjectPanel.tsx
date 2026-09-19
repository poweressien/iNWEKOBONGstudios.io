import { Modal } from './Modal'
import { useGameStore } from '@/store/gameStore'
import { projects } from '@/data/projects'
import { audioManager } from '@/lib/audio'

export function ProjectPanel() {
  const activePanel = useGameStore((s) => s.activePanel)
  const activeProjectId = useGameStore((s) => s.activeProjectId)
  const closePanel = useGameStore((s) => s.closePanel)
  const openPanel = useGameStore((s) => s.openPanel)

  const open = activePanel === 'project'
  const project = projects.find((p) => p.id === activeProjectId) ?? projects[0]

  return (
    <Modal open={open} onClose={() => { audioManager.uiClick(); closePanel() }} title={project.title} maxWidthClass="max-w-xl">
      <p className="text-sm leading-relaxed text-white/80">{project.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-white/70">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {project.githubUrl ? (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-[#6ea8ff]/40 bg-[#6ea8ff]/10 px-4 py-2 text-sm font-medium text-[#bcd6ff] transition hover:bg-[#6ea8ff]/20"
          >
            View on GitHub
          </a>
        ) : (
          <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/40">
            Repo link not added yet
          </span>
        )}
        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
          >
            Live demo
          </a>
        ) : null}
      </div>

      <button
        onClick={() => { audioManager.uiClick(); openPanel('projects-list') }}
        className="mt-6 text-xs text-white/50 underline decoration-white/20 underline-offset-4 hover:text-white/80"
      >
        ← Back to all projects
      </button>
    </Modal>
  )
}
