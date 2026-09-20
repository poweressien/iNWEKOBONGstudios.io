import { makeCam, project, P, clamp, lerp, ease, smooth, hash, wrapAngle, type Cam } from './math'
import { glow, makeNebula, makeStarTile, mulberry32, rgba } from './sprites'
import { levels } from '@/data/levels'
import { portfolio } from '@/data/portfolio'
import { useApp } from '@/store/appStore'

type Ctx = CanvasRenderingContext2D
const TAU = Math.PI * 2
const FONT = '"Inter Tight", system-ui, -apple-system, "Segoe UI", sans-serif'

/* ── the tower ─────────────────────────────────────────────────────────── */

interface Tier {
  y0: number
  y1: number
  hw: number
  hd: number
  fh: number
  cols: number
  windows: boolean
}

const TIERS: Tier[] = [
  { y0: 0, y1: 90, hw: 330, hd: 290, fh: 45, cols: 12, windows: true }, // podium
  { y0: 90, y1: 920, hw: 205, hd: 165, fh: 23, cols: 14, windows: true }, // shaft
  { y0: 920, y1: 1260, hw: 165, hd: 132, fh: 23, cols: 11, windows: true }, // upper
  { y0: 1260, y1: 1440, hw: 112, hd: 92, fh: 22, cols: 8, windows: true }, // crown
  { y0: 1440, y1: 1720, hw: 8, hd: 8, fh: 0, cols: 0, windows: false }, // spire
]
const TOWER_TOP = 1720
const FACES = [
  { nx: 0, nz: 1 },
  { nx: 1, nz: 0 },
  { nx: 0, nz: -1 },
  { nx: -1, nz: 0 },
]
const BLADE_Y0 = 250
const BLADE_Y1 = 905
const DISC_R = 980
const DISC_DEPTH = 46

/* Light sources: a low warm sun and a big cool planet. Horizontal directions only. */
const SUN = { az: 2.02, el: 0.3 }
const PLANET = { az: 4.31, el: 0.2 }
const lightDir = (az: number) => ({ x: Math.sin(az), z: Math.cos(az) })
const LS = lightDir(SUN.az)
const LP = lightDir(PLANET.az)

const levelAtY = (y: number) => {
  for (let i = 0; i < levels.length; i++) if (y >= levels[i].y0 - 4 && y <= levels[i].y1 + 4) return i
  return -1
}

const stars = [
  { tile: makeStarTile(512, 110, 11), p: 0.1 },
  { tile: makeStarTile(512, 70, 12), p: 0.2 },
  { tile: makeStarTile(512, 36, 13), p: 0.36 },
]
const nebula = makeNebula(512, ['#16307a', '#2a2a78', '#0b5a66', '#1a2c5c'], 0.16)

function makeMilkyWay(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = 1400
  c.height = 300
  const g = c.getContext('2d')!
  const rnd = mulberry32(77)
  const band = g.createLinearGradient(0, 0, 0, 300)
  band.addColorStop(0, 'rgba(120,150,255,0)')
  band.addColorStop(0.5, 'rgba(150,170,255,0.20)')
  band.addColorStop(1, 'rgba(120,150,255,0)')
  g.fillStyle = band
  g.fillRect(0, 0, 1400, 300)
  for (let i = 0; i < 1500; i++) {
    const x = rnd() * 1400
    const y = 150 + (rnd() + rnd() + rnd() - 1.5) * 90
    g.fillStyle = `rgba(${200 + rnd() * 55},${205 + rnd() * 50},255,${0.15 + rnd() * 0.6})`
    g.fillRect(x, y, 1, 1)
  }
  g.globalCompositeOperation = 'destination-out'
  for (let i = 0; i < 26; i++) {
    const x = rnd() * 1400
    const y = 130 + rnd() * 40
    const r = 30 + rnd() * 70
    const d = g.createRadialGradient(x, y, 0, x, y, r)
    d.addColorStop(0, 'rgba(0,0,0,0.5)')
    d.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = d
    g.fillRect(x - r, y - r, r * 2, r * 2)
  }
  // fade the ends so the band has no visible edge
  const fade = g.createLinearGradient(0, 0, 1400, 0)
  fade.addColorStop(0, 'rgba(0,0,0,1)')
  fade.addColorStop(0.18, 'rgba(0,0,0,0)')
  fade.addColorStop(0.82, 'rgba(0,0,0,0)')
  fade.addColorStop(1, 'rgba(0,0,0,1)')
  g.fillStyle = fade
  g.fillRect(0, 0, 1400, 300)
  return c
}
const milky = makeMilkyWay()

interface LevelHit {
  i: number
  left: number
  right: number
  top: number
  bottom: number
  lx0: number
  ly0: number
  lx1: number
  ly1: number
}

export class Scene {
  private ctx: CanvasRenderingContext2D
  private raf = 0
  private last = 0
  private t = 0
  private W = 0
  private H = 0
  private dpr = 1
  private frozen = false
  private perfLevel = 0
  private slow = 0
  private warm = 0

  // camera state
  private yaw = 0.62
  private yawVel = 0
  private userPitch = 0
  private userZoom = 1
  private tY = 720
  private dist = 3600
  private pitch = -0.02
  private cx = 0
  private cy = 0
  private parX = 0
  private parY = 0
  private parSx = 0
  private parSy = 0
  private introT = 0
  private introSpeed = 1
  private markedReady = false

  // interaction
  private ptrs = new Map<number, { x: number; y: number }>()
  private moved = 0
  private pinch = 0
  private hits: LevelHit[] = []
  private mouse = { x: -1, y: -1, on: false }
  private lastInteract = 0
  private discTop = new Path2D()

