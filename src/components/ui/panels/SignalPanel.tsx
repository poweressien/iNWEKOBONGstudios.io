import { useState } from 'react'
import { Panel, Section } from '../Panel'
import { portfolio, hasEmail, hasWhatsApp } from '@/data/portfolio'
import { levels } from '@/data/levels'
import { IconArrowUR, IconGithub, IconMail, IconPhone, IconSend, IconWhatsApp, channelIcon } from '../Icons'

const lv = levels[4]
type SendState = 'idle' | 'sending' | 'sent' | 'error' | 'draft'

const prettyPhone = (p: string) => p.replace(/\D/g, '').replace(/^(\d{4})(\d{3})(\d{4})$/, '$1 $2 $3')

export default function SignalPanel() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<SendState>('idle')
  const endpoint = portfolio.contactFormEndpoint.trim()
  const showForm = hasEmail() || endpoint.length > 0
  const wa = `https://wa.me/${portfolio.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${portfolio.name}, I found your site and would like to discuss a project.`)}`
  const valid = name.trim() && /\S+@\S+\.\S+/.test(email) && message.trim().length > 4

  async function send() {
    if (!valid) return
    if (!endpoint) {
      const a = document.createElement('a')
      a.href = `mailto:${portfolio.email}?subject=${encodeURIComponent(`Project enquiry from ${name}`)}&body=${encodeURIComponent(`${message}\n\n— ${name} (${email})`)}`
      a.click()
      setState('draft')
      return
    }
    setState('sending')
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name, email, message }) })
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  const rows: { key: string; label: string; sub: string; href: string; icon: React.ReactNode }[] = []
  if (hasEmail()) rows.push({ key: 'email', label: 'Email', sub: portfolio.email, href: `mailto:${portfolio.email}`, icon: <IconMail size={17} /> })
  if (portfolio.phone) rows.push({ key: 'phone', label: 'Call', sub: prettyPhone(portfolio.phone), href: `tel:+${portfolio.whatsappNumber.replace(/\D/g, '')}`, icon: <IconPhone size={17} /> })
  for (const c of portfolio.channels) {
    const Ico = channelIcon[c.id]
    rows.push({ key: c.id, label: c.label, sub: c.handle, href: c.url, icon: Ico ? Ico({ size: 17 }) : null })
  }
  rows.push({ key: 'github', label: 'GitHub', sub: `@${portfolio.githubUsername}`, href: portfolio.githubUrl, icon: <IconGithub size={17} /> })

  const input = 'w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-[15px] outline-none transition placeholder:text-white/35 focus:border-white/40'

  return (
    <Panel eyebrow={`LEVEL ${lv.no} · ${lv.label}`} title={lv.title}>
      <p className="text-[17px] font-light leading-relaxed text-white/95">Have a product in mind? Send a short brief — what it does, who it is for, and when you need it. You will get an honest view on scope and timeline.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        {hasWhatsApp() && (
          <a className="btn btn-primary" href={wa} target="_blank" rel="noreferrer noopener">
            <IconWhatsApp size={17} /> WhatsApp
          </a>
        )}
        {hasEmail() && (
          <a className="btn" href={`mailto:${portfolio.email}`}>
            <IconMail size={17} /> Email
          </a>
        )}
      </div>

      <Section title="Channels">
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {rows.map((r) => (
            <li key={r.key}>
              <a href={r.href} target={r.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer noopener" className="group flex items-center gap-4 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 text-white/80 transition group-hover:border-gold group-hover:text-gold">{r.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium leading-tight">{r.label}</span>
                  <span className="block truncate text-[12.5px] text-white/45">{r.sub}</span>
                </span>
                <IconArrowUR className="text-white/30 transition group-hover:text-white" />
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {showForm && (
        <Section title="Send a message">
          <div className="space-y-2.5">
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
            <input className={input} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Your email" autoComplete="email" />
            <textarea className={`${input} resize-none`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What are you building?" rows={4} />
            <button onClick={send} disabled={!valid || state === 'sending'} className="btn btn-primary w-full">
              <IconSend /> {state === 'sending' ? 'Sending…' : endpoint ? 'Send message' : 'Open email draft'}
            </button>
            {state === 'sent' && <p className="text-[13.5px] text-gold">Sent — thank you. You will hear back soon.</p>}
            {state === 'draft' && <p className="text-[13.5px] text-white/55">Your email app should have opened with the message ready to send.</p>}
            {state === 'error' && <p className="text-[13.5px] text-[#ff9a9a]">Couldn't send just now — please use one of the channels above.</p>}
          </div>
        </Section>
      )}
    </Panel>
  )
}
