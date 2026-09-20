/**
 * Raw per-frame input. Written by event handlers, read by the game loop.
 * Deliberately NOT React state — re-rendering on every key/touch would
 * murder the frame rate.
 */
export const input = {
  keys: new Set<string>(),
  /** Analog stick from the on-screen joystick, each axis −1…1. */
  stickX: 0,
  stickY: 0,
  dashQueued: false,
  interactQueued: false,
  /** Click-to-move target (desktop mouse). */
  target: null as { x: number; y: number } | null,
}

export function moveVector(): { x: number; y: number } {
  const k = input.keys
  let x = 0
  let y = 0
  if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1
  if (k.has('KeyD') || k.has('ArrowRight')) x += 1
  if (k.has('KeyW') || k.has('ArrowUp')) y -= 1
  if (k.has('KeyS') || k.has('ArrowDown')) y += 1
  if (x !== 0 || y !== 0) {
    const l = Math.hypot(x, y)
    return { x: x / l, y: y / l }
  }
  return { x: input.stickX, y: input.stickY }
}

export function clearInput() {
  input.keys.clear()
  input.stickX = 0
  input.stickY = 0
  input.dashQueued = false
  input.interactQueued = false
}