  private signW1 = 0
  private signW2 = 0
  private signDirty = true
  private unsub: () => void

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('Canvas 2D is not available')
    this.ctx = ctx
    this.resize()
    window.addEventListener('resize', this.resize)
    window.addEventListener('orientationchange', this.resize)
    window.addEventListener('keydown', this.onKey)
    canvas.addEventListener('pointerdown', this.onDown)
    canvas.addEventListener('pointermove', this.onMove)
    canvas.addEventListener('pointerup', this.onUp)
    canvas.addEventListener('pointercancel', this.onCancel)
    canvas.addEventListener('pointerleave', this.onLeave)
    canvas.addEventListener('wheel', this.onWheel, { passive: false })
    document.addEventListener('visibilitychange', this.onVisibility)
    void document.fonts?.ready.then(() => (this.signDirty = true))
    this.unsub = useApp.subscribe(() => {
      /* camera reads store state each frame; nothing to do here */
    })
  }

  start() {
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('orientationchange', this.resize)
    window.removeEventListener('keydown', this.onKey)
    this.canvas.removeEventListener('pointerdown', this.onDown)
    this.canvas.removeEventListener('pointermove', this.onMove)
    this.canvas.removeEventListener('pointerup', this.onUp)
    this.canvas.removeEventListener('pointercancel', this.onCancel)
    this.canvas.removeEventListener('pointerleave', this.onLeave)
    this.canvas.removeEventListener('wheel', this.onWheel)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.unsub()
  }

  /* ── test hooks ── */
  freeze(v = true) {
    this.frozen = v
    this.last = performance.now()
  }
  advance(sec: number) {
    const n = Math.max(1, Math.round(sec * 60))
    for (let i = 0; i < n; i++) this.update(1 / 60)
    this.draw()
  }
  setView(o: { yaw?: number; introT?: number; zoom?: number }) {
    if (o.yaw !== undefined) this.yaw = o.yaw
    if (o.introT !== undefined) this.introT = o.introT
    if (o.zoom !== undefined) this.userZoom = o.zoom
  }

  /** Rotate to a level's face and open its panel (used by the dock and keyboard). */
  skipIntro() {
    this.introSpeed = 3.2
  }

  /* ── events ── */

  private onVisibility = () => {
    this.last = performance.now()
  }

  private onKey = (e: KeyboardEvent) => {
    const el = e.target as HTMLElement | null
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return
    const st = useApp.getState()
    if (e.code === 'Escape') {
      if (st.panel) st.close()
      return
    }
    if (!st.ready) return
    if (/^Digit[1-5]$/.test(e.code)) {
      const lv = levels[Number(e.code.slice(5)) - 1]
      if (lv) st.open(lv.panel)
      return
    }
    if (e.code === 'KeyC') st.open('concierge')
    if (e.code === 'ArrowLeft') this.yawVel += 0.5
    if (e.code === 'ArrowRight') this.yawVel -= 0.5
    if (e.code === 'ArrowUp') this.userZoom = clamp(this.userZoom * 0.92, 0.72, 1.35)
    if (e.code === 'ArrowDown') this.userZoom = clamp(this.userZoom * 1.08, 0.72, 1.35)
  }

  private onDown = (e: PointerEvent) => {
    this.canvas.setPointerCapture(e.pointerId)
    this.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (this.ptrs.size === 1) this.moved = 0
    if (this.ptrs.size === 2) {
      const [a, b] = [...this.ptrs.values()]
      this.pinch = Math.hypot(a.x - b.x, a.y - b.y)
    }
    if (this.introT < 1) this.skipIntro()
  }

  private onMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const p = this.ptrs.get(e.pointerId)
    if (e.pointerType === 'mouse') {
      this.mouse = { x: mx, y: my, on: true }
      this.parX = (mx / this.W - 0.5) * 2
      this.parY = (my / this.H - 0.5) * 2
    }
    if (!p) {
      if (e.pointerType === 'mouse') this.updateHover(mx, my)
      return
    }
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    p.x = e.clientX
    p.y = e.clientY
    this.moved += Math.abs(dx) + Math.abs(dy)
    if (this.ptrs.size === 2) {
      const [a, b] = [...this.ptrs.values()]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (this.pinch > 0) this.userZoom = clamp(this.userZoom * (this.pinch / d), 0.72, 1.35)
      this.pinch = d
      return
    }
    if (this.moved > 5) {
      this.yaw -= dx * 0.0052
      this.yawVel = -dx * 0.0052 * 60 * 0.6
      this.userPitch = clamp(this.userPitch + dy * 0.0018, -0.14, 0.16)
      this.lastInteract = this.t
    }
  }

  private onUp = (e: PointerEvent) => {
    const wasSingle = this.ptrs.size === 1
    this.ptrs.delete(e.pointerId)
    this.pinch = 0
    if (wasSingle && this.moved < 8) {
      const rect = this.canvas.getBoundingClientRect()
      const hit = this.hitTest(e.clientX - rect.left, e.clientY - rect.top)
      const st = useApp.getState()
      if (hit >= 0 && st.ready) st.open(levels[hit].panel)
      else if (st.panel && st.ready) st.close()
    }
  }

  private onCancel = (e: PointerEvent) => {
    this.ptrs.delete(e.pointerId)
    this.pinch = 0
  }

  private onLeave = () => {
    this.mouse.on = false
    this.parX = 0
    this.parY = 0
    useApp.getState().setHover(null)
    this.canvas.style.cursor = 'grab'
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault()
    this.userZoom = clamp(this.userZoom * Math.exp(e.deltaY * 0.0009), 0.72, 1.35)
  }

  private updateHover(x: number, y: number) {
    const h = this.hitTest(x, y)
    useApp.getState().setHover(h >= 0 ? h : null)
    this.canvas.style.cursor = h >= 0 ? 'pointer' : 'grab'
  }

  private hitTest(x: number, y: number): number {
    if (!useApp.getState().ready) return -1
    for (const h of this.hits) {
      if (x >= h.lx0 - 8 && x <= h.lx1 + 8 && y >= h.ly0 - 8 && y <= h.ly1 + 8) return h.i
    }
    for (const h of this.hits) {
      if (x >= h.left && x <= h.right && y >= Math.min(h.top, h.bottom) && y <= Math.max(h.top, h.bottom)) return h.i
    }
    return -1
  }

  private resize = () => {
    const parent = this.canvas.parentElement
    this.W = Math.max(1, parent ? parent.clientWidth : window.innerWidth)
    this.H = Math.max(1, parent ? parent.clientHeight : window.innerHeight)
    const coarse = window.matchMedia?.('(pointer: coarse)').matches
    const cap = this.perfLevel === 0 ? (coarse ? 1.75 : 2) : this.perfLevel === 1 ? 1.25 : 1
    this.dpr = Math.min(window.devicePixelRatio || 1, cap)
    this.canvas.width = Math.round(this.W * this.dpr)
    this.canvas.height = Math.round(this.H * this.dpr)
    this.canvas.style.width = `${this.W}px`
    this.canvas.style.height = `${this.H}px`
    if (this.cx === 0) {
      this.cx = this.W / 2
      this.cy = this.H / 2
    }
  }

  /* ── loop ── */

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame)
    let dt = (now - this.last) / 1000
    this.last = now
    if (dt <= 0 || this.frozen) return
    if (dt > 0.05) dt = 0.05
    this.update(dt)
    this.draw()
    this.watchPerf(dt)
  }

  private focusLevel(): number {
    const p = useApp.getState().panel
    if (!p || p === 'menu' || p === 'concierge') return -1
    if (p === 'project') return 1
    return levels.findIndex((l) => l.panel === p)
  }

  private update(dt: number) {
    const st = useApp.getState()
    this.t += dt
    this.introT = Math.min(1, this.introT + (dt / 3.6) * this.introSpeed)
    if (this.introT > 0.86 && !this.markedReady) {
      this.markedReady = true
      st.setReady()
    }

    const reduced = st.reducedMotion
    const dragging = this.ptrs.size > 0
    const focus = this.focusLevel()
    const desk = this.W >= 900
    const panelOpen = !!st.panel

    // idle drift + inertia
    const auto = reduced ? 0 : focus >= 0 ? 0.012 : 0.034
    if (!dragging) {
      this.yaw += (auto + this.yawVel) * dt
      this.yawVel *= Math.exp(-dt * 2.4)
    } else this.yawVel *= Math.exp(-dt * 8)

    // scene viewport shifts away from an open panel
    let cxT = this.W / 2
    let cyT = this.H * (desk ? 0.5 : 0.49)
    if (panelOpen && desk) cxT = (this.W - (Math.min(540, this.W * 0.46) + 32)) / 2
    if (panelOpen && !desk) cyT = (this.H * 0.4) / 2 + 24

    const introE = ease(this.introT)
    const aspect = this.W / this.H
    const narrow = aspect < 0.75
    const baseDist = narrow ? 3150 : aspect < 1.1 ? 2750 : 2350
    const tYT = focus >= 0 ? (levels[focus].y0 + levels[focus].y1) / 2 : 700
    const distT = (focus >= 0 ? (narrow ? 2250 : desk ? 1750 : 1900) : baseDist) * this.userZoom + (1 - introE) * 1300
    const pitchT = (focus >= 0 ? -0.1 : -0.19) + this.userPitch + (1 - introE) * 0.16 - this.parSy * 0.02

    const k = 1 - Math.exp(-dt * (this.introT < 1 ? 6 : 3.2))
    this.tY = lerp(this.tY, tYT, 1 - Math.exp(-dt * 2.6))
    this.dist = lerp(this.dist, distT, k)
    this.pitch = lerp(this.pitch, pitchT, k)
    this.cx = lerp(this.cx, cxT, 1 - Math.exp(-dt * 3))
    this.cy = lerp(this.cy, cyT, 1 - Math.exp(-dt * 3))
    const pk = 1 - Math.exp(-dt * 2)
    this.parSx = lerp(this.parSx, reduced ? 0 : this.parX, pk)
    this.parSy = lerp(this.parSy, reduced ? 0 : this.parY, pk)

    if (this.mouse.on && !dragging) this.updateHover(this.mouse.x, this.mouse.y)

    if (this.introT >= 1 && !st.ready) st.setReady()
  }

  private watchPerf(dt: number) {
    this.warm += dt
    if (this.warm < 3 || this.perfLevel >= 2) return
    if (dt > 1 / 34) this.slow++
    else this.slow = Math.max(0, this.slow - 2)
    if (this.slow > 60) {
      this.perfLevel++
      this.slow = 0
      this.warm = 1.5
      this.resize()
    }
  }

  /* ── drawing ── */

  private camera(): Cam {
    const F = this.H * 1.2
    return makeCam(0, this.tY, 0, this.dist, this.yaw + this.parSx * 0.07, this.pitch, F, this.cx, this.cy)
  }

  private draw() {
    const ctx = this.ctx
    const cam = this.camera()
    const st = useApp.getState()
    const focus = this.focusLevel()
    const active = st.hover !== null ? st.hover : focus
    const intro = this.introT

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.drawSky(ctx, cam)
    this.drawDisc(ctx, cam, intro)
    this.drawReflection(ctx, cam, active, intro)
    this.drawTower(ctx, cam, false, active, intro)
    this.drawLabels(ctx, cam, active, focus, st.ready, st.panel !== null)

    // fade in from black
    const fade = 1 - clamp(intro * 2.4, 0, 1)
    if (fade > 0.001) {
      ctx.fillStyle = `rgba(2,3,8,${fade})`
      ctx.fillRect(0, 0, this.W, this.H)
    }
  }

  private sky(cam: Cam, az: number, el: number): { x: number; y: number; ok: boolean } {
    const fwdAz = Math.atan2(cam.fx, cam.fz) // compass azimuth of the view direction, matching (sin az, cos az)
    const fwdEl = Math.atan2(cam.fy, Math.hypot(cam.fx, cam.fz))
    const dA = wrapAngle(az - fwdAz)
    const dE = el - fwdEl
    if (Math.abs(dA) > 1.45) return { x: 0, y: 0, ok: false }
    return { x: cam.cx - Math.tan(dA) * cam.F, y: cam.cy - Math.tan(dE) * cam.F, ok: true }
  }

  private drawSky(ctx: Ctx, cam: Cam) {
    const { W, H } = this
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#02030a')
    g.addColorStop(0.62, '#060916')
    g.addColorStop(1, '#0a0d1f')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    const yawPx = this.yaw * cam.F
    const pitchPx = this.pitch * cam.F * 0.6

    // nebula wash
    const ns = Math.max(W, H) * 2.2
    const nx = ((-yawPx * 0.06) % ns) - ns * 0.3
    ctx.globalAlpha = 0.85
    ctx.drawImage(nebula, nx, -ns * 0.35 + pitchPx * 0.05, ns, ns)
    ctx.drawImage(nebula, nx + ns, -ns * 0.35 + pitchPx * 0.05, ns, ns)
    ctx.globalAlpha = 1

    // milky way band
    ctx.save()
    ctx.translate(W * 0.5, H * 0.3 + pitchPx * 0.2)
    ctx.rotate(-0.42)
    const mw = Math.max(W, H) * 2.4
    const mox = (((-yawPx * 0.12) % mw) + mw) % mw
    ctx.globalAlpha = 0.85
    for (let i = -1; i <= 1; i++) ctx.drawImage(milky, -mw + mox + i * mw, -mw * 0.107, mw, mw * 0.214)
    ctx.restore()
    ctx.globalAlpha = 1

    // star layers
    for (let i = 0; i < stars.length; i++) {
      const L = stars[i]
      const ox = (((-yawPx * L.p) % 512) + 512) % 512
      const oy = (((pitchPx * L.p * -1) % 512) + 512) % 512
      ctx.globalAlpha = 0.7 + Math.sin(this.t * (0.5 + i * 0.3) + i) * 0.2
      for (let x = ox - 512; x < W; x += 512) for (let y = oy - 512; y < H; y += 512) ctx.drawImage(L.tile, x, y)
    }
    ctx.globalAlpha = 1

    this.drawPlanet(ctx, cam)
    this.drawSun(ctx, cam)
  }

  private drawPlanet(ctx: Ctx, cam: Cam) {
    const pos = this.sky(cam, PLANET.az, PLANET.el)
    if (!pos.ok) return
    const r = this.H * 0.3
    const { x, y } = pos
    if (x < -r * 1.6 || x > this.W + r * 1.6) return

    // direction toward the sun in screen space (drives the crescent)
    const sp = this.sky(cam, SUN.az, SUN.el)
    let sx = 0.75
    let sy = -0.35
    if (sp.ok) {
      const dx = sp.x - x
      const dy = sp.y - y
      const l = Math.hypot(dx, dy) || 1
      sx = dx / l
      sy = dy / l
    } else {
      const dA = wrapAngle(SUN.az - PLANET.az)
      sx = dA < 0 ? 0.8 : -0.8
      sy = -0.3
    }

    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.5
    ctx.drawImage(glow('#4f7dff'), x - r * 1.55, y - r * 1.55, r * 3.1, r * 3.1)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, r, 0, TAU)
    ctx.clip()
    const body = ctx.createRadialGradient(x + sx * r * 0.55, y + sy * r * 0.55, r * 0.05, x + sx * r * 0.12, y + sy * r * 0.12, r * 1.2)
    body.addColorStop(0, '#c4dcff')
    body.addColorStop(0.28, '#6f9be6')
    body.addColorStop(0.58, '#2c4a94')
    body.addColorStop(0.84, '#101d4b')
    body.addColorStop(1, '#070d24')
    ctx.fillStyle = body
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
    // cloud bands
    ctx.translate(x, y)
    ctx.rotate(-0.22)
    for (let i = 0; i < 13; i++) {
      const by = -r + (i + 0.5) * ((r * 2) / 13) + Math.sin(this.t * 0.05 + i * 1.7) * 3
      ctx.fillStyle = i % 2 ? `rgba(210,230,255,${0.05 + (i % 3) * 0.02})` : `rgba(4,10,40,${0.10 + (i % 3) * 0.04})`
      ctx.fillRect(-r, by, r * 2, 6 + (i % 4) * 7)
    }
    ctx.rotate(0.22)
    ctx.translate(-x, -y)
    // terminator: night side swallows the far edge
    const night = ctx.createRadialGradient(x + sx * r * 0.85, y + sy * r * 0.85, r * 0.6, x - sx * r * 0.5, y - sy * r * 0.5, r * 1.45)
    night.addColorStop(0, 'rgba(0,0,8,0)')
    night.addColorStop(1, 'rgba(0,0,8,0.62)')
    ctx.fillStyle = night
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
    ctx.restore()

    // atmospheric rim on the lit limb
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, r, 0, TAU)
    ctx.clip()
    const rim = ctx.createRadialGradient(x - sx * r * 0.06, y - sy * r * 0.06, r * 0.9, x, y, r * 1.02)
    rim.addColorStop(0, 'rgba(120,170,255,0)')
    rim.addColorStop(1, 'rgba(150,195,255,0.55)')
    ctx.fillStyle = rim
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
    ctx.restore()

    // moon
    const ma = this.t * 0.02 + 1.1
    const mr = r * 0.07
    const mx = x + Math.cos(ma) * r * 1.35
    const my = y - r * 0.5 + Math.sin(ma) * r * 0.12
    const mg = ctx.createRadialGradient(mx + sx * mr * 0.5, my + sy * mr * 0.5, mr * 0.1, mx, my, mr * 1.1)
    mg.addColorStop(0, '#d9dfef')
    mg.addColorStop(0.6, '#6b7390')
    mg.addColorStop(1, '#0b0e1c')
    ctx.fillStyle = mg
    ctx.beginPath()
    ctx.arc(mx, my, mr, 0, TAU)
    ctx.fill()
  }

  private drawSun(ctx: Ctx, cam: Cam) {
    const s = this.sky(cam, SUN.az, SUN.el)
    if (!s.ok) return
    const { x, y } = s
    if (x < -600 || x > this.W + 600 || y < -600 || y > this.H + 600) return
    const vis = clamp(1 - Math.hypot(x - this.W / 2, y - this.H / 2) / (this.W * 1.1), 0.25, 1)
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.35 * vis
    ctx.drawImage(glow('#ffb46a'), x - 520, y - 520, 1040, 1040)
    ctx.globalAlpha = 0.9 * vis
    ctx.drawImage(glow('#ffe1b8'), x - 120, y - 120, 240, 240)
    ctx.globalAlpha = vis
    ctx.drawImage(glow('#ffffff'), x - 26, y - 26, 52, 52)
    // anamorphic streak
    const sg = ctx.createLinearGradient(x - 620, 0, x + 620, 0)
    sg.addColorStop(0, 'rgba(255,190,120,0)')
    sg.addColorStop(0.5, `rgba(255,225,190,${0.55 * vis})`)
    sg.addColorStop(1, 'rgba(255,190,120,0)')
    ctx.fillStyle = sg
    ctx.fillRect(x - 620, y - 1.5, 1240, 3)
    // ghosts toward screen centre
    const gx = this.W / 2 - x
    const gy = this.H / 2 - y
    const ghosts: [number, number, string][] = [
      [0.4, 34, '#ffd9a0'],
      [0.75, 18, '#9fc0ff'],
      [1.25, 46, '#ffb888'],
      [1.7, 22, '#a8c8ff'],
    ]
    ctx.globalAlpha = 0.16 * vis
    for (const [f, r, c] of ghosts) ctx.drawImage(glow(c), x + gx * f - r, y + gy * f - r, r * 2, r * 2)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  /* ── platform ── */

  private ring(ctx: Ctx, cam: Cam, r: number, y: number, n = 96) {
    let first = true
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * TAU
      if (!project(cam, Math.cos(a) * r, y, Math.sin(a) * r)) continue
      if (first) ctx.moveTo(P.x, P.y)
      else ctx.lineTo(P.x, P.y)
      first = false
    }
  }

  private drawDisc(ctx: Ctx, cam: Cam, intro: number) {
    const N = 96
    const top: [number, number][] = []
    const bot: [number, number][] = []
    for (let i = 0; i < N; i++) {
      const a = (i / N) * TAU
      const c = Math.cos(a) * DISC_R
      const s = Math.sin(a) * DISC_R
      if (!project(cam, c, 0, s)) return
      top.push([P.x, P.y])
      project(cam, c * 0.94, -DISC_DEPTH, s * 0.94)
      bot.push([P.x, P.y])
    }
    // reflection clip path + underglow
    this.discTop = new Path2D()
    top.forEach(([x, y], i) => (i ? this.discTop.lineTo(x, y) : this.discTop.moveTo(x, y)))
    this.discTop.closePath()

    project(cam, 0, -80, 0)
    const ux = P.x
    const uy = P.y
    project(cam, DISC_R * 1.3, -80, 0)
    const ur = Math.abs(P.x - ux) + 60
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.16 * intro
    ctx.drawImage(glow('#4a6cff'), ux - ur, uy - ur * 0.5, ur * 2, ur)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    // underside
    ctx.beginPath()
    bot.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.closePath()
    ctx.fillStyle = '#05070f'
    ctx.fill()
    // skirt segments that face the camera
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N
      const a = ((i + 0.5) / N) * TAU
      const facing = Math.cos(a) * (cam.x) + Math.sin(a) * cam.z
      if (facing <= 0) continue
      ctx.beginPath()
      ctx.moveTo(top[i][0], top[i][1])
      ctx.lineTo(top[j][0], top[j][1])
      ctx.lineTo(bot[j][0], bot[j][1])
      ctx.lineTo(bot[i][0], bot[i][1])
      ctx.closePath()
      const lit = clamp(Math.cos(a) * LS.x + Math.sin(a) * LS.z, 0, 1)
      ctx.fillStyle = `rgb(${14 + lit * 44},${19 + lit * 34},${34 + lit * 22})`
      ctx.fill()
    }
    // top
    ctx.fillStyle = '#070a17'
    ctx.fill(this.discTop)

    // surface detail
    ctx.save()
    ctx.clip(this.discTop)
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(120,150,230,0.10)'
    ctx.beginPath()
    for (const r of [0.3, 0.52, 0.76]) this.ring(ctx, cam, DISC_R * r, 0)
    ctx.stroke()
    ctx.setLineDash([3, 9])
    ctx.strokeStyle = 'rgba(160,190,255,0.16)'
    ctx.beginPath()
    this.ring(ctx, cam, DISC_R * 0.9, 0)
    ctx.stroke()
    ctx.setLineDash([])
    // radial markings
    ctx.strokeStyle = 'rgba(160,190,255,0.10)'
    ctx.beginPath()
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU + 0.1
      if (!project(cam, Math.cos(a) * DISC_R * 0.36, 0, Math.sin(a) * DISC_R * 0.36)) continue
      ctx.moveTo(P.x, P.y)
      if (!project(cam, Math.cos(a) * DISC_R * 0.5, 0, Math.sin(a) * DISC_R * 0.5)) continue
      ctx.lineTo(P.x, P.y)
    }
    ctx.stroke()
    // pool of light around the base
    project(cam, 0, 0, 0)
    const bx = P.x
    const by = P.y
    project(cam, 640, 0, 0)
    const rr = Math.hypot(P.x - bx, P.y - by)
    project(cam, 0, 0, 640)
    const rr2 = Math.hypot(P.x - bx, P.y - by)
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.5 * intro
    ctx.drawImage(glow('#7f9fe8'), bx - Math.max(rr, rr2), by - Math.min(rr, rr2) * 0.9, Math.max(rr, rr2) * 2, Math.min(rr, rr2) * 1.8)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()

    // rim
    ctx.lineJoin = 'round'
    ctx.lineWidth = 8
    ctx.strokeStyle = 'rgba(120,160,255,0.07)'
    ctx.stroke(this.discTop)
    ctx.lineWidth = 1.6
    ctx.strokeStyle = 'rgba(190,210,255,0.6)'
    ctx.stroke(this.discTop)

    // chasing rim lights
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * TAU
      if (!project(cam, Math.cos(a) * DISC_R * 0.985, 0, Math.sin(a) * DISC_R * 0.985)) continue
      const chase = 0.5 + 0.5 * Math.sin(this.t * 1.1 - i * 0.35)
      const al = (0.25 + chase * 0.6) * intro
      ctx.globalAlpha = al
      const s = 5 + chase * 5
      ctx.drawImage(glow('#cfe0ff'), P.x - s, P.y - s, s * 2, s * 2)
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  private drawReflection(ctx: Ctx, cam: Cam, active: number, intro: number) {
    ctx.save()
    ctx.clip(this.discTop)
    this.drawTower(ctx, cam, true, active, intro)
    // fade the reflection away from the base
    project(cam, 0, 0, 0)
    const y0 = P.y
    project(cam, 0, -900, 0)
    const y1 = Math.max(P.y, y0 + 40)
    const fg = ctx.createLinearGradient(0, y0, 0, y1)
    fg.addColorStop(0, 'rgba(7,10,23,0.05)')
    fg.addColorStop(1, 'rgba(7,10,23,1)')
    ctx.fillStyle = fg
    ctx.fillRect(0, y0 - 2, this.W, this.H)
    ctx.restore()
  }

  /* ── the tower ── */

  private drawTower(ctx: Ctx, cam: Cam, mirror: boolean, active: number, intro: number) {
    const sg = mirror ? -1 : 1
    const camY = mirror ? -cam.y : cam.y
    const ignite = smooth((intro - 0.12) / 0.7) * (TOWER_TOP + 200)
    const a = mirror ? 0.3 : 1

    // draw order between stacked tiers depends on whether the camera is above/below each junction
    const order: number[] = [0]
    for (let k = 1; k < TIERS.length; k++) {
      if (camY >= TIERS[k - 1].y1) order.push(k)
      else order.unshift(k)
    }
    for (const ti of order) this.drawTier(ctx, cam, ti, sg, camY, mirror, active, ignite, a)
    if (!mirror && ignite > TOWER_TOP) this.beacon(ctx, cam)
  }

  private drawTier(ctx: Ctx, cam: Cam, ti: number, sg: number, camY: number, mirror: boolean, active: number, ignite: number, alpha: number) {
    const T = TIERS[ti]
    // visible faces, far → near
    const vis: { f: number; d: number }[] = []
    for (let f = 0; f < 4; f++) {
      const { nx, nz } = FACES[f]
      const off = nz !== 0 ? T.hd : T.hw
      const cxw = nx * off
      const czw = nz * off
      if ((cam.x - cxw) * nx + (cam.z - czw) * nz <= 0) continue
      const dx = cxw - cam.x
      const dz = czw - cam.z
      vis.push({ f, d: dx * dx + dz * dz })
    }
    vis.sort((p, q) => q.d - p.d)
    for (const v of vis) this.drawFace(ctx, cam, ti, v.f, sg, mirror, active, ignite, alpha)

    // roof, when we can see it
    if (!mirror && camY > T.y1) {
      const pts: [number, number, number][] = [
        [-T.hw, T.y1, -T.hd],
        [T.hw, T.y1, -T.hd],
        [T.hw, T.y1, T.hd],
        [-T.hw, T.y1, T.hd],
      ]
      ctx.beginPath()
      let ok = true
      pts.forEach(([x, y, z], i) => {
        if (!project(cam, x, y, z)) ok = false
        if (i) ctx.lineTo(P.x, P.y)
        else ctx.moveTo(P.x, P.y)
      })
      if (ok) {
        ctx.closePath()
        ctx.fillStyle = '#141a33'
        ctx.fill()
        ctx.strokeStyle = 'rgba(190,210,255,0.35)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  }

  private drawFace(ctx: Ctx, cam: Cam, ti: number, f: number, sg: number, mirror: boolean, active: number, ignite: number, alpha: number) {
    const T = TIERS[ti]
    const { nx, nz } = FACES[f]
    const W = nz !== 0 ? 2 * T.hw : 2 * T.hd
    const off = nz !== 0 ? T.hd : T.hw
    const ux = nz
    const uz = -nx
    const ox = nx * off - (ux * W) / 2
    const oz = nz * off - (uz * W) / 2
    const pt = (u: number, y: number): boolean => project(cam, ox + ux * u, sg * y, oz + uz * u)

    // corners
    if (!pt(0, T.y0)) return
    const bx0 = P.x
    const by0 = P.y
    if (!pt(W, T.y0)) return
    const bx1 = P.x
    const by1 = P.y
    if (!pt(W, T.y1)) return
    const tx1 = P.x
    const ty1 = P.y
    if (!pt(0, T.y1)) return
    const tx0 = P.x
    const ty0 = P.y

    // lighting
    const sun = Math.max(0, nx * LS.x + nz * LS.z)
    const pl = Math.max(0, nx * LP.x + nz * LP.z)
    const sunK = Math.pow(sun, 1.2)
    const r = 12 + sunK * 150 + pl * 34
    const g = 17 + sunK * 108 + pl * 62
    const b = 34 + sunK * 62 + pl * 118
    const gx = (bx0 + bx1) / 2
    const gyb = (by0 + by1) / 2
    const gyt = (ty0 + ty1) / 2
    const grad = ctx.createLinearGradient(gx, gyb, gx, gyt)
    grad.addColorStop(0, `rgba(${(r * 0.55) | 0},${(g * 0.58) | 0},${(b * 0.62) | 0},${alpha})`)
    grad.addColorStop(1, `rgba(${Math.min(255, r * 1.3 + 8) | 0},${Math.min(255, g * 1.3 + 12) | 0},${Math.min(255, b * 1.3 + 22) | 0},${alpha})`)
    ctx.beginPath()
    ctx.moveTo(bx0, by0)
    ctx.lineTo(bx1, by1)
    ctx.lineTo(tx1, ty1)
    ctx.lineTo(tx0, ty0)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    if (!T.windows) {
      // spire: just an edge glint
      ctx.strokeStyle = rgba('#cfe0ff', 0.6 * alpha)
      ctx.lineWidth = 1
      ctx.stroke()
      return
    }

    // mullions + floor lines
    const rows = Math.floor((T.y1 - T.y0) / T.fh)
    const cw = W / T.cols
    ctx.beginPath()
    for (let c = 1; c < T.cols; c++) {
      if (!pt(c * cw, T.y0)) continue
      ctx.moveTo(P.x, P.y)
      if (!pt(c * cw, T.y1)) continue
      ctx.lineTo(P.x, P.y)
    }
    ctx.lineWidth = 0.8
    ctx.strokeStyle = `rgba(150,180,255,${0.07 * alpha})`
    ctx.stroke()

    // windows, bucketed by colour so each colour is a single fill
    const buckets = [new Path2D(), new Path2D(), new Path2D(), new Path2D()]
    const flick = Math.floor(this.t * 0.35)
    const inShaft = ti === 1
    for (let rIdx = 0; rIdx < rows; rIdx++) {
      const yA = T.y0 + (rIdx + 0.3) * T.fh
      const yB = T.y0 + (rIdx + 0.7) * T.fh
      const yM = (yA + yB) / 2
      if (yM > ignite) continue
      const lv = levelAtY(yM)
      // whole floors are lit or dark, like a real tower; the occupied levels are always lit
      const rl = hash(ti * 1009 + rIdx * 31 + 7)
      const rowOn = lv >= 0 ? 1 : rl < 0.24 ? 0.85 : rl < 0.4 ? 0.25 : 0.03
      for (let c = 0; c < T.cols; c++) {
        const uA = (c + 0.2) * cw
        const uB = (c + 0.8) * cw
        if (inShaft && yM > BLADE_Y0 && yM < BLADE_Y1 && Math.abs((uA + uB) / 2 - W / 2) < 40) continue
        const seed = ti * 7919 + f * 1543 + rIdx * 97 + c * 13
        const h = hash(seed + 1)
        let lit = h < rowOn * 0.92
        if (hash(seed * 31 + flick * 2654435) < 0.012) lit = !lit
        if (!lit) continue
        const h2 = hash(seed + 5)
        const bucket = lv >= 0 && lv === active ? 3 : h2 < 0.14 ? 1 : h2 < 0.58 ? 0 : 2
        const path = buckets[bucket]
        if (!pt(uA, yA)) continue
        path.moveTo(P.x, P.y)
        if (!pt(uB, yA)) continue
        path.lineTo(P.x, P.y)
        if (!pt(uB, yB)) continue
        path.lineTo(P.x, P.y)
        if (!pt(uA, yB)) continue
        path.lineTo(P.x, P.y)
        path.closePath()
      }
    }
    const wa = mirror ? 0.55 : 1
    ctx.fillStyle = `rgba(255,234,205,${0.8 * wa * alpha})`
    ctx.fill(buckets[0])
    ctx.fillStyle = `rgba(255,208,155,${0.42 * wa * alpha})`
    ctx.fill(buckets[1])
    ctx.fillStyle = `rgba(190,215,255,${0.68 * wa * alpha})`
    ctx.fill(buckets[2])
    ctx.fillStyle = `rgba(255,205,128,${0.98 * wa * alpha})`
    ctx.fill(buckets[3])

    // level bands: a fine luminous line at each floor plate, and a soft glow
    for (let i = 0; i < levels.length; i++) {
      const lv = levels[i]
      if (lv.y0 < T.y0 || lv.y1 > T.y1 || lv.y1 > ignite) continue
      const on = i === active
      ctx.beginPath()
      let ok = true
      for (const yy of [lv.y0, lv.y1]) {
        if (!pt(0, yy)) ok = false
        ctx.moveTo(P.x, P.y)
        if (!pt(W, yy)) ok = false
        ctx.lineTo(P.x, P.y)
      }
      if (!ok) continue
      ctx.lineWidth = on ? 1.8 : 1
      ctx.strokeStyle = on ? `rgba(255,205,128,${0.95 * alpha})` : `rgba(190,215,255,${0.38 * alpha})`
      ctx.stroke()
      if (!mirror && (on || sun < 0.5)) {
        pt(W / 2, (lv.y0 + lv.y1) / 2)
        const mx = P.x
        const my = P.y
        pt(W / 2, lv.y0)
        const yb = P.y
        pt(W / 2, lv.y1)
        const hpx = Math.abs(P.y - yb)
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = on ? 0.42 : 0.07
        const gr = Math.max(hpx * 1.4, 30)
        ctx.drawImage(glow(on ? '#ffc880' : '#8fb2ff'), mx - gr * 1.6, my - gr, gr * 3.2, gr * 2)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
      }
    }

    // vertical edges catch the light
    ctx.beginPath()
    ctx.moveTo(bx0, by0)
    ctx.lineTo(tx0, ty0)
    ctx.moveTo(bx1, by1)
    ctx.lineTo(tx1, ty1)
    ctx.lineWidth = 1.2
    ctx.strokeStyle = `rgba(${170 + sunK * 85},${190 + sunK * 45},${235 - sunK * 40},${(0.22 + sunK * 0.5) * alpha})`
    ctx.stroke()

    // tier top edge
    ctx.beginPath()
    ctx.moveTo(tx0, ty0)
    ctx.lineTo(tx1, ty1)
    ctx.lineWidth = 1.4
    ctx.strokeStyle = `rgba(210,225,255,${0.5 * alpha})`
    ctx.stroke()

    if (!mirror && inShaft) this.drawBlade(ctx, cam, pt, W, ignite, active)
  }

  /** The vertical name sign, set into the shaft on every face. */
  private drawBlade(ctx: Ctx, cam: Cam, pt: (u: number, y: number) => boolean, W: number, ignite: number, active: number) {
    if (ignite < BLADE_Y1) return
    const uc = W / 2
    // panel
    ctx.beginPath()
    let ok = true
    const corners: [number, number][] = [
      [uc - 36, BLADE_Y0],
      [uc + 36, BLADE_Y0],
      [uc + 36, BLADE_Y1],
      [uc - 36, BLADE_Y1],
    ]
    corners.forEach(([u, y], i) => {
      if (!pt(u, y)) ok = false
      if (i) ctx.lineTo(P.x, P.y)
      else ctx.moveTo(P.x, P.y)
    })
    if (!ok) return
    ctx.closePath()
    ctx.fillStyle = 'rgba(3,5,12,0.9)'
    ctx.fill()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(210,225,255,0.4)'
    ctx.stroke()

    // affine basis for the text: down the tower, and toward the face's left
    pt(uc, BLADE_Y1 - 30)
    const x0 = P.x
    const y0 = P.y
    pt(uc, BLADE_Y1 - 130)
    const ex = (P.x - x0) / 100
    const ey = (P.y - y0) / 100
    pt(uc - 100, BLADE_Y1 - 30)
    const lx = (P.x - x0) / 100
    const ly = (P.y - y0) / 100
    // face-on-ness: how flat we're looking at it (text fades at grazing angles)
    const flat = Math.abs(ex * ly - ey * lx) / (Math.hypot(ex, ey) * Math.hypot(lx, ly) + 1e-6)
    if (flat < 0.12) return

    if (this.signDirty) {
      ctx.font = `600 40px ${FONT}`
      this.signW1 = ctx.measureText(portfolio.name).width
      ctx.font = `300 40px ${FONT}`
      this.signW2 = ctx.measureText(portfolio.domain).width
      this.signDirty = false
    }
    const total = this.signW1 + this.signW2
    const startY = 0 + (BLADE_Y1 - BLADE_Y0 - 60 - total) / 2

    ctx.save()
    ctx.transform(ex, ey, lx, ly, x0, y0)
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    const amber = active >= 0
    ctx.shadowColor = amber ? 'rgba(255,196,120,0.9)' : 'rgba(190,215,255,0.9)'
    ctx.shadowBlur = 14
    ctx.globalAlpha = clamp((flat - 0.12) * 3, 0, 1)
    ctx.font = `600 40px ${FONT}`
    ctx.fillStyle = '#f4f7ff'
    ctx.fillText(portfolio.name, startY, 0)
    ctx.font = `300 40px ${FONT}`
    ctx.fillStyle = amber ? '#ffdca8' : '#c6d8ff'
    ctx.fillText(portfolio.domain, startY + this.signW1, 0)
    ctx.restore()
  }

  private beacon(ctx: Ctx, cam: Cam) {
    if (!project(cam, 0, TOWER_TOP, 0)) return
    const on = Math.sin(this.t * 2.4) > 0.2
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = on ? 0.95 : 0.25
    const r = 26
    ctx.drawImage(glow('#ff7a6a'), P.x - r, P.y - r, r * 2, r * 2)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  /* ── labels ── */

  private drawLabels(ctx: Ctx, cam: Cam, active: number, focus: number, ready: boolean, panelOpen: boolean) {
    this.hits = []
    const a0 = clamp((this.introT - 0.8) / 0.2, 0, 1)
    const compact = this.W < 520
    const fs = compact ? 11 : 12
    const gap = compact ? 10 : 16
    const lineIdle = compact ? 14 : 26
    const lineOn = compact ? 22 : 44
    const offIdle = compact ? 20 : 34
    const offOn = compact ? 30 : 52
    for (let i = 0; i < levels.length; i++) {
      const lv = levels[i]
      const yM = (lv.y0 + lv.y1) / 2
      const T = TIERS.find((t) => yM >= t.y0 && yM <= t.y1)!
      // silhouette extents at mid height
      let minX = Infinity
      let maxX = -Infinity
      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ]) {
        if (!project(cam, sx * T.hw, yM, sz * T.hd)) continue
        minX = Math.min(minX, P.x)
        maxX = Math.max(maxX, P.x)
      }
      if (!isFinite(minX)) continue
      project(cam, 0, lv.y0, 0)
      const bottom = P.y
      project(cam, 0, lv.y1, 0)
      const top = P.y
      project(cam, 0, yM, 0)
      const my = P.y

      const text = compact ? lv.label : `${lv.no}  ${lv.label}`
      ctx.font = `500 ${fs}px ${FONT}`
      setSpacing(ctx, compact ? 2 : 2.4)
      const tw = ctx.measureText(text).width
      setSpacing(ctx, 0)

      // pick the side with room; if neither fits, the label is skipped (the level is still tappable)
      const rightFits = maxX + gap + offOn + tw + 8 < this.W
      const leftFits = minX - gap - offOn - tw - 8 > 0
      const rightSide = rightFits || !leftFits
      const dir = rightSide ? 1 : -1
      const ex = (rightSide ? maxX : minX) + dir * gap
      const lx0 = rightSide ? ex + offIdle : ex - offIdle - tw
      this.hits.push({ i, left: minX, right: maxX, top, bottom, lx0: lx0 - 6, ly0: my - 12, lx1: lx0 + tw + 6, ly1: my + 12 })

      if (!rightFits && !leftFits) continue
      // hidden while a panel is open, apart from the level in focus
      if (panelOpen && i !== focus) continue
      if (!ready && a0 <= 0) continue
      const on = i === active
      ctx.globalAlpha = a0 * (on ? 1 : panelOpen ? 0.6 : 0.8)
      ctx.strokeStyle = on ? '#ffcf8a' : 'rgba(210,225,255,0.55)'
      ctx.lineWidth = on ? 1.5 : 1
      ctx.beginPath()
      ctx.moveTo(ex, my)
      ctx.lineTo(ex + dir * (on ? lineOn : lineIdle), my)
      ctx.stroke()
      ctx.fillStyle = on ? '#ffcf8a' : 'rgba(210,225,255,0.8)'
      ctx.beginPath()
      ctx.arc(ex, my, on ? 3 : 2.2, 0, TAU)
      ctx.fill()
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'left'
      setSpacing(ctx, compact ? 2 : 2.4)
      ctx.font = `500 ${fs}px ${FONT}`
      const off = on ? offOn : offIdle
      const tx = rightSide ? ex + off : ex - off - tw
      ctx.fillStyle = on ? '#ffe2b8' : 'rgba(228,236,255,0.88)'
      ctx.fillText(text, tx, my + 0.5)
      setSpacing(ctx, 0)
      ctx.globalAlpha = 1
    }
  }
}

function setSpacing(ctx: Ctx, px: number) {
  const c = ctx as unknown as { letterSpacing?: string }
  if ('letterSpacing' in c) c.letterSpacing = `${px}px`
}
