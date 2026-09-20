import {
  shapes,
  props,
  orbs,
  labels,
  interactables,
  landmarkPos,
  ARCADE,
  SPAWN,
  WORLD_BOUNDS,
  type Prop,
  type Shape,
  type LandmarkKey,
} from './world'
import { portfolio } from '@/data/portfolio'
import { glow, makeNebula, makeStarTile, mulberry32, rgba, shade } from './sprites'

type Ctx = CanvasRenderingContext2D
const TAU = Math.PI * 2
const FONT = 'Rajdhani, "Segoe UI", system-ui, sans-serif'

export interface Player {
  x: number
  y: number
  vx: number
  vy: number
  fx: number
  fy: number
  dash: number
  stamina: number
  step: number
  trail: { x: number; y: number; a: number }[]
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  color: string
  kind: 'dot' | 'ring' | 'spark'
}

export interface Floater {
  x: number
  y: number
  life: number
  text: string
  color: string
}

export interface RenderState {
  t: number
  W: number
  H: number
  dpr: number
  zoom: number
  camX: number
  camY: number
  player: Player
  focusId: string | null
  visited: Set<string>
  collected: Set<string>
  seenProjects: Set<string>
  padPress: number[]
  bubble: string | null
  particles: Particle[]
  floaters: Floater[]
  hq: boolean
  mode: 'title' | 'playing'
  touch: boolean
  moved: boolean
}

/* ── small drawing helpers ─────────────────────────────────────────────── */

interface PathLike {
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void
  closePath(): void
}

function rrPath(p: PathLike, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2)
  p.moveTo(x + rad, y)
  p.arcTo(x + w, y, x + w, y + h, rad)
  p.arcTo(x + w, y + h, x, y + h, rad)
  p.arcTo(x, y + h, x, y, rad)
  p.arcTo(x, y, x + w, y, rad)
  p.closePath()
}

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  rrPath(ctx, x, y, w, h, r)
}

function lin(ctx: Ctx, y0: number, y1: number, c0: string, c1: string, x = 0) {
  const g = ctx.createLinearGradient(x, y0, x, y1)
  g.addColorStop(0, c0)
  g.addColorStop(1, c1)
  return g
}

function bloom(ctx: Ctx, color: string, x: number, y: number, r: number, a: number) {
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = a
  ctx.drawImage(glow(color), x - r, y - r, r * 2, r * 2)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
}

function setSpacing(ctx: Ctx, px: number) {
  const c = ctx as unknown as { letterSpacing?: string }
  if ('letterSpacing' in c) c.letterSpacing = `${px}px`
}

function text(ctx: Ctx, s: string, x: number, y: number, size: number, color: string, weight = 700, align: CanvasTextAlign = 'center', spacing = 0) {
  ctx.font = `${weight} ${size}px ${FONT}`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  setSpacing(ctx, spacing)
  ctx.fillStyle = color
  ctx.fillText(s, x, y)
  setSpacing(ctx, 0)
}

function pill(ctx: Ctx, s: string, x: number, y: number, size: number, color: string, alpha = 1, sub?: string) {
  ctx.font = `700 ${size}px ${FONT}`
  setSpacing(ctx, 1.5)
  let w = ctx.measureText(s).width + size * 1.6
  setSpacing(ctx, 0)
  if (sub) {
    ctx.font = `600 ${size * 0.62}px ${FONT}`
    w = Math.max(w, ctx.measureText(sub).width + size * 1.6)
  }
  const h = size * 1.75 + (sub ? size * 0.9 : 0)
  ctx.globalAlpha = alpha
  rr(ctx, x - w / 2, y - h / 2, w, h, h / 2 > 18 ? 14 : h / 2)
  ctx.fillStyle = 'rgba(8,10,26,0.82)'
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = rgba(color, 0.85)
  ctx.stroke()
  text(ctx, s, x, y - (sub ? size * 0.42 : 0), size, '#ffffff', 700, 'center', 1.5)
  if (sub) text(ctx, sub, x, y + size * 0.72, size * 0.62, 'rgba(255,255,255,0.6)', 600, 'center', 0.5)
  ctx.globalAlpha = 1
}

function block(ctx: Ctx, x: number, yFront: number, w: number, d: number, h: number, z0: number, front: string | CanvasGradient, roof: string, edge?: string) {
  const top = yFront - z0 - h
  ctx.fillStyle = front
  ctx.fillRect(x, top, w, h)
  ctx.fillStyle = roof
  ctx.fillRect(x, top - d, w, d)
  if (edge) {
    ctx.lineWidth = 1.5
    ctx.strokeStyle = edge
    ctx.strokeRect(x, top, w, h)
    ctx.strokeRect(x, top - d, w, d)
  }
}

/* ── static ground geometry (built once) ──────────────────────────────── */

const islands = shapes.filter((s) => s.island)
const bridges = shapes.filter((s): s is Extract<Shape, { t: 'rect' }> => s.t === 'rect' && !s.island)

function shapePath(p: Path2D, s: Shape, dy = 0) {
  if (s.t === 'circle') {
    p.moveTo(s.x + s.r, s.y + dy)
    p.arc(s.x, s.y + dy, s.r, 0, TAU)
    p.closePath()
  } else {
    rrPath(p, s.x, s.y + dy, s.w, s.h, s.radius)
  }
}

const unionPath = new Path2D()
shapes.forEach((s) => shapePath(unionPath, s))

const bigRect = (p: Path2D) => p.rect(WORLD_BOUNDS.minX - 400, WORLD_BOUNDS.minY - 400, WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX + 800, WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY + 800)

/** Everything except the bridge mouths — used to clip island rims so they don't cross the walkways. */
const outsideBridges = new Path2D()
bigRect(outsideBridges)
bridges.forEach((b) => outsideBridges.rect(b.x, b.y, b.w, b.h))

/** Everything except the islands — used to clip bridge rails and lane lights. */
const outsideIslands = new Path2D()
bigRect(outsideIslands)
islands.forEach((s) => shapePath(outsideIslands, s))

const rocks = new Path2D()
{
  const rnd = mulberry32(11)
  islands.forEach((s) => {
    if (s.t === 'circle') {
      const n = 9
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (0.12 + (0.76 * i) / (n - 1))
        const bx = s.x + Math.cos(a) * s.r * 0.94
        const by = s.y + Math.sin(a) * s.r * 0.94 + 26
        const len = 40 + rnd() * 90
        const wid = 26 + rnd() * 30
        rocks.moveTo(bx - wid, by)
        rocks.lineTo(bx + wid, by)
        rocks.lineTo(bx + (rnd() - 0.5) * 20, by + len)
        rocks.closePath()
      }
    } else {
      const n = 14
      for (let i = 0; i < n; i++) {
        const bx = s.x + 60 + ((s.w - 120) * i) / (n - 1)
        const by = s.y + s.h + 26
        const len = 40 + rnd() * 100
        const wid = 24 + rnd() * 26
        rocks.moveTo(bx - wid, by)
        rocks.lineTo(bx + wid, by)
        rocks.lineTo(bx + (rnd() - 0.5) * 20, by + len)
        rocks.closePath()
      }
    }
  })
}

let gridPattern: CanvasPattern | null = null
function getGrid(ctx: Ctx): CanvasPattern | null {
  if (gridPattern) return gridPattern
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  g.strokeStyle = 'rgba(120,160,255,0.11)'
  g.lineWidth = 1
  g.beginPath()
  g.moveTo(0.5, 0)
  g.lineTo(0.5, 64)
  g.moveTo(0, 0.5)
  g.lineTo(64, 0.5)
  g.stroke()
  g.fillStyle = 'rgba(160,200,255,0.25)'
  g.fillRect(0, 0, 2, 2)
  gridPattern = ctx.createPattern(c, 'repeat')
  return gridPattern
}

const nebula = makeNebula(512)
const starLayers = [
  { tile: makeStarTile(512, 90, 1), p: 0.05 },
  { tile: makeStarTile(512, 60, 2), p: 0.11 },
  { tile: makeStarTile(512, 34, 3), p: 0.22 },
]

/* ── background ────────────────────────────────────────────────────────── */

