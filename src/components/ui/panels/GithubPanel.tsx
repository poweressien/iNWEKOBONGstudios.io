import { useEffect, useState } from 'react'
import { Panel } from '../Panel'
import { portfolio } from '@/data/portfolio'
import { IconExternal, IconStar } from '../Icons'

interface Profile {
  login: string
  name: string | null
  bio: string | null
  public_repos: number
  followers: number
  avatar_url: string
  html_url: string
}
interface Repo {
  name: string
  html_url: string
  description: string | null
  stargazers_count: number
  language: string | null
  fork: boolean
  pushed_at: string
}

const LANG_COLOR: Record<string, string> = {
  Python: '#ffd43b',
  JavaScript: '#f7df1e',
  TypeScript: '#3d8bff',
  HTML: '#ff7a59',
  CSS: '#a97bff',
  Kotlin: '#a97bff',
  Dart: '#3fb6ff',
  Java: '#ff9a3c',
  Shell: '#7bc96f',
}

const CACHE_KEY = `gh-${portfolio.githubUsername}`
const TTL = 10 * 60 * 1000

async function load(): Promise<{ profile: Profile; repos: Repo[] }> {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (raw) {
      const c = JSON.parse(raw) as { at: number; data: { profile: Profile; repos: Repo[] } }
      if (Date.now() - c.at < TTL) return c.data
    }
  } catch {
    /* ignore */
  }
  const u = portfolio.githubUsername
  const [pr, rr] = await Promise.all([
    fetch(`https://api.github.com/users/${u}`),
    fetch(`https://api.github.com/users/${u}/repos?sort=pushed&per_page=60`),
  ])
  if (!pr.ok) throw new Error('profile')
  const profile = (await pr.json()) as Profile
  const repos = rr.ok ? ((await rr.json()) as Repo[]) : []
  const data = { profile, repos }
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }))
  } catch {
    /* ignore */
  }
  return data
}

export default function GithubPanel() {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [repos, setRepos] = useState<Repo[]>([])
  const accent = portfolio.planetGithub.color

  useEffect(() => {
    let alive = true
    load()
      .then((d) => {
        if (!alive) return
        setProfile(d.profile)
        setRepos(
          d.repos
            .filter((r) => !r.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count || +new Date(b.pushed_at) - +new Date(a.pushed_at))
            .slice(0, 6),
        )
        setState('ok')
      })
      .catch(() => alive && setState('error'))
    return () => {
      alive = false
    }
  }, [])

  return (
    <Panel title="GitHub Planet" kicker={`@${portfolio.githubUsername}`} accent={accent}>
      <p className="mb-4 text-sm text-white/65">{portfolio.planetGithub.blurb}</p>

      {state === 'loading' && (
        <div className="space-y-2.5" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      )}

      {state === 'error' && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          Couldn't reach the GitHub API right now (it may be rate-limited).
          <div className="mt-3">
            <a className="btn btn-primary" href={portfolio.githubUrl} target="_blank" rel="noreferrer noopener">
              Open GitHub <IconExternal />
            </a>
          </div>
        </div>
      )}

      {state === 'ok' && profile && (
        <div>
          <div className="flex items-center gap-4">
            <img src={profile.avatar_url} alt="" width={64} height={64} className="h-16 w-16 rounded-2xl border border-white/15" />
            <div className="min-w-0">
              <div className="font-display text-xl font-bold leading-tight">{profile.name ?? profile.login}</div>
              {profile.bio && <p className="mt-0.5 line-clamp-2 text-sm text-white/65">{profile.bio}</p>}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-white/10 bg-white/5 py-3 text-center">
              <div className="font-display text-2xl font-bold" style={{ color: accent }}>
                {profile.public_repos}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-white/55">Repositories</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 py-3 text-center">
              <div className="font-display text-2xl font-bold" style={{ color: accent }}>
                {profile.followers}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-white/55">Followers</div>
            </div>
          </div>

          {repos.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 font-mono text-[10px] tracking-[0.3em] text-white/45">TOP REPOS</div>
              <div className="space-y-2">
                {repos.map((r) => (
                  <a
                    key={r.name}
                    href={r.html_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.09]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{r.name}</span>
                      {r.description && <span className="block truncate text-xs text-white/55">{r.description}</span>}
                    </span>
                    {r.language && (
                      <span className="chip !py-0.5 !text-[11px]">
                        <span className="h-2 w-2 rounded-full" style={{ background: LANG_COLOR[r.language] ?? '#8a90b8' }} />
                        {r.language}
                      </span>
                    )}
                    {r.stargazers_count > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gold">
                        <IconStar /> {r.stargazers_count}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          <a className="btn btn-primary mt-5" href={profile.html_url} target="_blank" rel="noreferrer noopener">
            Open profile <IconExternal />
          </a>
        </div>
      )}
    </Panel>
  )
}
