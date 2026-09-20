import { useEffect, useRef, useState } from 'react'
import { Panel } from '../Panel'
import { useGame } from '@/store/gameStore'
import { portfolio } from '@/data/portfolio'
import { greeting, obiReply, type Reply } from '@/game/ai'
import { sfx } from '@/game/audio'
import { IconSend } from '../Icons'

interface Msg {
  from: 'obi' | 'me'
  text: string
  open?: Reply['open']
}

// Module-level so the conversation survives closing and reopening the panel.
let history: Msg[] = [{ from: 'obi', text: greeting.text }]
let lastChips: string[] = greeting.chips

export default function ChatPanel() {
  const [msgs, setMsgs] = useState<Msg[]>(history)
  const [chips, setChips] = useState<string[]>(lastChips)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const openPanel = useGame((s) => s.openPanel)
  const bump = useGame((s) => s.bump)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [msgs, typing])

  function ask(raw: string) {
    const q = raw.trim()
    if (!q || typing) return
    sfx.click()
    const next: Msg[] = [...msgs, { from: 'me', text: q }]
    history = next
    setMsgs(next)
    setText('')
    setChips([])
    setTyping(true)
    bump('chat')
    const reply = obiReply(q)
    setTimeout(() => {
      sfx.message()
      const done: Msg[] = [...next, { from: 'obi', text: reply.text, open: reply.open }]
      history = done
      lastChips = reply.chips
      setMsgs(done)
      setChips(reply.chips)
      setTyping(false)
    }, 380 + Math.min(900, reply.text.length * 7))
  }

  const go = (o: NonNullable<Reply['open']>) => {
    if (o.panel === 'project' && o.id) openPanel('project', o.id)
    else openPanel(o.panel)
  }

  return (
    <Panel title={portfolio.ai.name} kicker={portfolio.ai.tagline.toUpperCase()} accent="#7fd0ff" fill>
      <div className="flex h-full flex-col">
        <div className="scroll-y -mx-1 min-h-0 flex-1 space-y-3 px-1 pb-2" aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[86%]">
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed ${
                    m.from === 'me' ? 'rounded-br-md bg-gradient-to-br from-accent to-violet text-[#060818]' : 'rounded-bl-md border border-white/10 bg-white/[0.06] text-white/90'
                  }`}
                >
                  {m.text}
                </div>
                {m.open && (
                  <button className="btn mt-2 !min-h-[36px] !px-3 !py-1.5 !text-[13px]" onClick={() => go(m.open!)}>
                    {m.open.label} →
                  </button>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3.5" aria-label="OBI is typing">
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
              <button key={c} className="chip !text-[13px] hover:bg-white/12" onClick={() => ask(c)}>
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
            placeholder={`Ask ${portfolio.ai.name} anything…`}
            className="min-w-0 flex-1 rounded-xl border border-white/12 bg-white/5 px-3.5 py-3 outline-none placeholder:text-white/35 focus:border-accent/60"
            aria-label="Message"
          />
          <button type="submit" className="btn btn-primary !px-4" aria-label="Send" disabled={!text.trim() || typing}>
            <IconSend />
          </button>
        </form>
      </div>
    </Panel>
  )
}