function drawBackground(ctx: Ctx, s: RenderState) {
  const { W, H } = s
  ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0)
  ctx.fillStyle = lin(ctx, 0, H, '#04040c', '#0a0819')
  ctx.fillRect(0, 0, W, H)

  // nebula, very slow parallax
  if (s.hq) {
    const ns = Math.max(W, H) * 1.5
    const nx = ((-s.camX * 0.03) % ns) - ns * 0.25
    const ny = ((-s.camY * 0.03) % ns) - ns * 0.25
    ctx.globalAlpha = 0.9
    ctx.drawImage(nebula, nx, ny, ns, ns)
    ctx.globalAlpha = 1
  }

  for (let i = 0; i < (s.hq ? starLayers.length : 2); i++) {
    const L = starLayers[i]
    const ox = (((-s.camX * L.p) % 512) + 512) % 512
    const oy = (((-s.camY * L.p) % 512) + 512) % 512
    ctx.globalAlpha = 0.75 + Math.sin(s.t * (0.6 + i * 0.4) + i) * 0.25
    for (let x = ox - 512; x < W; x += 512) for (let y = oy - 512; y < H; y += 512) ctx.drawImage(L.tile, x, y)
  }
  ctx.globalAlpha = 1
}

/* ── platforms ─────────────────────────────────────────────────────────── */

function drawPlatforms(ctx: Ctx, s: RenderState) {
  const t = s.t
  // hanging rock under the islands
  ctx.fillStyle = '#080a1a'
  ctx.fill(rocks)
  ctx.strokeStyle = 'rgba(90,120,255,0.18)'
  ctx.lineWidth = 1.5
  ctx.stroke(rocks)

  // slab thickness
  ctx.save()
  ctx.translate(0, 26)
  ctx.fillStyle = '#0a0d24'
  ctx.fill(unionPath)
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(100,140,255,0.22)'
  ctx.stroke(unionPath)
  ctx.restore()

  // top surface
  ctx.fillStyle = '#0e1230'
  ctx.fill(unionPath)
  const grid = getGrid(ctx)
  if (grid) {
    ctx.fillStyle = grid
    ctx.fill(unionPath)
  }

  // soft accent light pooling in each island
  for (const sh of islands) {
    if (sh.t === 'circle') {
      const g = ctx.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, sh.r)
      g.addColorStop(0, rgba(sh.accent, 0.2))
      g.addColorStop(0.7, rgba(sh.accent, 0.05))
      g.addColorStop(1, rgba(sh.accent, 0))
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(sh.x, sh.y, sh.r, 0, TAU)
      ctx.fill()
    } else {
      const g = ctx.createLinearGradient(0, sh.y, 0, sh.y + sh.h)
      g.addColorStop(0, rgba(sh.accent, 0.02))
      g.addColorStop(1, rgba(sh.accent, 0.09))
      ctx.fillStyle = g
      rr(ctx, sh.x, sh.y, sh.w, sh.h, sh.radius)
      ctx.fill()
    }
  }

  // island rims (skip the bridge mouths)
  ctx.save()
  ctx.clip(outsideBridges, 'evenodd')
  for (const sh of islands) {
    const p = new Path2D()
    shapePath(p, sh)
    ctx.lineWidth = 12
    ctx.strokeStyle = rgba(sh.accent, 0.08)
    ctx.stroke(p)
    ctx.lineWidth = 3
    ctx.strokeStyle = rgba(sh.accent, 0.75)
    ctx.stroke(p)
    // inner dashed rim
    if (sh.t === 'circle') {
      ctx.setLineDash([3, 11])
      ctx.lineDashOffset = -t * 8
      ctx.lineWidth = 1.5
      ctx.strokeStyle = rgba(sh.accent, 0.3)
      ctx.beginPath()
      ctx.arc(sh.x, sh.y, sh.r - 16, 0, TAU)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }
  ctx.restore()

  // bridge rails + flowing lane lights (skip the island interiors)
  ctx.save()
  ctx.clip(outsideIslands, 'evenodd')
  for (const b of bridges) {
    ctx.lineWidth = 8
    ctx.strokeStyle = rgba(b.accent, 0.07)
    ctx.strokeRect(b.x, b.y, b.w, b.h)
    ctx.lineWidth = 2.5
    ctx.strokeStyle = rgba(b.accent, 0.7)
    ctx.strokeRect(b.x, b.y, b.w, b.h)

    ctx.setLineDash([14, 20])
    ctx.lineDashOffset = -t * 42
    ctx.lineWidth = 3
    ctx.strokeStyle = rgba(b.accent, 0.5)
    ctx.beginPath()
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    if (b.flow === 'n') (ctx.moveTo(cx, b.y + b.h), ctx.lineTo(cx, b.y))
    if (b.flow === 's') (ctx.moveTo(cx, b.y), ctx.lineTo(cx, b.y + b.h))
    if (b.flow === 'e') (ctx.moveTo(b.x, cy), ctx.lineTo(b.x + b.w, cy))
    if (b.flow === 'w') (ctx.moveTo(b.x + b.w, cy), ctx.lineTo(b.x, cy))
    ctx.stroke()
    ctx.setLineDash([])
  }
  ctx.restore()
}

function drawGroundDetail(ctx: Ctx, s: RenderState) {
  const t = s.t
  // ── hub ──
  ctx.save()
  ctx.translate(0, 0)
  const ring = (r: number, a: number, w: number, dash?: number[], rot = 0) => {
    ctx.beginPath()
    ctx.setLineDash(dash ?? [])
    ctx.lineDashOffset = rot
    ctx.lineWidth = w
    ctx.strokeStyle = `rgba(110,170,255,${a})`
    ctx.arc(0, 0, r, 0, TAU)
    ctx.stroke()
    ctx.setLineDash([])
  }
  ring(292, 0.28, 2, [2, 16], -t * 10)
  ring(236, 0.14, 1.5)
  ring(168, 0.22, 2, [18, 10], t * 14)
  ring(96, 0.3, 2)
  ring(64, 0.18, 1)
  // faint spokes toward the bridges
  ctx.strokeStyle = 'rgba(110,170,255,0.09)'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (const a of [0, 90, 180, 270]) {
    const r = (a * Math.PI) / 180
    ctx.moveTo(Math.cos(r) * 100, Math.sin(r) * 100)
    ctx.lineTo(Math.cos(r) * 330, Math.sin(r) * 330)
  }
  ctx.stroke()
  ctx.restore()

  // spawn pad with north-pointing chevrons
  const pulse = 0.5 + Math.sin(t * 2.4) * 0.5
  ctx.strokeStyle = rgba('#5aa9ff', 0.35 + pulse * 0.3)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(SPAWN.x, SPAWN.y + 6, 26 + pulse * 3, 0, TAU)
  ctx.stroke()
  for (let i = 0; i < 3; i++) {
    const a = 0.15 + ((t * 1.6 - i * 0.35) % 1 + 1) % 1 * 0.5
    ctx.strokeStyle = `rgba(150,200,255,${a * 0.6})`
    ctx.beginPath()
    const yy = SPAWN.y - 50 - i * 18
    ctx.moveTo(-12, yy + 8)
    ctx.lineTo(0, yy - 4)
    ctx.lineTo(12, yy + 8)
    ctx.stroke()
  }

  // ── arcade floor ──
  const ap = ARCADE
  const runway = ctx.createLinearGradient(0, ap.towerFrontY, 0, ap.plazaBottom)
  runway.addColorStop(0, rgba('#ffb15e', 0.22))
  runway.addColorStop(1, rgba('#ffb15e', 0))
  ctx.fillStyle = runway
  ctx.fillRect(-36, ap.towerFrontY, 72, ap.plazaBottom - ap.towerFrontY)
  ctx.font = `700 34px ${FONT}`
  text(ctx, 'PROJECT ARCADE', 0, ap.plazaBottom - 48, 34, 'rgba(255,177,94,0.30)', 700, 'center', 14)
  // glow pools under each cabinet
  if (s.hq) {
    for (const p of props) {
      if (p.kind === 'cabinet') {
        const col = p.project ? p.project.accent : '#8a90b8'
        bloom(ctx, col, p.x, p.y + 4, 62, 0.28)
      }
    }
  }
}

/* ── props ─────────────────────────────────────────────────────────────── */

const baseY = (p: Prop) => (p.kind === 'planet' ? p.y + 30 : p.kind === 'crate' ? p.y + p.h : p.y)

// Static, so sort once. The player is merged in at draw time.
const sortedProps = props.slice().sort((a, b) => baseY(a) - baseY(b))

