import { useEffect, useRef, useState } from 'react'
import { Panel } from '../Panel'
import { useApp } from '@/store/appStore'
import { portfolio } from '@/data/portfolio'
import { greeting, conciergeReply, type Reply } from '@/lib/ai'
import { IconSend } from '../Icons'

interface Msg {
  from: 'bot' | 'me'
  text: string
  open?: Reply['open']
}

// Module-level so the conversation survives closing and reopening the panel.
let history: Msg[] = [{ from: 'bot', text: greeting.text }]
let lastChips: string[] = greeting.chips

export default function ConciergePanel() {
  const [msgs, setMsgs] = useState<Msg[]>(history)
  const [chips, setChips] = useState<string[]>(lastChips)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const open = useApp((s) => s.open)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [msgs, typing])

  function ask(raw: string) {
    const q = raw.trim()
    if (!q || typing) return
    const next: Msg[] = [...msgs, { from: 'me', text: q }]
    history = next
    setMsgs(next)
    setText('')
    setChips([])
    setTyping(true)
    const reply = conciergeReply(q)
    setTimeout(() => {
      const done: Msg[] = [...next, { from: 'bot', text: reply.text, open: reply.open }]
      history = done
      lastChips = reply.chips
      setMsgs(done)
      setChips(reply.chips)
      setTyping(false)
    }, 350 + Math.min(800, reply.text.length * 6))
  }

  const go = (o: NonNullable<Reply['open']>) => (o.panel === 'project' && o.id ? open('project', o.id) : open(o.panel))

  return (
    <Panel eyebrow={portfolio.concierge.tagline.toUpperCase()} title={portfolio.concierge.name} fill>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="scroll-y -mx-1 min-h-0 flex-1 space-y-3 px-1 pb-2" aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[88%]">
                <div className={`rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed ${m.from === 'me' ? 'rounded-br-md bg-white text-[#070912]' : 'rounded-bl-md border border-white/10 bg-white/[0.05] text-white/90'}`}>{m.text}</div>
                {m.open && (
                  <button className="btn mt-2 !min-h-[34px] !px-3.5 !text-[12.5px]" onClick={() => go(m.open!)}>
                    {m.open.label} →
                  </button>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex">
              <div className="flex gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.05] px-4 py-3.5" aria-label="Typing">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/70" style={{ animation: `dots 1s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2 pt-1">
            {chips.map((c) => (
              <button key={c} className="chip hover:border-white/30" onClick={() => ask(c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        <form
          className="flex gap-2 pt-1"
          onSubmit={(e) => {
            e.preventDefault()
            ask(text)
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask about the work, the stack, or hiring…"
            className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 outline-none transition placeholder:text-white/35 focus:border-white/40"
            aria-label="Message"
          />
          <button type="submit" className="btn btn-primary !w-11 !px-0" aria-label="Send" disabled={!text.trim() || typing}>
            <IconSend />
          </button>
        </form>
      </div>
    </Panel>
  )
}
