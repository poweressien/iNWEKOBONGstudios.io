import { useState } from 'react'
import { Modal } from './Modal'
import { useGameStore } from '@/store/gameStore'
import { portfolio } from '@/data/portfolio'
import { audioManager } from '@/lib/audio'

type SendState = 'idle' | 'sending' | 'sent' | 'mailto' | 'error'

export function ContactPanel() {
  const activePanel = useGameStore((s) => s.activePanel)
  const closePanel = useGameStore((s) => s.closePanel)
  const open = activePanel === 'contact'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<SendState>('idle')

  const hasEndpoint = portfolio.contactFormEndpoint.trim().length > 0

  async function handleSend() {
    if (!name || !email || !message) return
    audioManager.uiClick()

    if (!hasEndpoint) {
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
      window.location.href = `mailto:${portfolio.email}?subject=${encodeURIComponent('Portfolio contact from ' + name)}&body=${body}`
      setState('mailto')
      return
    }

    setState('sending')
    try {
      const res = await fetch(portfolio.contactFormEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        audioManager.uiClick()
        closePanel()
        setState('idle')
      }}
      title="Send a message"
      subtitle={hasEndpoint ? undefined : 'No backend is configured — this opens a pre-filled email instead of pretending to send one.'}
    >
      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/35 focus:border-[#6ea8ff]/50"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Your email"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/35 focus:border-[#6ea8ff]/50"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          rows={4}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/35 focus:border-[#6ea8ff]/50"
        />
        <button
          onClick={handleSend}
          disabled={!name || !email || !message || state === 'sending'}
          className="w-full rounded-lg bg-[#6ea8ff] px-4 py-2 text-sm font-semibold text-[#0a0a12] transition hover:bg-[#8bb9ff] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === 'sending' ? 'Sending…' : hasEndpoint ? 'Send' : 'Open email draft'}
        </button>

        {state === 'sent' && <p className="text-xs text-[#5ee6b0]">Sent — thanks for reaching out.</p>}
        {state === 'mailto' && <p className="text-xs text-white/50">Opened your email client with the message pre-filled.</p>}
        {state === 'error' && <p className="text-xs text-[#ff6e8c]">Couldn't reach the endpoint — try again in a moment.</p>}
      </div>
    </Modal>
  )
}
