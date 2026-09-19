import { useRef, useState } from 'react'
import type { TouchEvent as ReactTouchEvent } from 'react'
import { inputState } from '@/lib/engine'
import { triggerInteract } from '@/hooks/usePlayerControls'
import { useGameStore } from '@/store/gameStore'
import { audioManager } from '@/lib/audio'

const JOYSTICK_RADIUS = 46

function Joystick() {
  const baseRef = useRef<HTMLDivElement>(null)
  const touchId = useRef<number | null>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })

  const updateFromTouch = (clientX: number, clientY: number) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = clientX - cx
    let dy = clientY - cy
    const dist = Math.hypot(dx, dy)
    if (dist > JOYSTICK_RADIUS) {
      dx = (dx / dist) * JOYSTICK_RADIUS
      dy = (dy / dist) * JOYSTICK_RADIUS
    }
    setKnob({ x: dx, y: dy })
    inputState.right = dx / JOYSTICK_RADIUS
    inputState.forward = -dy / JOYSTICK_RADIUS
  }

  const onTouchStart = (e: ReactTouchEvent) => {
    e.stopPropagation()
    const t = e.changedTouches[0]
    touchId.current = t.identifier
    updateFromTouch(t.clientX, t.clientY)
  }
  const onTouchMove = (e: ReactTouchEvent) => {
    e.stopPropagation()
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === touchId.current) updateFromTouch(t.clientX, t.clientY)
    }
  }
  const onTouchEnd = (e: ReactTouchEvent) => {
    e.stopPropagation()
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === touchId.current) {
        touchId.current = null
        setKnob({ x: 0, y: 0 })
        inputState.forward = 0
        inputState.right = 0
      }
    }
  }

  return (
    <div
      ref={baseRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      className="glass-panel relative h-28 w-28 rounded-full"
      style={{ touchAction: 'none' }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-white/20 border border-white/30"
        style={{ transform: `translate(-50%, -50%) translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  )
}

function LookZone() {
  const touchId = useRef<number | null>(null)
  const last = useRef({ x: 0, y: 0 })

  const onTouchStart = (e: ReactTouchEvent) => {
    const t = e.changedTouches[0]
    touchId.current = t.identifier
    last.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchMove = (e: ReactTouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === touchId.current) {
        inputState.lookDeltaX += t.clientX - last.current.x
        inputState.lookDeltaY += t.clientY - last.current.y
        last.current = { x: t.clientX, y: t.clientY }
      }
    }
  }
  const onTouchEnd = (e: ReactTouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === touchId.current) touchId.current = null
    }
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      className="absolute inset-y-0 right-0 w-2/3"
      style={{ touchAction: 'none' }}
    />
  )
}

export function MobileControls() {
  const phase = useGameStore((s) => s.phase)
  const activePanel = useGameStore((s) => s.activePanel)
  const isMobile = useGameStore((s) => s.isMobile)

  if (!isMobile || phase !== 'playing' || activePanel) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      <div className="pointer-events-auto absolute inset-0">
        <LookZone />
      </div>

      <div className="pointer-events-auto absolute bottom-6 left-6">
        <Joystick />
      </div>

      <button
        onTouchStart={(e) => {
          e.stopPropagation()
          audioManager.uiClick()
          triggerInteract()
        }}
        className="glass-panel pointer-events-auto absolute bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full font-display text-sm font-semibold text-white active:bg-white/20"
        style={{ touchAction: 'none' }}
      >
        E
      </button>
    </div>
  )
}
