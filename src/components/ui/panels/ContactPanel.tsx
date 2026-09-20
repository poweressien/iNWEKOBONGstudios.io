import { useState } from 'react'
import { Panel } from '../Panel'
import { useGame } from '@/store/gameStore'
import { portfolio, hasEmail, hasWhatsApp } from '@/data/portfolio'
import { IconExternal, IconGithub, IconLinkedin, IconMail, IconSend, IconWhatsApp } from '../Icons'

type SendState = 'idle' | 'sending' | 'sent' | 'error' | 'draft'

export default function ContactPanel() {
  const openPanel = useGame((s) => s.openPanel)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<SendState>('idle')

  const endpoint = portfolio.contactFormEndpoint.trim()
  const showForm = hasEmail() || endpoint.length > 0

  const channels: { label: string; sub: string; href: string; icon: React.ReactNode; color: string }[] = []
  if (hasEmail()) channels.push({ label: 'Email', sub: portfolio.email, href: `mailto:${portfolio.email}`, icon: <IconMail size={22} />, color: '#5aa9ff' })
  if (hasWhatsApp()) {
    const digits = portfolio.whatsappNumber.replace(/\D/g, '')
    channels.push({
      label: 'WhatsApp',
      sub: 'Chat directly',
      href: `https://wa.me/${digits}?text=${encodeURIComponent(`Hi ${portfolio.name}, I found your portfolio and I'd like to talk about a project.`)}`,
      icon: <IconWhatsApp size={22} />,
      color: '#2ee6a6',
    })
  }
  if (portfolio.linkedinUrl) channels.push({ label: 'LinkedIn', sub: 'Connect', href: portfolio.linkedinUrl, icon: <IconLinkedin size={22} />, color: '#7fd0ff' })
  channels.push({ label: 'GitHub', sub: `@${portfolio.githubUsername}`, href: portfolio.githubUrl, icon: <IconGithub size={22} />, color: '#9b7bff' })

  const valid = name.trim() && /\S+@\S+\.\S+/.test(email) && message.trim().length > 4

  async function send() {
    if (!valid) return
    if (!endpoint) {
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
      const a = document.createElement('a')
      a.href = `mailto:${portfolio.email}?subject=${encodeURIComponent(`Portfolio message from ${name}`)}&body=${body}`
      a.click()
      setState('draft')
      return
    }
    setState('sending')
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <Panel title="Comms Station" kicker="OPEN A CHANNEL" accent="#2ee6a6">
      <p className="mb-4 text-[15px] leading-relaxed text-white/80">
        Have an app, game or platform in mind? Tell me what you're building — I'll reply with an honest take on scope and timeline.
      </p>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {channels.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.href.startsWith('mailto') ? undefined : '_blank'}
            rel="noreferrer noopener"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 transition hover:-translate-y-0.5 hover:bg-white/[0.09]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `${c.color}22`, color: c.color }}>
              {c.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-display block text-lg font-bold leading-tight">{c.label}</span>
              <span className="block truncate text-xs text-white/55">{c.sub}</span>
            </span>
            <IconExternal size={15} className="shrink-0 text-white/35" />
          </a>
        ))}
      </div>

      {showForm ? (
        <div className="mt-6">
          <div className="mb-2 font-mono text-[10px] tracking-[0.3em] text-white/45">SEND A MESSAGE</div>
          <div className="space-y-2.5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-3 outline-none placeholder:text-white/35 focus:border-mint/60"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Your email"
              autoComplete="email"
              className="w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-3 outline-none placeholder:text-white/35 focus:border-mint/60"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What are you building?"
              rows={4}
              className="w-full resize-none rounded-xl border border-white/12 bg-white/5 px-3.5 py-3 outline-none placeholder:text-white/35 focus:border-mint/60"
            />
            <button onClick={send} disabled={!valid || state === 'sending'} className="btn btn-primary w-full">
              <IconSend /> {state === 'sending' ? 'Sending…' : endpoint ? 'Send message' : 'Open email draft'}
            </button>
            {state === 'sent' && <p className="text-sm text-mint">Sent — thanks for reaching out. I'll reply soon.</p>}
            {state === 'draft' && <p className="text-sm text-white/60">Your email app should have opened with the message ready to send.</p>}
            {state === 'error' && <p className="text-sm text-pink">Couldn't send just now — please try again, or use one of the channels above.</p>}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-white/70">Not sure where to start? OBI can answer most questions right now.</p>
          <button className="btn mt-3" onClick={() => openPanel('chat')}>
            Ask OBI
          </button>
        </div>
      )}
      {import.meta.env.DEV && !hasEmail() && (
        <p className="mt-4 rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs text-gold">
          DEV NOTE: set <code>email</code> / <code>whatsappNumber</code> in src/data/portfolio.ts to show those buttons and the message form.
        </p>
      )}
    </Panel>
  )
}