const CULL: Record<Prop['kind'], { r: number; up: number }> = {
  tower: { r: 420, up: 360 },
  cabinet: { r: 130, up: 90 },
  planet: { r: 190, up: 90 },
  pc: { r: 110, up: 60 },
  dish: { r: 230, up: 120 },
  pad: { r: 70, up: 10 },
  danfo: { r: 130, up: 30 },
  lamp: { r: 90, up: 20 },
  crystal: { r: 90, up: 30 },
  beacon: { r: 230, up: 70 },
  obi: { r: 150, up: 40 },
  crate: { r: 50, up: 10 },
}

function drawShadow(ctx: Ctx, x: number, y: number, rx: number, ry: number, a = 0.4) {
  ctx.fillStyle = `rgba(0,0,0,${a})`
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU)
  ctx.fill()
}

function drawTower(ctx: Ctx, p: Extract<Prop, { kind: 'tower' }>, s: RenderState) {
  const t = s.t
  const focus = s.focusId === p.id
  const x = p.x
  const y = p.y
  const gold = '#ffb15e'
  drawShadow(ctx, x, y + 8, 250, 26, 0.5)

  // tier 1
  const w1 = 380
  block(ctx, x - w1 / 2, y, w1, 100, 250, 0, lin(ctx, y - 250, y, '#1c2350', '#0c1030'), '#2a3370', rgba(gold, 0.5))
  // tier 2
  const y2 = y - 14
  const w2 = 290
  block(ctx, x - w2 / 2, y2, w2, 80, 190, 250, lin(ctx, y2 - 440, y2 - 250, '#1a2148', '#111638'), '#2a3370', rgba(gold, 0.55))
  // tier 3 reactor
  const y3 = y - 26
  const w3 = 150
  block(ctx, x - w3 / 2, y3, w3, 56, 130, 440, lin(ctx, y3 - 570, y3 - 440, '#1e2a60', '#141b46'), '#324088', rgba(gold, 0.6))
  // reactor glass
  const gy = y3 - 505
  bloom(ctx, '#7fd0ff', x, gy, 90, 0.55 + Math.sin(t * 2) * 0.1)
  rr(ctx, x - 44, gy - 34, 88, 68, 10)
  ctx.fillStyle = lin(ctx, gy - 34, gy + 34, 'rgba(150,220,255,0.9)', 'rgba(60,140,255,0.55)')
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.beginPath()
  ctx.moveTo(x - 30, gy - 24)
  ctx.lineTo(x - 30, gy + 24)
  ctx.moveTo(x + 30, gy - 24)
  ctx.lineTo(x + 30, gy + 24)
  ctx.stroke()

  // antenna + blinking light
  const ay = y3 - 570 - 56
  ctx.strokeStyle = '#8a95d6'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(x, ay)
  ctx.lineTo(x, ay - 120)
  ctx.stroke()
  const blink = Math.sin(t * 3) > 0 ? 1 : 0.25
  bloom(ctx, '#ff4d6d', x, ay - 124, 26, blink)

  // vertical neon strips
  ctx.lineWidth = 3
  ctx.strokeStyle = rgba(gold, 0.85)
  for (const sx of [x - w1 / 2 + 6, x + w1 / 2 - 6]) {
    ctx.beginPath()
    ctx.moveTo(sx, y)
    ctx.lineTo(sx, y - 250)
    ctx.stroke()
  }

  // sign band
  const sy = y - 220
  rr(ctx, x - 175, sy - 24, 350, 48, 8)
  ctx.fillStyle = 'rgba(6,8,22,0.92)'
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = rgba(gold, 0.9)
  ctx.stroke()
  bloom(ctx, gold, x, sy, 190, 0.22)
  text(ctx, portfolio.studio.toUpperCase(), x, sy + 1, 30, '#fff4e0', 700, 'center', 6)

  // windows (deterministic pattern with a slow flicker)
  const rnd = mulberry32(5)
  const win = (wx: number, wy: number, ww: number, wh: number) => {
    const on = rnd()
    const flick = on > 0.93 ? (Math.sin(t * 3 + wx) > 0 ? 1 : 0.2) : 1
    const lit = on > 0.35
    ctx.fillStyle = lit ? `rgba(160,225,255,${0.75 * flick})` : 'rgba(40,50,100,0.7)'
    ctx.fillRect(wx, wy, ww, wh)
  }
  for (let c = 0; c < 10; c++) win(x - 172 + c * 36, y - 246, 20, 14)
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    win(x - 165 + c * 38, y - 148 + r * 34, 22, 22)
    win(x + 55 + c * 38, y - 148 + r * 34, 22, 22)
  }
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) win(x - 132 + c * 34, y2 - 436 + r * 36, 18, 22)

  // door
  const dw = 70
  const dh = 104
  const pulse = 0.65 + Math.sin(t * 2.2) * 0.15 + (focus ? 0.25 : 0)
  bloom(ctx, '#ffd9a0', x, y - 40, 120, pulse * 0.6)
  ctx.beginPath()
  ctx.moveTo(x - dw / 2, y)
  ctx.lineTo(x - dw / 2, y - dh + 32)
  ctx.arc(x, y - dh + 32, dw / 2, Math.PI, 0)
  ctx.lineTo(x + dw / 2, y)
  ctx.closePath()
  ctx.fillStyle = lin(ctx, y - dh, y, '#fff0cf', '#ffb15e')
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = focus ? '#ffffff' : gold
  ctx.stroke()
  // door mullions
  ctx.strokeStyle = 'rgba(80,40,0,0.55)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y - dh + 6)
  ctx.lineTo(x, y)
  ctx.stroke()
  // steps
  ctx.fillStyle = '#1a2150'
  ctx.fillRect(x - 60, y - 2, 120, 8)
  ctx.fillStyle = rgba(gold, 0.6)
  ctx.fillRect(x - 60, y + 6, 120, 2)
}

function drawIcon(ctx: Ctx, i: number, x: number, y: number, c: string, t: number) {
  ctx.strokeStyle = c
  ctx.fillStyle = c
  ctx.lineWidth = 2.5
  ctx.lineJoin = 'round'
  ctx.beginPath()
  switch (i % 6) {
    case 0:
      ctx.arc(x, y, 9, 0, TAU)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, TAU)
      ctx.fill()
      break
    case 1:
      ctx.moveTo(x, y - 10)
      ctx.lineTo(x + 10, y + 8)
      ctx.lineTo(x - 10, y + 8)
      ctx.closePath()
      ctx.stroke()
      break
    case 2:
      ctx.moveTo(x, y - 11)
      ctx.lineTo(x + 9, y)
      ctx.lineTo(x, y + 11)
      ctx.lineTo(x - 9, y)
      ctx.closePath()
      ctx.stroke()
      break
    case 3:
      ctx.strokeRect(x - 9, y - 9, 18, 18)
      ctx.fillRect(x - 3, y - 3, 6, 6)
      break
    case 4:
      ctx.moveTo(x + 3, y - 11)
      ctx.lineTo(x - 6, y + 1)
      ctx.lineTo(x + 1, y + 1)
      ctx.lineTo(x - 3, y + 11)
      ctx.lineTo(x + 7, y - 2)
      ctx.lineTo(x, y - 2)
      ctx.closePath()
      ctx.stroke()
      break
    default:
      ctx.moveTo(x - 10, y)
      ctx.lineTo(x - 4, y - 8)
      ctx.lineTo(x + 2, y + 8)
      ctx.lineTo(x + 8, y - 3)
      ctx.lineTo(x + 11, y + 1)
      ctx.stroke()
  }
  void t
}

