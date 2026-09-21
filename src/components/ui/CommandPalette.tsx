import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@/store/appStore'
import { getScene } from '@/scene/registry'
import { ambience } from '@/lib/audio'
import { portfolio, hasEmail, hasWhatsApp } from '@/data/portfolio'
import { projects } from '@/data/projects'
import { levels } from '@/data/levels'
import { IconSearch } from './Icons'

interface Cmd {
  id: string
  label: string
  hint?: string
  group: string
  keywords?: string
  /** Only listed once the query mentions this word. */
  secret?: string
  run: () => void
}

function buildCommands(): Cmd[] {
  const app = () => useApp.getState()
  const cmds: Cmd[] = []

  levels.forEach((l) => cmds.push({ id: `go-${l.id}`, group: 'Navigate', label: `Go to ${l.title}`, hint: `Level ${l.no}`, keywords: `${l.label} ${l.blurb}`, run: () => app().open(l.panel) }))
  projects.forEach((p) =>
    cmds.push({ id: `p-${p.id}`, group: 'Work', label: `Open ${p.title}`, hint: p.tags.join(' · '), keywords: `${p.tech.join(' ')} ${p.short}`, run: () => app().open('project', p.id) }),
  )

  cmds.push(
    { id: 'tour', group: 'Explore', label: 'Take the guided tour', hint: 'Five levels, one minute', keywords: 'walkthrough start', run: () => app().startTour() },
    { id: 'chat', group: 'Explore', label: 'Ask the concierge', keywords: 'chat assistant help question', run: () => app().open('concierge') },
    {
      id: 'transmit',
      group: 'Explore',
      label: 'Transmit a signal',
      hint: 'Pulse through the tower',
      keywords: 'beacon pulse light',
      run: () => {
        getScene()?.transmit()
        app().notify('Signal transmitted')
      },
    },
    { id: 'spin', group: 'Explore', label: 'Spin around the tower', keywords: 'orbit rotate warp', run: () => getScene()?.spin() },
    { id: 'reset', group: 'Explore', label: 'Reset the view', keywords: 'camera zoom', run: () => getScene()?.resetView() },
    { id: 'orbit', group: 'Scene', label: 'Toggle slow orbit', keywords: 'rotate drift', run: () => app().setOrbit(!app().orbit) },
    { id: 'sunauto', group: 'Scene', label: 'Cycle the sun', keywords: 'light auto day night', run: () => app().setSunAuto(!app().sunAuto) },
    { id: 'dawn', group: 'Scene', label: 'Light: dawn', keywords: 'sun morning', run: () => app().setSunT(0.12) },
    { id: 'golden', group: 'Scene', label: 'Light: golden hour', keywords: 'sun default noon', run: () => app().setSunT(0.5) },
    { id: 'dusk', group: 'Scene', label: 'Light: dusk', keywords: 'sun evening', run: () => app().setSunT(0.88) },
    { id: 'night', group: 'Scene', label: 'Light: night', keywords: 'sun dark', run: () => app().setSunT(0) },
    {
      id: 'sound',
      group: 'Scene',
      label: 'Toggle ambience',
      keywords: 'sound music audio mute',
      run: () => {
        const on = !app().sound
        ambience.setOn(on)
        app().setSound(on)
      },
    },
  )

  if (hasWhatsApp())
    cmds.push({
      id: 'wa',
      group: 'Contact',
      label: 'Message on WhatsApp',
      keywords: 'chat hire',
      run: () => window.open(`https://wa.me/${portfolio.whatsappNumber.replace(/\D/g, '')}`, '_blank', 'noopener,noreferrer'),
    })
  if (hasEmail()) {
    cmds.push(
      { id: 'mail', group: 'Contact', label: 'Send an email', hint: portfolio.email, keywords: 'mail contact hire', run: () => (window.location.href = `mailto:${portfolio.email}`) },
      {
        id: 'copy',
        group: 'Contact',
        label: 'Copy email address',
        keywords: 'clipboard',
        run: () => {
          void navigator.clipboard?.writeText(portfolio.email).then(
            () => app().notify('Email address copied'),
            () => app().notify(portfolio.email),
          )
        },
      },
    )
  }
  cmds.push({ id: 'gh', group: 'Contact', label: 'Open GitHub', hint: `@${portfolio.githubUsername}`, keywords: 'code repos', run: () => window.open(portfolio.githubUrl, '_blank', 'noopener,noreferrer') })

  cmds.push({
    id: 'sudo',
    group: 'Hidden',
    label: 'sudo hire me',
    hint: 'permission granted',
    secret: 'sudo',
    run: () => {
      getScene()?.transmit()
      app().notify('Permission granted')
      setTimeout(() => app().open('signal'), 1500)
    },
  })
  return cmds
}

