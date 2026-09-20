/** Tiny deterministic RNG so stars, rocks and windows look the same every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rgbCache = new Map<string, [number, number, number]>()

export function rgb(hex: string): [number, number, number] {
  let v = rgbCache.get(hex)
  if (!v) {
    const h = hex.replace('#', '')
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
    v = [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)]
    rgbCache.set(hex, v)
  }
  return v
}

export function rgba(hex: string, a: number): string {
  const [r, g, b] = rgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

export function shade(hex: string, amt: number): string {
  const [r, g, b] = rgb(hex)
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt))))
  return `rgb(${f(r)},${f(g)},${f(b)})`
}

const glowCache = new Map<string, HTMLCanvasElement>()

/** A soft radial blob used for every glow in the game (cheap, cached, no shadowBlur). */
export function glow(color: string): HTMLCanvasElement {
  let c = glowCache.get(color)
  if (!c) {
    c = document.createElement('canvas')
    c.width = c.height = 96
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(48, 48, 0, 48, 48, 48)
    grad.addColorStop(0, rgba(color, 1))
    grad.addColorStop(0.25, rgba(color, 0.55))
    grad.addColorStop(0.6, rgba(color, 0.14))
    grad.addColorStop(1, rgba(color, 0))
    g.fillStyle = grad
    g.fillRect(0, 0, 96, 96)
    glowCache.set(color, c)
  }
  return c
}

export function makeStarTile(size: number, count: number, seed: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const rnd = mulberry32(seed)
  const tints = ['#ffffff', '#cfe0ff', '#e6d8ff', '#ffe9c9']
  for (let i = 0; i < count; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const s = rnd() < 0.12 ? 2 : 1
    g.globalAlpha = 0.35 + rnd() * 0.65
    g.fillStyle = tints[Math.floor(rnd() * tints.length)]
    g.fillRect(x, y, s, s)
  }
  return c
}

export function makeNebula(size: number, palette: string[] = ['#3a4bff', '#8a3dff', '#0fb6a8', '#ff4f9a'], strength = 0.2): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const rnd = mulberry32(42)
  for (let i = 0; i < 9; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const r = size * (0.16 + rnd() * 0.24)
    const col = palette[i % palette.length]
    const grad = g.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, rgba(col, strength))
    grad.addColorStop(1, rgba(col, 0))
    g.fillStyle = grad
    g.fillRect(x - r, y - r, r * 2, r * 2)
  }
  return c
}