function drawCabinet(ctx: Ctx, p: Extract<Prop, { kind: 'cabinet' }>, s: RenderState) {
  const t = s.t
  const focus = s.focusId === p.id
  const soon = !p.project
  const acc = p.project ? p.project.accent : '#7d84ad'
  const seen = p.project ? s.seenProjects.has(p.project.id) : false
  const lift = focus ? -3 - Math.sin(t * 6) * 1 : 0
  const x = p.x
  const y = p.y + lift
  const w = 76
  const h = 122
  drawShadow(ctx, x, p.y + 5, 46, 9, 0.5)

  // body
  block(ctx, x - w / 2, y, w, 44, h, 0, lin(ctx, y - h, y, shade('#1b2148', soon ? -0.2 : 0), '#0b0e28'), soon ? '#232849' : '#2a3370', rgba(acc, focus ? 1 : 0.55))
  // side light strips
  ctx.fillStyle = rgba(acc, 0.55 + (focus ? 0.4 : 0))
  ctx.fillRect(x - w / 2, y - h, 3, h)
  ctx.fillRect(x + w / 2 - 3, y - h, 3, h)

  // marquee
  rr(ctx, x - 33, y - h + 5, 66, 21, 4)
  ctx.fillStyle = soon ? '#3a4070' : acc
  ctx.fill()
  const label = soon ? 'SOON' : p.project!.short
  ctx.font = `700 ${label.length > 8 ? 11 : 13}px ${FONT}`
  text(ctx, label, x, y - h + 16, label.length > 8 ? 11 : 13, '#080a1c', 700, 'center', 0.5)
  bloom(ctx, acc, x, y - h + 15, 44, focus ? 0.5 : 0.28)

  // screen
  const sx = x - 30
  const sy = y - h + 32
  rr(ctx, sx, sy, 60, 46, 5)
  ctx.fillStyle = '#04050e'
  ctx.fill()
  const scr = rgba(acc, soon ? 0.15 : 0.32)
  rr(ctx, sx + 3, sy + 3, 54, 40, 3)
  ctx.fillStyle = lin(ctx, sy, sy + 46, scr, rgba(acc, 0.06))
  ctx.fill()
  ctx.save()
  rr(ctx, sx + 3, sy + 3, 54, 40, 3)
  ctx.clip()
  if (soon) {
    text(ctx, '?', x, sy + 22, 30, rgba('#b8bfe8', 0.8 + Math.sin(t * 3) * 0.2), 700)
  } else {
    drawIcon(ctx, p.index, x, sy + 20, '#ffffff', t)
    text(ctx, `#${String(p.index + 1).padStart(2, '0')}`, x, sy + 37, 9, rgba('#ffffff', 0.7), 700, 'center', 1)
  }
  // scanline
  const scan = (t * 34 + p.index * 11) % 46
  ctx.fillStyle = rgba('#ffffff', 0.14)
  ctx.fillRect(sx + 3, sy + scan, 54, 3)
  ctx.restore()

  // control deck
  ctx.fillStyle = '#2c3568'
  ctx.fillRect(x - 36, y - 40, 72, 12)
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillRect(x - 36, y - 40, 72, 2)
  ctx.fillStyle = '#12162e'
  ctx.beginPath()
  ctx.arc(x - 16, y - 34, 3.2, 0, TAU)
  ctx.fill()
  ctx.fillStyle = '#ff5e7e'
  ctx.beginPath()
  ctx.arc(x - 16, y - 38, 3, 0, TAU)
  ctx.fill()
  ctx.fillStyle = acc
  ctx.beginPath()
  ctx.arc(x + 6, y - 34, 3, 0, TAU)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x + 17, y - 34, 3, 0, TAU)
  ctx.fill()

  // coin door
  ctx.fillStyle = '#0a0d24'
  ctx.fillRect(x - 15, y - 24, 30, 18)
  ctx.fillStyle = rgba(acc, 0.85)
  ctx.fillRect(x - 5, y - 18, 10, 3)

  // visited tick
  if (seen) {
    ctx.fillStyle = '#2ee6a6'
    ctx.beginPath()
    ctx.arc(x + w / 2 - 6, y - h + 6, 6, 0, TAU)
    ctx.fill()
    ctx.strokeStyle = '#06122a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x + w / 2 - 9, y - h + 6)
    ctx.lineTo(x + w / 2 - 6.5, y - h + 8.5)
    ctx.lineTo(x + w / 2 - 2.5, y - h + 3.5)
    ctx.stroke()
  }

  if (focus) {
    ctx.strokeStyle = rgba(acc, 0.85)
    ctx.lineWidth = 2
    ctx.strokeRect(x - w / 2 - 3, y - h - 47, w + 6, h + 47 + 3)
  }
}

function drawPlanet(ctx: Ctx, p: Extract<Prop, { kind: 'planet' }>, s: RenderState) {
  const t = s.t
  const focus = s.focusId === p.id
  const R = 74
  const bob = Math.sin(t * 1.3 + p.seed) * 5
  const cx = p.x
  const cy = p.y - 96 + bob

  drawShadow(ctx, p.x, p.y + 26, 64 - bob * 0.5, 14, 0.45)

  // landing pad + zone ring
  ctx.strokeStyle = rgba(p.color, 0.5)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(p.x, p.y + 20, 58, 15, 0, 0, TAU)
  ctx.stroke()
  bloom(ctx, p.color, p.x, p.y + 20, 90, 0.35)
  ctx.setLineDash([6, 14])
  ctx.lineDashOffset = -t * 16
  ctx.lineWidth = 2
  ctx.strokeStyle = rgba(p.color, focus ? 0.8 : 0.35)
  ctx.beginPath()
  ctx.arc(p.x, p.y + 10, 118, 0, TAU)
  ctx.stroke()
  ctx.setLineDash([])

  // hover beam
  const beam = ctx.createLinearGradient(0, cy + R * 0.6, 0, p.y + 20)
  beam.addColorStop(0, rgba(p.color, 0.28))
  beam.addColorStop(1, rgba(p.color, 0))
  ctx.fillStyle = beam
  ctx.beginPath()
  ctx.moveTo(cx - 30, cy + R * 0.8)
  ctx.lineTo(cx + 30, cy + R * 0.8)
  ctx.lineTo(cx + 54, p.y + 20)
  ctx.lineTo(cx - 54, p.y + 20)
  ctx.closePath()
  ctx.fill()

  bloom(ctx, p.color, cx, cy, R * 2.3, 0.5)

  const ring = (front: boolean) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(-0.38)
    if (front) {
      ctx.beginPath()
      ctx.rect(-R * 3, 0, R * 6, R * 3)
      ctx.clip()
    }
    ctx.lineWidth = 9
    ctx.strokeStyle = rgba('#dfe6ff', 0.5)
    ctx.beginPath()
    ctx.ellipse(0, 0, R * 1.75, R * 0.5, 0, 0, TAU)
    ctx.stroke()
    ctx.lineWidth = 2
    ctx.strokeStyle = rgba(p.color, 0.95)
    ctx.beginPath()
    ctx.ellipse(0, 0, R * 1.95, R * 0.57, 0, 0, TAU)
    ctx.stroke()
    ctx.restore()
  }
  if (p.ring) ring(false)

  // body
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, TAU)
  ctx.clip()
  const body = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.45, R * 0.1, cx, cy, R)
  body.addColorStop(0, shade(p.color, 0.78))
  body.addColorStop(0.5, p.color)
  body.addColorStop(1, shade(p.color, -0.4))
  ctx.fillStyle = body
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2)
  // surface bands & blobs
  const rnd = mulberry32(p.seed * 97)
  for (let i = 0; i < 6; i++) {
    const by = cy - R + (i + 0.5) * ((R * 2) / 6) + Math.sin(t * 0.5 + i) * 2
    ctx.fillStyle = `rgba(255,255,255,${0.05 + rnd() * 0.08})`
    ctx.fillRect(cx - R, by, R * 2, 5 + rnd() * 9)
  }
  const drift = (t * 6) % (R * 2)
  for (let i = 0; i < 6; i++) {
    const bx = cx - R + ((rnd() * R * 2 + drift) % (R * 2))
    const by = cy - R * 0.7 + rnd() * R * 1.4
    ctx.fillStyle = i % 2 ? `rgba(255,255,255,${0.07 + rnd() * 0.08})` : `rgba(0,0,30,${0.08 + rnd() * 0.08})`
    ctx.beginPath()
    ctx.ellipse(bx, by, 10 + rnd() * 14, 6 + rnd() * 8, 0, 0, TAU)
    ctx.fill()
  }
  // glyph
  ctx.globalAlpha = 0.9
  text(ctx, p.glyph, cx - 6, cy + 4, p.glyph.length > 2 ? 26 : 34, 'rgba(255,255,255,0.95)', 700, 'center', 1)
  ctx.globalAlpha = 1
  // night side
  const night = ctx.createRadialGradient(cx - R * 0.55, cy - R * 0.55, R * 0.6, cx + R * 0.3, cy + R * 0.3, R * 1.5)
  night.addColorStop(0, 'rgba(0,0,10,0)')
  night.addColorStop(1, 'rgba(0,0,14,0.5)')
  ctx.fillStyle = night
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2)
  ctx.restore()
  ctx.strokeStyle = rgba('#ffffff', 0.35)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, TAU)
  ctx.stroke()

  if (p.ring) ring(true)

  // tiny moon
  const ma = t * 0.9 + p.seed
  const mx = cx + Math.cos(ma) * (R + 34)
  const my = cy + Math.sin(ma) * 16 - 4
  if (Math.sin(ma) > -0.2 || Math.abs(Math.cos(ma)) > 0.6) {
    ctx.fillStyle = '#cfd6ff'
    ctx.beginPath()
    ctx.arc(mx, my, 7, 0, TAU)
    ctx.fill()
    ctx.fillStyle = 'rgba(0,0,20,0.35)'
    ctx.beginPath()
    ctx.arc(mx + 2, my + 2, 6, 0, TAU)
    ctx.fill()
  }
}