const matches = (c: Cmd, q: string) => {
  const hay = `${c.label} ${c.group} ${c.keywords ?? ''}`.toLowerCase()
  return q.split(/\s+/).every((tok) => hay.includes(tok))
}

export function CommandPalette() {
  const open = useApp((s) => s.palette)
  const setPalette = useApp((s) => s.setPalette)
  const ready = useApp((s) => s.ready)
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)
  const all = useMemo(buildCommands, [])

  // open with Ctrl/⌘ + K, or "/" when not typing
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
        e.preventDefault()
        if (ready) setPalette(!useApp.getState().palette)
      } else if (e.key === '/' && !typing && ready && !useApp.getState().palette) {
        e.preventDefault()
        setPalette(true)
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [ready, setPalette])

  useEffect(() => {
    if (open) {
      setQ('')
      setIdx(0)
    }
  }, [open])

  const query = q.trim().toLowerCase()
  const list = useMemo(() => {
    const visible = all.filter((c) => (c.secret ? query.includes(c.secret) : true))
    if (!query) return visible.filter((c) => !c.secret)
    const hits = visible.filter((c) => matches(c, query))
    return hits.sort((a, b) => Number(b.label.toLowerCase().startsWith(query)) - Number(a.label.toLowerCase().startsWith(query)))
  }, [all, query])

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [idx, list])

  if (!open) return null

  const run = (c: Cmd | undefined) => {
    if (!c) return
    setPalette(false)
    c.run()
  }

  return (
    <div className="anim-fade fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-[#02030a]/60" onClick={() => setPalette(false)} />
      <div className="glass anim-rise relative w-full max-w-[600px] overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-5">
          <IconSearch size={17} className="text-white/45" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setIdx(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setIdx((i) => Math.min(list.length - 1, i + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setIdx((i) => Math.max(0, i - 1))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                run(list[idx])
              } else if (e.key === 'Escape') {
                e.preventDefault()
                setPalette(false)
              }
            }}
            placeholder="Type a command, a level, or a project…"
            className="min-w-0 flex-1 bg-transparent py-4 text-[16px] outline-none placeholder:text-white/35"
            aria-label="Search commands"
          />
          <span className="kbd">Esc</span>
        </div>
        <ul ref={listRef} className="scroll-y max-h-[50vh] py-2" role="listbox">
          {list.length === 0 && <li className="px-5 py-6 text-center text-[14px] text-white/45">No matches. Try “work”, “sun” or “contact”.</li>}
          {list.map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === idx}>
              <button
                onMouseEnter={() => setIdx(i)}
                onClick={() => run(c)}
                className={`flex w-full items-center justify-between gap-4 px-5 py-2.5 text-left transition ${i === idx ? 'bg-white/[0.07]' : ''}`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-medium">{c.label}</span>
                  {c.hint && <span className="block truncate text-[12px] text-white/40">{c.hint}</span>}
                </span>
                <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/35">{c.group}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4 border-t border-white/10 px-5 py-2.5 text-[11.5px] text-white/40">
          <span>
            <span className="kbd">↑</span> <span className="kbd">↓</span> navigate
          </span>
          <span>
            <span className="kbd">Enter</span> run
          </span>
        </div>
      </div>
    </div>
  )
}
