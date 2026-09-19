import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { useGameStore } from '@/store/gameStore'
import { portfolio } from '@/data/portfolio'
import { audioManager } from '@/lib/audio'

interface GithubUser {
  login: string
  name: string | null
  bio: string | null
  public_repos: number
  followers: number
  avatar_url: string
  html_url: string
}

type FetchState = 'idle' | 'loading' | 'ok' | 'error'

export function GithubPanel() {
  const activePanel = useGameStore((s) => s.activePanel)
  const closePanel = useGameStore((s) => s.closePanel)
  const open = activePanel === 'github'

  const [state, setState] = useState<FetchState>('idle')
  const [user, setUser] = useState<GithubUser | null>(null)

  useEffect(() => {
    if (!open || state !== 'idle') return
    setState('loading')
    fetch(`https://api.github.com/users/${portfolio.githubUsername}`)
      .then((res) => {
        if (!res.ok) throw new Error('not ok')
        return res.json()
      })
      .then((data: GithubUser) => {
        setUser(data)
        setState('ok')
      })
      .catch(() => setState('error'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Modal open={open} onClose={() => { audioManager.uiClick(); closePanel() }} title="GitHub" subtitle={`@${portfolio.githubUsername}`}>
      {state === 'loading' && <div className="py-6 text-center text-sm text-white/50">Loading live profile…</div>}

      {state === 'error' && (
        <div className="py-4 text-center text-sm text-white/60">
          Couldn't reach the GitHub API right now.
          <div className="mt-3">
            <a href={portfolio.githubUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-[#6ea8ff] px-4 py-2 text-sm font-semibold text-[#0a0a12]">
              Open GitHub
            </a>
          </div>
        </div>
      )}

      {state === 'ok' && user && (
        <div>
          <div className="flex items-center gap-4">
            <img src={user.avatar_url} alt={user.login} className="h-16 w-16 rounded-full border border-white/10" />
            <div>
              <div className="font-display text-lg font-semibold">{user.name ?? user.login}</div>
              <div className="text-sm text-white/50">@{user.login}</div>
            </div>
          </div>
          {user.bio && <p className="mt-3 text-sm text-white/75">{user.bio}</p>}
          <div className="mt-4 flex gap-6 font-mono text-sm">
            <div>
              <div className="text-white/50">Repos</div>
              <div className="text-[#5ee6b0]">{user.public_repos}</div>
            </div>
            <div>
              <div className="text-white/50">Followers</div>
              <div className="text-[#5ee6b0]">{user.followers}</div>
            </div>
          </div>
          <a
            href={user.html_url}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block rounded-lg bg-[#6ea8ff] px-4 py-2 text-sm font-semibold text-[#0a0a12] transition hover:bg-[#8bb9ff]"
          >
            Open GitHub
          </a>
        </div>
      )}
    </Modal>
  )
}