function drawPC(ctx: Ctx, p: Extract<Prop, { kind: 'pc' }>, s: RenderState) {
  const t = s.t
  const focus = s.focusId === p.id
  const bob = Math.sin(t * 1.8) * 4
  const x = p.x
  const y = p.y - 46 + bob
  drawShadow(ctx, p.x, p.y + 12, 34 - bob * 0.4, 8, 0.4)
  ctx.strokeStyle = rgba('#5aa9ff', 0.6)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(p.x, p.y + 8, 34, 9, 0, 0, TAU)
  ctx.stroke()
  bloom(ctx, '#5aa9ff', p.x, p.y + 8, 56, 0.35)
  // stand + keyboard
  ctx.fillStyle = '#1c2350'
  ctx.fillRect(x - 5, y + 20, 10, 12)
  rr(ctx, x - 26, y + 32, 52, 8, 3)
  ctx.fillStyle = '#28316a'
  ctx.fill()
  // monitor
  rr(ctx, x - 34, y - 26, 68, 48, 6)
  ctx.fillStyle = '#0a0d24'
  ctx.fill()
  ctx.lineWidth = 2.5
  ctx.strokeStyle = focus ? '#fff' : rgba('#5aa9ff', 0.9)
  ctx.stroke()
  ctx.save()
  rr(ctx, x - 30, y - 22, 60, 40, 3)
  ctx.clip()
  ctx.fillStyle = '#061225'
  ctx.fillRect(x - 30, y - 22, 60, 40)
  const rnd = mulberry32(21)
  for (let i = 0; i < 8; i++) {
    const ly = y - 20 + i * 5 + ((t * 8) % 5)
    const lw = 10 + rnd() * 32
    ctx.fillStyle = i % 3 === 0 ? 'rgba(46,230,166,0.85)' : i % 3 === 1 ? 'rgba(90,169,255,0.85)' : 'rgba(255,177,94,0.85)'
    ctx.fillRect(x - 26 + (i % 2) * 6, ly, lw, 2.5)
  }
  ctx.restore()
  bloom(ctx, '#5aa9ff', x, y - 4, 60, 0.28)
}

function drawDish(ctx: Ctx, p: Extract<Prop, { kind: 'dish' }>, s: RenderState) {
  const t = s.t
  const focus = s.focusId === p.id
  const x = p.x
  const y = p.y
  const g = '#2ee6a6'
  drawShadow(ctx, x, y + 6, 70, 12, 0.5)
  // console block
  block(ctx, x - 48, y, 96, 36, 36, 0, lin(ctx, y - 36, y, '#172046', '#0b0f2a'), '#232c60', rgba(g, focus ? 1 : 0.55))
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i === 1 ? rgba(g, 0.9) : rgba('#5aa9ff', 0.8)
    ctx.fillRect(x - 36 + i * 26, y - 28, 20, 14)
  }
  // mast
  const topY = y - 36 - 18 - 150
  ctx.strokeStyle = '#8a95d6'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(x, y - 36 - 18)
  ctx.lineTo(x, topY)
  ctx.stroke()
  ctx.strokeStyle = '#4a5490'
  ctx.lineWidth = 2
  for (let i = 0; i < 5; i++) {
    const yy = y - 54 - i * 28
    ctx.beginPath()
    ctx.moveTo(x - 9, yy)
    ctx.lineTo(x + 9, yy - 14)
    ctx.stroke()
  }
  // dish (fake rotation via squeezing)
  const a = t * 0.9
  const sq = 0.6 + Math.abs(Math.cos(a)) * 0.4
  ctx.save()
  ctx.translate(x, topY)
  ctx.rotate(Math.sin(a) * 0.25)
  ctx.beginPath()
  ctx.ellipse(0, 0, 40 * sq, 34, 0, 0, TAU)
  ctx.fillStyle = lin(ctx, -34, 34, '#e6edff', '#8a95d6')
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = rgba(g, 0.9)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(20,30,80,0.5)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(0, 0, 20 * sq, 16, 0, 0, TAU)
  ctx.stroke()
  ctx.restore()
  // waves
  ctx.lineWidth = 2
  for (let i = 0; i < 3; i++) {
    const k = ((t * 0.8 + i / 3) % 1)
    ctx.strokeStyle = rgba(g, (1 - k) * 0.7)
    ctx.beginPath()
    ctx.arc(x, topY - 4, 30 + k * 110, -Math.PI * 0.85, -Math.PI * 0.15)
    ctx.stroke()
  }
  const blink = Math.sin(t * 4) > 0 ? 1 : 0.2
  bloom(ctx, '#ff4d6d', x, topY - 40, 20, blink)
  bloom(ctx, g, x, y - 20, 90, 0.25 + (focus ? 0.2 : 0))
}

function drawPad(ctx: Ctx, p: Extract<Prop, { kind: 'pad' }>, s: RenderState) {
  const focus = s.focusId === p.id
  const since = s.padPress[p.index] ?? 99
  const pressed = since < 0.25
  drawShadow(ctx, p.x, p.y + 4, 26, 8, 0.35)
  ctx.beginPath()
  ctx.ellipse(p.x, p.y + 2, 25, 11, 0, 0, TAU)
  ctx.fillStyle = '#12173a'
  ctx.fill()
  ctx.lineWidth = 2.5
  ctx.strokeStyle = rgba(p.color, focus ? 1 : 0.65)
  ctx.stroke()
  const up = pressed ? 0 : 6
  ctx.beginPath()
  ctx.ellipse(p.x, p.y + 2 - up, 15, 7, 0, 0, TAU)
  ctx.fillStyle = shade(p.color, -0.45)
  ctx.fill()
  if (!pressed) {
    ctx.fillStyle = shade(p.color, -0.45)
    ctx.fillRect(p.x - 15, p.y + 2 - up, 30, up)
  }
  ctx.beginPath()
  ctx.ellipse(p.x, p.y - up, 15, 7, 0, 0, TAU)
  ctx.fillStyle = lin(ctx, p.y - up - 7, p.y - up + 7, shade(p.color, 0.35), p.color)
  ctx.fill()
  bloom(ctx, p.color, p.x, p.y - 2, focus ? 60 : 42, pressed ? 0.9 : focus ? 0.6 : 0.35)
  if (since < 0.7) {
    const k = since / 0.7
    ctx.strokeStyle = rgba(p.color, (1 - k) * 0.9)
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(p.x, p.y, 20 + k * 70, 9 + k * 30, 0, 0, TAU)
    ctx.stroke()
  }
}

