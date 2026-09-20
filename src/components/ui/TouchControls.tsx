import { useRef, useState } from 'react'
import { useGame } from '@/store/gameStore'
import { input } from '@/game/input'
import { getGame } from '@/game/engine'
import { IconBolt } from './Icons'

const R = 54

export function TouchControls() {
  const touch = useGame((s) => s.touch)
  const phase = useGame((s) => s.phase)
  const panel = useGame((s) => s.panel)
  const focus = useGame((s) => s.focus)
  const [stick, setStick] = useState<{ ox: number; oy: number; dx: number; dy: number } | null>(null)
  const pid = useRef<number | null>(null)
  const origin = useRef({ x: 0, y: 0 })

  if (!touch || phase !== 'playing' || panel) return null

  const end = () => {
    pid.current = null
    input.stickX = 0
    input.stickY = 0
    setStick(null)
  }

  return (
    <div className="absolute inset-0 z-10" style={{ touchAction: 'none' }}>
      {/* full-screen floating joystick zone */}
      <div
        className="absolute inset-0"
        onPointerDown={(e) => {
          if (pid.current !== null || e.pointerType === 'mouse') return
          pid.current = e.pointerId
          origin.current = { x: e.clientX, y: e.clientY }
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
          setStick({ ox: e.clientX, oy: e.clientY, dx: 0, dy: 0 })
        }}
        onPointerMove={(e) => {
          if (e.pointerId !== pid.current) return
          const rawX = e.clientX - origin.current.x
          const rawY = e.clientY - origin.current.y
          const d = Math.hypot(rawX, rawY)
          const m = Math.min(1, d / R)
          const strength = m < 0.14 ? 0 : m
          input.stickX = d > 0 ? (rawX / d) * strength : 0
          input.stickY = d > 0 ? (rawY / d) * strength : 0
          const k = d > R ? R / d : 1
          setStick({ ox: origin.current.x, oy: origin.current.y, dx: rawX * k, dy: rawY * k })
        }}
        onPointerUp={(e) => e.pointerId === pid.current && end()}
        onPointerCancel={(e) => e.pointerId === pid.current && end()}
      />

      {stick && (
        <div
          className="pointer-events-none absolute rounded-full border border-white/25 bg-white/5"
          style={{ left: stick.ox - R, top: stick.oy - R, width: R * 2, height: R * 2 }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full border border-white/50 bg-white/25"
            style={{ transform: `translate(-50%, -50%) translate(${stick.dx}px, ${stick.dy}px)` }}
          />
        </div>
      )}

      {/* action buttons */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 flex items-end gap-3 p-5"
        style={{ paddingBottom: 'calc(var(--safe-b) + 24px)', paddingRight: 'calc(var(--safe-r) + 20px)' }}
      >
        {focus && (
          <div className="pointer-events-auto flex flex-col items-end gap-2">
            <div className="anim-toast hud-chip font-display max-w-[52vw] truncate px-3 py-1.5 text-sm font-semibold tracking-wide">{focus.prompt}</div>
            <button
              aria-label={focus.prompt}
              onPointerDown={(e) => {
                e.stopPropagation()
                getGame()?.interact()
              }}
              className="anim-pulse font-display flex h-[76px] w-[76px] items-center justify-center rounded-full border border-white/40 bg-gradient-to-br from-accent to-violet text-2xl font-bold text-[#060818] shadow-[0_8px_30px_rgba(90,140,255,0.5)] active:scale-90"
            >
              E
            </button>
          </div>
        )}
        <button
          aria-label="Dash"
          onPointerDown={(e) => {
            e.stopPropagation()
            getGame()?.dash()
          }}
          className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-[rgba(8,10,26,0.72)] text-gold active:scale-90"
        >
          <IconBolt size={26} />
        </button>
      </div>
    </div>
  )
}
