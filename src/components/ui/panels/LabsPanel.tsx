import { useEffect, useState } from 'react'
import { Panel, Section } from '../Panel'
import { portfolio } from '@/data/portfolio'
import { levels } from '@/data/levels'
import { IconArrowUR, IconStar } from '../Icons'

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

const lv = levels[3]
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
  const [pr, rr] = await Promise.all([fetch(`https://api.github.com/users/${u}`), fetch(`https://api.github.com/users/${u}/repos?sort=pushed&per_page=60`)])
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

export default function LabsPanel() {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [repos, setRepos] = useState<Repo[]>([])

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
    <Panel eyebrow={`LEVEL ${lv.no} · ${lv.label}`} title={lv.title}>
      <p className="text-[14.5px] leading-relaxed text-white/60">Public code and activity, pulled live from GitHub.</p>

      {state === 'loading' && (
        <div className="mt-6 space-y-2.5" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      )}
      {state === 'error' && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-[14px] text-white/65">
          GitHub isn't reachable right now (it may be rate-limiting).
          <div className="mt-4">
            <a className="btn btn-primary" href={portfolio.githubUrl} target="_blank" rel="noreferrer noopener">
              Open GitHub <IconArrowUR />
            </a>
          </div>
        </div>
      )}
      {state === 'ok' && profile && (
        <>
          <div className="mt-6 flex items-center gap-4">
            <img src={profile.avatar_url} alt="" width={60} height={60} className="h-[60px] w-[60px] rounded-full border border-white/15" />
            <div className="min-w-0">
              <div className="text-[18px] font-medium tracking-tight">{profile.name ?? profile.login}</div>
              {profile.bio && <p className="line-clamp-2 text-[13.5px] text-white/55">{profile.bio}</p>}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            <div className="bg-[#080a14] px-4 py-4">
              <div className="text-[26px] font-light">{profile.public_repos}</div>
              <div className="text-[11.5px] text-white/50">Repositories</div>
            </div>
            <div className="bg-[#080a14] px-4 py-4">
              <div className="text-[26px] font-light">{profile.followers}</div>
              <div className="text-[11.5px] text-white/50">Followers</div>
            </div>
          </div>
          {repos.length > 0 && (
            <Section title="Top repositories">
              <ul className="divide-y divide-white/10">
                {repos.map((r) => (
                  <li key={r.name}>
                    <a href={r.html_url} target="_blank" rel="noreferrer noopener" className="group flex items-center gap-3 py-3">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium">{r.name}</span>
                        {r.description && <span className="block truncate text-[12.5px] text-white/45">{r.description}</span>}
                      </span>
                      {r.language && <span className="chip !py-0.5 !text-[11px]">{r.language}</span>}
                      {r.stargazers_count > 0 && (
                        <span className="flex items-center gap-1 text-[12px] text-gold">
                          <IconStar /> {r.stargazers_count}
                        </span>
                      )}
                      <IconArrowUR className="text-white/30 transition group-hover:text-white" />
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          <a className="btn btn-primary mt-7" href={profile.html_url} target="_blank" rel="noreferrer noopener">
            Open profile <IconArrowUR />
          </a>
        </>
      )}
    </Panel>
  )
}