function drawDanfo(ctx: Ctx, p: Extract<Prop, { kind: 'danfo' }>, s: RenderState) {
  const t = s.t
  const focus = s.focusId === p.id
  const x = p.x - 75
  const y = p.y
  const w = 150
  const h = 62
  drawShadow(ctx, p.x, y + 4, 86, 12, 0.5)
  // wheels
  ctx.fillStyle = '#0a0a12'
  ctx.fillRect(x + 12, y - 8, 22, 12)
  ctx.fillRect(x + w - 34, y - 8, 22, 12)
  // body
  block(ctx, x, y - 6, w, 48, h, 0, lin(ctx, y - 68, y - 6, '#ffd23a', '#e5a90c'), '#ffe27a', focus ? '#fff' : '#a97800')
  // black band
  ctx.fillStyle = '#12121a'
  ctx.fillRect(x, y - 30, w, 12)
  text(ctx, 'NAIJA EXPRESS', x + w / 2, y - 24, 10, '#ffd23a', 700, 'center', 3)
  // windows
  for (let i = 0; i < 5; i++) {
    const wx = x + 8 + i * 28
    ctx.fillStyle = '#2b3a6a'
    ctx.fillRect(wx, y - 58, 23, 22)
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.fillRect(wx + 2, y - 56, 8, 18)
  }
  // lights + bumper
  ctx.fillStyle = '#fff6c8'
  ctx.beginPath()
  ctx.arc(x + 16, y - 12, 5, 0, TAU)
  ctx.arc(x + w - 16, y - 12, 5, 0, TAU)
  ctx.fill()
  bloom(ctx, '#fff2a8', x + 16, y - 12, 30, 0.5)
  bloom(ctx, '#fff2a8', x + w - 16, y - 12, 30, 0.5)
  ctx.fillStyle = '#12121a'
  ctx.fillRect(x + 30, y - 14, w - 60, 8)
  // roof rack + sign
  ctx.fillStyle = '#12121a'
  ctx.fillRect(x + 50, y - 68 - 48 - 6, 50, 8)
  if (focus) bloom(ctx, '#ffd23a', p.x, y - 30, 120, 0.3 + Math.sin(t * 8) * 0.1)
}

function drawLamp(ctx: Ctx, p: Extract<Prop, { kind: 'lamp' }>, s: RenderState) {
  const pulse = 0.75 + Math.sin(s.t * 2 + p.x * 0.05) * 0.15
  if (s.hq) bloom(ctx, p.color, p.x, p.y, 34, 0.32 * pulse)
  drawShadow(ctx, p.x, p.y + 1, 6, 2.5, 0.4)
  ctx.strokeStyle = '#2a3268'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(p.x, p.y)
  ctx.lineTo(p.x, p.y - 42)
  ctx.stroke()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(p.x, p.y - 46, 4.5, 0, TAU)
  ctx.fill()
  bloom(ctx, p.color, p.x, p.y - 46, 26, pulse)
}

function drawCrystal(ctx: Ctx, p: Extract<Prop, { kind: 'crystal' }>, s: RenderState) {
  const k = p.s
  const sh = 0.8 + Math.sin(s.t * 1.5 + p.x) * 0.2
  bloom(ctx, p.color, p.x, p.y - 22 * k, 46 * k, 0.4 * sh)
  drawShadow(ctx, p.x, p.y + 1, 14 * k, 4 * k, 0.4)
  const shard = (dx: number, sc: number) => {
    const cx = p.x + dx * k
    const bx = 9 * k * sc
    const hh = 56 * k * sc
    ctx.beginPath()
    ctx.moveTo(cx, p.y)
    ctx.lineTo(cx - bx, p.y - hh * 0.45)
    ctx.lineTo(cx, p.y - hh)
    ctx.lineTo(cx + bx, p.y - hh * 0.45)
    ctx.closePath()
    ctx.fillStyle = lin(ctx, p.y - hh, p.y, shade(p.color, 0.5), shade(p.color, -0.35))
    ctx.fill()
    ctx.strokeStyle = rgba('#ffffff', 0.55)
    ctx.lineWidth = 1.2
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx, p.y - hh)
    ctx.lineTo(cx, p.y)
    ctx.strokeStyle = rgba('#ffffff', 0.25)
    ctx.stroke()
  }
  shard(-12, 0.62)
  shard(11, 0.5)
  shard(0, 1)
}

function drawBeacon(ctx: Ctx, _p: Extract<Prop, { kind: 'beacon' }>, s: RenderState) {
  const t = s.t
  drawShadow(ctx, 0, 10, 44, 12, 0.5)
  bloom(ctx, '#5aa9ff', 0, -4, 130, 0.35)
  // base rings
  ctx.lineWidth = 3
  ctx.strokeStyle = rgba('#5aa9ff', 0.8)
  ctx.beginPath()
  ctx.ellipse(0, 6, 40, 12, 0, 0, TAU)
  ctx.stroke()
  ctx.fillStyle = '#12173a'
  ctx.beginPath()
  ctx.ellipse(0, 6, 34, 9, 0, 0, TAU)
  ctx.fill()
  // pylon
  const bob = Math.sin(t * 1.5) * 4
  const sq = 0.35 + Math.abs(Math.cos(t * 0.8)) * 0.65
  const cy = -72 + bob
  ctx.beginPath()
  ctx.moveTo(0, cy - 56)
  ctx.lineTo(24 * sq, cy)
  ctx.lineTo(0, cy + 56)
  ctx.lineTo(-24 * sq, cy)
  ctx.closePath()
  ctx.fillStyle = lin(ctx, cy - 56, cy + 56, '#d6ecff', '#3a6bff')
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'
  ctx.stroke()
  bloom(ctx, '#7fd0ff', 0, cy, 84, 0.7)
  // orbit ring
  for (const front of [false, true]) {
    ctx.save()
    ctx.translate(0, cy)
    ctx.rotate(t * 0.4)
    if (front) {
      ctx.beginPath()
      ctx.rect(-100, 0, 200, 100)
      ctx.clip()
    }
    ctx.strokeStyle = rgba('#9b7bff', 0.8)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(0, 0, 54, 16, 0, 0, TAU)
    ctx.stroke()
    ctx.restore()
  }
  text(ctx, 'iN', 0, cy - 4, 20, 'rgba(6,14,50,0.9)', 700, 'center', 0)
}

function drawObi(ctx: Ctx, p: Extract<Prop, { kind: 'obi' }>, s: RenderState) {
  const t = s.t
  const focus = s.focusId === p.id
  const bob = Math.sin(t * 2.1) * 4
  const x = p.x
  const y = p.y - 30 + bob
  drawShadow(ctx, p.x, p.y + 14, 20 - bob * 0.3, 6, 0.4)
  ctx.strokeStyle = rgba('#7fd0ff', 0.75)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(p.x, p.y + 12, 22, 7, 0, 0, TAU)
  ctx.stroke()
  // beam
  const beam = ctx.createLinearGradient(0, y, 0, p.y + 12)
  beam.addColorStop(0, 'rgba(127,208,255,0.3)')
  beam.addColorStop(1, 'rgba(127,208,255,0)')
  ctx.fillStyle = beam
  ctx.beginPath()
  ctx.moveTo(x - 10, y + 10)
  ctx.lineTo(x + 10, y + 10)
  ctx.lineTo(x + 22, p.y + 12)
  ctx.lineTo(x - 22, p.y + 12)
  ctx.closePath()
  ctx.fill()
  bloom(ctx, '#7fd0ff', x, y, focus ? 70 : 52, focus ? 0.7 : 0.45)
  // ring behind
  const orbit = (front: boolean) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(-0.3)
    if (front) {
      ctx.beginPath()
      ctx.rect(-60, 0, 120, 60)
      ctx.clip()
    }
    ctx.strokeStyle = rgba('#b7e8ff', 0.85)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(0, 0, 28, 8, 0, 0, TAU)
    ctx.stroke()
    ctx.restore()
  }
  orbit(false)
  // body
  const g = ctx.createRadialGradient(x - 6, y - 7, 2, x, y, 18)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(1, '#7fb8ff')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, 17, 0, TAU)
  ctx.fill()
  // visor
  rr(ctx, x - 12, y - 7, 24, 13, 6)
  ctx.fillStyle = '#081026'
  ctx.fill()
  const blinkOff = (t % 4.2) > 4.05
  ctx.fillStyle = '#7ff0ff'
  if (!blinkOff) {
    ctx.fillRect(x - 7, y - 3, 4, 5)
    ctx.fillRect(x + 3, y - 3, 4, 5)
  } else {
    ctx.fillRect(x - 7, y - 1, 4, 1.5)
    ctx.fillRect(x + 3, y - 1, 4, 1.5)
  }
  if (s.bubble) {
    ctx.strokeStyle = '#7ff0ff'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x - 4, y + 4)
    ctx.lineTo(x + Math.sin(t * 24) * 1.2, y + 4)
    ctx.lineTo(x + 4, y + 4)
    ctx.stroke()
  }
  orbit(true)
  const ba = t * 2
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x + Math.cos(ba) * 28 * Math.cos(-0.3), y + Math.sin(ba) * 8, 2.5, 0, TAU)
  ctx.fill()
}

