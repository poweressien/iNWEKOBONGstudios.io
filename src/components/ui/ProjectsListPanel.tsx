import { Modal } from './Modal'
import { useGameStore } from '@/store/gameStore'
import { projects } from '@/data/projects'
import { audioManager } from '@/lib/audio'

export function ProjectsListPanel() {
  const activePanel = useGameStore((s) => s.activePanel)
  const closePanel = useGameStore((s) => s.closePanel)
  const openPanel = useGameStore((s) => s.openPanel)
  const open = activePanel === 'projects-list'

  return (
    <Modal open={open} onClose={() => { audioManager.uiClick(); closePanel() }} title="Projects" subtitle="Everything on the Project Floor, without the walk" maxWidthClass="max-w-2xl">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => { audioManager.uiClick(); openPanel('project', project.id) }}
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-white/20 hover:bg-white/10"
            style={{ borderLeftColor: project.accent, borderLeftWidth: 3 }}
          >
            <div className="font-display text-sm font-semibold">{project.title}</div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/60">{project.description}</p>
          </button>
        ))}
      </div>
    </Modal>
  )
}