function drawCrate(ctx: Ctx, p: Extract<Prop, { kind: 'crate' }>) {
  drawShadow(ctx, p.x + p.w / 2, p.y + p.h + 2, p.w * 0.7, 5, 0.4)
  block(ctx, p.x, p.y + p.h, p.w, p.h * 0.7, p.h, 0, '#1a2150', '#2a3370', 'rgba(90,169,255,0.6)')
  ctx.fillStyle = 'rgba(46,230,166,0.7)'
  ctx.fillRect(p.x + 4, p.y + p.h - p.h + 4, p.w - 8, 3)
}

/* ── player, orbs, fx ─────────────────────────────────────────────────── */

function drawPlayer(ctx: Ctx, s: RenderState) {
  const p = s.player
  const moving = Math.hypot(p.vx, p.vy) > 25
  const bob = moving ? Math.abs(Math.sin(p.step)) * -3 : Math.sin(s.t * 2) * -0.8
  const swing = moving ? Math.sin(p.step) * 4 : 0

  // dash after-images
  for (const tr of p.trail) {
    ctx.globalAlpha = tr.a * 0.35
    rr(ctx, tr.x - 9, tr.y - 26, 18, 22, 6)
    ctx.fillStyle = '#7fd0ff'
    ctx.fill()
  }
  ctx.globalAlpha = 1

  drawShadow(ctx, p.x, p.y + 2, 13, 5, 0.45)
  bloom(ctx, '#5aa9ff', p.x, p.y - 18, 46, 0.22 + (p.dash > 0 ? 0.3 : 0))

  // legs
  ctx.fillStyle = '#1a2250'
  rr(ctx, p.x - 8, p.y - 8 + swing * 0.4, 6, 10, 2)
  ctx.fill()
  rr(ctx, p.x + 2, p.y - 8 - swing * 0.4, 6, 10, 2)
  ctx.fill()

  const yy = p.y + bob
  // backpack
  ctx.fillStyle = '#2a3370'
  rr(ctx, p.x - 12, yy - 24, 5, 14, 2)
  ctx.fill()
  // torso
  rr(ctx, p.x - 9, yy - 26, 18, 20, 6)
  ctx.fillStyle = lin(ctx, yy - 26, yy - 6, '#6fb6ff', '#7d5cff')
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 1.2
  ctx.stroke()
  // chest light
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(p.x - 3, yy - 19, 6, 2.5)
  // head
  const hx = p.x
  const hy = yy - 34
  const hg = ctx.createRadialGradient(hx - 3, hy - 4, 1, hx, hy, 11)
  hg.addColorStop(0, '#ffffff')
  hg.addColorStop(1, '#b9c9ff')
  ctx.fillStyle = hg
  ctx.beginPath()
  ctx.arc(hx, hy, 11, 0, TAU)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.stroke()
  // visor follows facing
  const vx = p.fx * 2.6
  const vy = p.fy * 1.5
  rr(ctx, hx - 8 + vx, hy - 4 + vy, 16, 9, 4)
  ctx.fillStyle = '#060a1e'
  ctx.fill()
  ctx.fillStyle = '#7ff0ff'
  ctx.fillRect(hx - 5 + vx, hy - 1.5 + vy, 3.2, 4)
  ctx.fillRect(hx + 1.8 + vx, hy - 1.5 + vy, 3.2, 4)
  // antenna
  ctx.strokeStyle = '#c9d6ff'
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(hx + 5, hy - 9)
  ctx.lineTo(hx + 8, hy - 17)
  ctx.stroke()
  bloom(ctx, '#2ee6a6', hx + 8, hy - 18, 12, 0.6 + Math.sin(s.t * 5) * 0.3)

  // stamina arc (only when spent)
  if (p.stamina < 99) {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(p.x, p.y - 16, 30, 0, TAU)
    ctx.stroke()
    ctx.strokeStyle = p.stamina < 34 ? '#ff6e8c' : '#7fd0ff'
    ctx.beginPath()
    ctx.arc(p.x, p.y - 16, 30, -Math.PI / 2, -Math.PI / 2 + (p.stamina / 100) * TAU)
    ctx.stroke()
  }
}

function drawOrbs(ctx: Ctx, s: RenderState) {
  const t = s.t
  const px = s.player.x
  const py = s.player.y
  const hw = s.W / (2 * s.zoom) + 60
  const hh = s.H / (2 * s.zoom) + 60
  for (const o of orbs) {
    if (s.collected.has(o.id)) continue
    if (Math.abs(o.x - s.camX) > hw || Math.abs(o.y - s.camY) > hh) continue
    const bob = Math.sin(t * 2.2 + o.x * 0.02) * 5
    const y = o.y - 24 + bob
    drawShadow(ctx, o.x, o.y + 2, 9 - bob * 0.2, 3.5, 0.35)
    bloom(ctx, o.color, o.x, y, 40, 0.75)
    const g = ctx.createRadialGradient(o.x - 2, y - 3, 1, o.x, y, 9)
    g.addColorStop(0, '#ffffff')
    g.addColorStop(1, o.color)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(o.x, y, 8.5, 0, TAU)
    ctx.fill()
    // sparkle cross
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'
    ctx.lineWidth = 1.5
    const sp = 12 + Math.sin(t * 5 + o.y) * 3
    ctx.beginPath()
    ctx.moveTo(o.x - sp, y)
    ctx.lineTo(o.x + sp, y)
    ctx.moveTo(o.x, y - sp)
    ctx.lineTo(o.x, y + sp)
    ctx.stroke()
    const d = Math.hypot(o.x - px, o.y - py)
    if (d < 150) {
      pill(ctx, o.skill, o.x, y - 30, 12, o.color, Math.min(1, (150 - d) / 60))
    }
  }
}

function drawParticles(ctx: Ctx, s: RenderState) {
  ctx.globalCompositeOperation = 'lighter'
  for (const p of s.particles) {
    const k = p.life / p.max
    if (p.kind === 'ring') {
      ctx.strokeStyle = rgba(p.color, k * 0.8)
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * (1 - k) * 4 + 6, 0, TAU)
      ctx.stroke()
    } else if (p.kind === 'spark') {
      ctx.strokeStyle = rgba(p.color, k)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05)
      ctx.stroke()
    } else {
      ctx.fillStyle = rgba(p.color, k * 0.9)
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * (0.4 + k * 0.6), 0, TAU)
      ctx.fill()
    }
  }
  ctx.globalCompositeOperation = 'source-over'
  for (const f of s.floaters) {
    const k = f.life
    ctx.globalAlpha = Math.min(1, k * 2)
    text(ctx, f.text, f.x, f.y, 16, f.color, 700, 'center', 1)
  }
  ctx.globalAlpha = 1
}

function drawLabels(ctx: Ctx, s: RenderState) {
  const t = s.t
  for (const l of labels) {
    const seen = l.landmark ? s.visited.has(l.landmark) : true
    pill(ctx, l.text, l.x, l.y, 18, l.color, 1, l.sub)
    if (l.landmark && !seen) {
      // bouncing beacon so unexplored landmarks read as "go here"
      const by = l.y + 34 + Math.abs(Math.sin(t * 3)) * 8
      bloom(ctx, l.color, l.x, by, 28, 0.6)
      ctx.fillStyle = l.color
      ctx.beginPath()
      ctx.moveTo(l.x - 9, by - 6)
      ctx.lineTo(l.x + 9, by - 6)
      ctx.lineTo(l.x, by + 7)
      ctx.closePath()
      ctx.fill()
    } else if (l.landmark) {
      ctx.fillStyle = '#2ee6a6'
      ctx.beginPath()
      ctx.arc(l.x + ctx.measureText(l.text).width / 2 + 18, l.y - 14, 7, 0, TAU)
      ctx.fill()
      ctx.strokeStyle = '#04122a'
      ctx.lineWidth = 2
      ctx.beginPath()
      const cx = l.x + ctx.measureText(l.text).width / 2 + 18
      ctx.moveTo(cx - 3, l.y - 14)
      ctx.lineTo(cx - 1, l.y - 11.5)
      ctx.lineTo(cx + 3.5, l.y - 17)
      ctx.stroke()
    }
  }
}

function drawFocusHint(ctx: Ctx, s: RenderState) {
  if (!s.focusId || s.mode !== 'playing') return
  const p = s.player
  const bounce = Math.sin(s.t * 6) * 2
  const kx = p.x
  const ky = p.y - 74 + bounce
  rr(ctx, kx - 13, ky - 13, 26, 26, 7)
  ctx.fillStyle = 'rgba(8,10,26,0.9)'
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#ffffff'
  ctx.stroke()
  if (s.touch) {
    ctx.fillStyle = '#7fd0ff'
    ctx.beginPath()
    ctx.arc(kx, ky, 5, 0, TAU)
    ctx.fill()
  } else {
    text(ctx, 'E', kx, ky + 1, 16, '#ffffff', 700)
  }
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(kx - 5, ky + 13)
  ctx.lineTo(kx + 5, ky + 13)
  ctx.lineTo(kx, ky + 19)
  ctx.closePath()
  ctx.fill()
}

function drawBubble(ctx: Ctx, s: RenderState) {
  if (!s.bubble) return
  const obi = props.find((p) => p.kind === 'obi')
  if (!obi) return
  const words = s.bubble.split(' ')
  const lines: string[] = []
  let cur = ''
  ctx.font = `600 13px ${FONT}`
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > 190 && cur) {
      lines.push(cur)
      cur = w
    } else cur = test
  }
  if (cur) lines.push(cur)
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 24
  const h = lines.length * 17 + 16
  const bx = obi.x
  const by = obi.y - 96
  rr(ctx, bx - w / 2, by - h, w, h, 10)
  ctx.fillStyle = 'rgba(8,14,34,0.92)'
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = 'rgba(127,240,255,0.85)'
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(bx - 6, by)
  ctx.lineTo(bx + 6, by)
  ctx.lineTo(bx, by + 8)
  ctx.closePath()
  ctx.fillStyle = 'rgba(8,14,34,0.92)'
  ctx.fill()
  lines.forEach((l, i) => text(ctx, l, bx, by - h + 16 + i * 17, 13, '#dff6ff', 600, 'center'))
}

/* ── minimap + compass (screen space) ─────────────────────────────────── */

function drawMinimap(ctx: Ctx, s: RenderState) {
  const size = 132
  const x0 = 16
  const y0 = s.H - size - 16
  const bw = WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX
  const bh = WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY
  const k = Math.min(size / bw, size / bh)
  const ox = x0 + (size - bw * k) / 2
  const oy = y0 + (size - bh * k) / 2
  const mx = (x: number) => ox + (x - WORLD_BOUNDS.minX) * k
  const my = (y: number) => oy + (y - WORLD_BOUNDS.minY) * k

  rr(ctx, x0, y0, size, size, 14)
  ctx.fillStyle = 'rgba(8,10,26,0.72)'
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = 'rgba(120,160,255,0.35)'
  ctx.stroke()

  for (const sh of shapes) {
    ctx.fillStyle = rgba(sh.accent, sh.island ? 0.35 : 0.5)
    if (sh.t === 'circle') {
      ctx.beginPath()
      ctx.arc(mx(sh.x), my(sh.y), sh.r * k, 0, TAU)
      ctx.fill()
    } else {
      ctx.fillRect(mx(sh.x), my(sh.y), sh.w * k, sh.h * k)
    }
  }
  for (const key of Object.keys(landmarkPos) as LandmarkKey[]) {
    const l = landmarkPos[key]
    const done = s.visited.has(key)
    ctx.fillStyle = done ? '#2ee6a6' : l.color
    ctx.beginPath()
    ctx.arc(mx(l.x), my(l.y), done ? 3 : 4 + Math.sin(s.t * 4) * 1, 0, TAU)
    ctx.fill()
  }
  for (const o of orbs) {
    if (s.collected.has(o.id)) continue
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillRect(mx(o.x) - 1, my(o.y) - 1, 2, 2)
  }
  // player
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(mx(s.player.x), my(s.player.y), 3.5, 0, TAU)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(mx(s.player.x), my(s.player.y), 6 + Math.sin(s.t * 4) * 1.5, 0, TAU)
  ctx.stroke()
}

function drawCompass(ctx: Ctx, s: RenderState) {
  if (s.mode !== 'playing' || !s.moved) return
  // nearest landmark not yet visited
  let best: LandmarkKey | null = null
  let bestD = Infinity
  for (const key of Object.keys(landmarkPos) as LandmarkKey[]) {
    if (s.visited.has(key)) continue
    const l = landmarkPos[key]
    const d = Math.hypot(l.x - s.player.x, l.y - s.player.y)
    if (d < bestD) (bestD = d), (best = key)
  }
  if (!best) return
  const l = landmarkPos[best]
  const sx = s.W / 2 + (l.x - s.camX) * s.zoom
  const sy = s.H / 2 + (l.y - s.camY) * s.zoom
  const margin = 70
  if (sx > margin && sx < s.W - margin && sy > margin + 40 && sy < s.H - margin) return
  const ang = Math.atan2(l.y - s.player.y, l.x - s.player.x)
  const rx = s.W / 2 - margin
  const ry = s.H / 2 - margin - 30
  const c = Math.cos(ang)
  const sn = Math.sin(ang)
  const scale = Math.min(Math.abs(rx / (c || 1e-6)), Math.abs(ry / (sn || 1e-6)))
  const ax = s.W / 2 + c * scale
  const ay = s.H / 2 + 14 + sn * scale
  ctx.save()
  ctx.translate(ax, ay)
  const pulse = 1 + Math.sin(s.t * 5) * 0.08
  ctx.scale(pulse, pulse)
  bloom(ctx, l.color, 0, 0, 44, 0.6)
  ctx.rotate(ang)
  ctx.beginPath()
  ctx.moveTo(16, 0)
  ctx.lineTo(-9, -11)
  ctx.lineTo(-4, 0)
  ctx.lineTo(-9, 11)
  ctx.closePath()
  ctx.fillStyle = l.color
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()
  const meters = Math.round(bestD / 10)
  pill(ctx, `${l.label.toUpperCase()}  ${meters}m`, ax - c * 4, ay - sn * 38 + (sn > 0.3 ? -8 : 0), 12, l.color, 0.95)
}

/* ── main entry ────────────────────────────────────────────────────────── */

export function render(ctx: Ctx, s: RenderState) {
  drawBackground(ctx, s)

  // world transform
  const z = s.zoom * s.dpr
  ctx.setTransform(z, 0, 0, z, (s.W / 2 - s.camX * s.zoom) * s.dpr, (s.H / 2 - s.camY * s.zoom) * s.dpr)

  drawPlatforms(ctx, s)
  drawGroundDetail(ctx, s)

  const hw = s.W / (2 * s.zoom)
  const hh = s.H / (2 * s.zoom)
  const py = s.player.y
  let playerDrawn = false

  drawOrbs(ctx, s)

  for (const p of sortedProps) {
    if (!playerDrawn && py < baseY(p)) {
      drawPlayer(ctx, s)
      playerDrawn = true
    }
    const c = CULL[p.kind]
    const cy = p.y - c.up
    if (Math.abs(p.x - s.camX) > hw + c.r || Math.abs(cy - s.camY) > hh + c.r + c.up) continue
    switch (p.kind) {
      case 'tower':
        drawTower(ctx, p, s)
        break
      case 'cabinet':
        drawCabinet(ctx, p, s)
        break
      case 'planet':
        drawPlanet(ctx, p, s)
        break
      case 'pc':
        drawPC(ctx, p, s)
        break
      case 'dish':
        drawDish(ctx, p, s)
        break
      case 'pad':
        drawPad(ctx, p, s)
        break
      case 'danfo':
        drawDanfo(ctx, p, s)
        break
      case 'lamp':
        drawLamp(ctx, p, s)
        break
      case 'crystal':
        drawCrystal(ctx, p, s)
        break
      case 'beacon':
        drawBeacon(ctx, p, s)
        break
      case 'obi':
        drawObi(ctx, p, s)
        break
      case 'crate':
        drawCrate(ctx, p)
        break
    }
  }
  if (!playerDrawn) drawPlayer(ctx, s)

  drawLabels(ctx, s)
  drawBubble(ctx, s)
  drawParticles(ctx, s)
  drawFocusHint(ctx, s)

  // screen-space overlays
  ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0)
  if (s.mode === 'playing') {
    if (s.W >= 900) drawMinimap(ctx, s)
    drawCompass(ctx, s)
  }
  void interactables
}
