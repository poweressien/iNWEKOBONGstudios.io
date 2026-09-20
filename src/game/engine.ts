import { input, moveVector, clearInput } from './input'
import { render, type Player, type Particle, type Floater, type RenderState } from './render'
import { walkable, blocked, circleObstacles, interactables, orbs, props, SPAWN, type Interactable, type Action } from './world'
import { useGame } from '@/store/gameStore'
import { sfx } from './audio'
import { portfolio } from '@/data/portfolio'
import { XP } from './progress'

const RADIUS = 13
const MAX_SPEED = 250
const DASH_SPEED = 640
const DASH_TIME = 0.16
const DASH_COST = 34
const STAMINA_REGEN = 30
const MAX_PARTICLES = 260

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

export class Game {
  private ctx: CanvasRenderingContext2D
  private raf = 0
  private last = 0
  private t = 0
  private W = 0
  private H = 0
  private dpr = 1
  private zoom = 1
  private camX = SPAWN.x
  private camY = SPAWN.y - 40
  private shake = 0
  private hq = true
  private perfLevel = 0
  private slowFrames = 0
  private warm = 0
  private dustTimer = 0
  private stepSfx = 0
  private frozen = false

  private player: Player = { x: SPAWN.x, y: SPAWN.y, vx: 0, vy: 0, fx: 0, fy: -1, dash: 0, stamina: 100, step: 0, trail: [] }
  private dashDir = { x: 0, y: -1 }
  private particles: Particle[] = []
  private floaters: Floater[] = []
  private padPress = [99, 99, 99, 99]
  private focus: Interactable | null = null

  private collected = new Set<string>()
  private visited = new Set<string>()
  private seenProjects = new Set<string>()
  private orbsRef: string[] = []
  private visitedRef: string[] = []
  private seenRef: string[] = []

  private bubble: string | null = null
  private bubbleIdx = 0
  private bubbleTimer = 0
  private obiPos = props.find((p) => p.kind === 'obi') ?? { x: 0, y: 0 }
  private unsub: () => void

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('Canvas 2D is not available')
    this.ctx = ctx
    this.applyQuality(useGame.getState().quality)
    this.resize()

    window.addEventListener('resize', this.resize)
    window.addEventListener('orientationchange', this.resize)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('blur', clearInput)
    canvas.addEventListener('pointerdown', this.onPointerDown)
    document.addEventListener('visibilitychange', this.onVisibility)

    this.unsub = useGame.subscribe((s, prev) => {
      if (s.quality !== prev.quality) this.applyQuality(s.quality)
      if (s.panel && !prev.panel) clearInput()
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
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('blur', clearInput)
    this.canvas.removeEventListener('pointerdown', this.onPointerDown)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.unsub()
  }

  /* ── test hooks (used by the automated visual checks; harmless in production) ── */

  freeze(v = true) {
    this.frozen = v
    this.last = performance.now()
  }

  /** Advance the simulation by `sec` seconds at 60 Hz and draw one frame. */
  advance(sec: number) {
    const n = Math.max(1, Math.round(sec * 60))
    for (let i = 0; i < n; i++) {
      this.t += 1 / 60
      const st = useGame.getState()
      this.syncStore(st)
      this.update(1 / 60, st, st.phase === 'playing' && !st.panel && !st.warping)
    }
    this.draw(useGame.getState())
  }

  setPos(x: number, y: number) {
    const p = this.player
    p.x = x
    p.y = y
    p.vx = p.vy = 0
    this.camX = x
    this.camY = y - 40
  }

  /* ── public controls (used by touch buttons / map panel) ── */

  playerPos() {
    return { x: this.player.x, y: this.player.y }
  }

  interact() {
    input.interactQueued = true
  }
  dash() {
    input.dashQueued = true
  }

  teleport(x: number, y: number) {
    const st = useGame.getState()
    if (st.warping) return
    st.setWarping(true)
    st.closePanel()
    sfx.warp()
    setTimeout(() => {
      const p = this.player
      p.x = x
      p.y = y
      p.vx = p.vy = 0
      p.trail.length = 0
      this.camX = x
      this.camY = y - 40
      this.burst(x, y - 12, '#7fd0ff', 26, 'spark')
      this.ring(x, y, '#7fd0ff')
      input.target = null
    }, 380)
    setTimeout(() => useGame.getState().setWarping(false), 780)
  }

  /* ── events ── */

  private onVisibility = () => {
    this.last = performance.now()
    if (document.hidden) clearInput()
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const el = e.target as HTMLElement | null
    const tag = el?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    const st = useGame.getState()

    if (e.code === 'Escape') {
      if (st.panel) st.closePanel()
      else if (st.phase === 'playing') st.openPanel('menu')
      return
    }
    if (st.phase !== 'playing') return
    if (e.code === 'KeyM' && !e.repeat) {
      if (st.panel === 'map') st.closePanel()
      else if (!st.panel) st.openPanel('map')
      return
    }
    if (st.panel) return

    switch (e.code) {
      case 'KeyW':
      case 'KeyA':
      case 'KeyS':
      case 'KeyD':
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        input.keys.add(e.code)
        input.target = null
        e.preventDefault()
        break
      case 'KeyE':
        if (!e.repeat) input.interactQueued = true
        break
      case 'Enter':
        if (tag !== 'BUTTON' && !e.repeat) input.interactQueued = true
        break
      case 'ShiftLeft':
      case 'ShiftRight':
        if (!e.repeat) input.dashQueued = true
        break
      case 'Space':
        if (tag !== 'BUTTON') {
          if (!e.repeat) input.dashQueued = true
          e.preventDefault()
        }
        break
    }
  }

  private onKeyUp = (e: KeyboardEvent) => {
    input.keys.delete(e.code)
  }

  private onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const st = useGame.getState()
    if (st.phase !== 'playing' || st.panel) return
    const rect = this.canvas.getBoundingClientRect()
    const wx = this.camX + (e.clientX - rect.left - this.W / 2) / this.zoom
    const wy = this.camY + (e.clientY - rect.top - this.H / 2) / this.zoom
    // clicking on the thing you're standing next to activates it
    if (this.focus && Math.hypot(wx - this.focus.x, wy - this.focus.y) < 90) {
      input.interactQueued = true
      return
    }
    input.target = { x: wx, y: wy }
  }

  private resize = () => {
    const parent = this.canvas.parentElement
    this.W = Math.max(1, parent ? parent.clientWidth : window.innerWidth)
    this.H = Math.max(1, parent ? parent.clientHeight : window.innerHeight)
    const cap = this.perfLevel === 0 ? (useGame.getState().touch ? 1.75 : 2) : this.perfLevel === 1 ? 1.25 : 1
    this.dpr = Math.min(window.devicePixelRatio || 1, cap)
    this.canvas.width = Math.round(this.W * this.dpr)
    this.canvas.height = Math.round(this.H * this.dpr)
    this.canvas.style.width = `${this.W}px`
    this.canvas.style.height = `${this.H}px`
    this.zoom = clamp(Math.min(this.W, this.H * 1.15) / 600, 0.75, 1.5)
  }

  private applyQuality(q: 'auto' | 'high' | 'low') {
    this.perfLevel = q === 'low' ? 2 : 0
    this.hq = q !== 'low'
    this.slowFrames = 0
    this.resize()
  }

  /* ── loop ── */

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame)
    let dt = (now - this.last) / 1000
    this.last = now
    if (dt <= 0 || this.frozen) return
    if (dt > 0.05) dt = 0.05
    this.t += dt

    const st = useGame.getState()
    this.syncStore(st)
    const playing = st.phase === 'playing' && !st.panel && !st.warping
    this.update(dt, st, playing)
    this.draw(st)
    this.watchPerf(dt, st.quality)
  }

  private syncStore(st: ReturnType<typeof useGame.getState>) {
    if (st.orbs !== this.orbsRef) {
      this.orbsRef = st.orbs
      this.collected = new Set(st.orbs)
    }
    if (st.visited !== this.visitedRef) {
      this.visitedRef = st.visited
      this.visited = new Set(st.visited)
    }
    if (st.seenProjects !== this.seenRef) {
      this.seenRef = st.seenProjects
      this.seenProjects = new Set(st.seenProjects)
    }
  }

  private ok(x: number, y: number) {
    return walkable(x, y, RADIUS) && !blocked(x, y, RADIUS)
  }

  /** When pushing into a round obstacle, glide around it instead of sticking to it. */
  private tangentSlide(dx: number, dy: number): { x: number; y: number } | null {
    const p = this.player
    const m = Math.hypot(dx, dy)
    if (m === 0) return null
    for (const c of circleObstacles) {
      const ex = p.x + dx - c.x
      const ey = p.y + dy - c.y
      const rr = c.r + RADIUS
      if (ex * ex + ey * ey >= rr * rr) continue
      let nx = p.x - c.x
      let ny = p.y - c.y
      const nl = Math.hypot(nx, ny) || 1
      nx /= nl
      ny /= nl
      let tx = -ny
      let ty = nx
      const dot = tx * dx + ty * dy
      if (Math.abs(dot) < m * 0.12) {
        // dead-on: always go round the right-hand side so it feels consistent
        if (tx < 0) (tx = -tx), (ty = -ty)
      } else if (dot < 0) {
        tx = -tx
        ty = -ty
      }
      return { x: tx * m, y: ty * m }
    }
    return null
  }

  private step(dx: number, dy: number) {
    const p = this.player
    if (this.ok(p.x + dx, p.y + dy)) {
      p.x += dx
      p.y += dy
      return
    }
    const t = this.tangentSlide(dx, dy)
    if (t && this.ok(p.x + t.x, p.y + t.y)) {
      p.x += t.x
      p.y += t.y
      return
    }
    if (dx !== 0 && this.ok(p.x + dx, p.y)) {
      p.x += dx
      p.vy *= 0.4
    } else if (dy !== 0 && this.ok(p.x, p.y + dy)) {
      p.y += dy
      p.vx *= 0.4
    } else {
      p.vx *= 0.3
      p.vy *= 0.3
    }
  }

  private update(dt: number, st: ReturnType<typeof useGame.getState>, playing: boolean) {
    const p = this.player
    let mx = 0
    let my = 0

    if (playing) {
      const v = moveVector()
      mx = v.x
      my = v.y
      if (mx === 0 && my === 0 && input.target) {
        const dx = input.target.x - p.x
        const dy = input.target.y - p.y
        const d = Math.hypot(dx, dy)
        if (d > 12) {
          mx = dx / d
          my = dy / d
        } else input.target = null
      } else if (mx !== 0 || my !== 0) {
        input.target = null
      }
      if (!st.moved && (mx !== 0 || my !== 0)) st.setMoved()
    } else {
      input.target = null
    }

    // dash
    if (input.dashQueued) {
      input.dashQueued = false
      if (playing && p.dash <= 0 && p.stamina >= DASH_COST) {
        const dirLen = Math.hypot(mx, my)
        this.dashDir = dirLen > 0.1 ? { x: mx / dirLen, y: my / dirLen } : { x: p.fx, y: p.fy }
        p.dash = DASH_TIME
        p.stamina -= DASH_COST
        sfx.dash()
        this.burst(p.x, p.y - 10, '#7fd0ff', 10, 'spark')
        st.bump('dash')
      }
    }

    // velocity
    if (p.dash > 0) {
      p.dash -= dt
      p.vx = this.dashDir.x * DASH_SPEED
      p.vy = this.dashDir.y * DASH_SPEED
      p.trail.push({ x: p.x, y: p.y, a: 1 })
    } else {
      const mag = Math.min(1, Math.hypot(mx, my))
      const k = Math.min(1, dt * 11)
      p.vx += (mx * MAX_SPEED * mag - p.vx) * k
      p.vy += (my * MAX_SPEED * mag - p.vy) * k
      p.stamina = Math.min(100, p.stamina + STAMINA_REGEN * dt)
    }
    for (const tr of p.trail) tr.a -= dt * 5
    while (p.trail.length && p.trail[0].a <= 0) p.trail.shift()

    // move in small sub-steps so a dash can't tunnel through a wall
    const dist = Math.hypot(p.vx, p.vy) * dt
    if (dist > 0.01) {
      const n = Math.ceil(dist / 6)
      for (let i = 0; i < n; i++) this.step((p.vx * dt) / n, (p.vy * dt) / n)
    }

    const speed = Math.hypot(p.vx, p.vy)
    if (speed > 30) {
      const fx = p.vx / speed
      const fy = p.vy / speed
      p.fx += (fx - p.fx) * Math.min(1, dt * 14)
      p.fy += (fy - p.fy) * Math.min(1, dt * 14)
      p.step += speed * dt * 0.055
      this.dustTimer -= dt
      if (this.dustTimer <= 0 && playing) {
        this.dustTimer = 0.11
        this.dust(p.x - fx * 6, p.y)
      }
      this.stepSfx -= dt
      if (this.stepSfx <= 0 && playing && p.dash <= 0) {
        this.stepSfx = 0.26
        sfx.step()
      }
    }

    // orbs
    if (playing) {
      for (const o of orbs) {
        if (this.collected.has(o.id)) continue
        if (Math.hypot(o.x - p.x, o.y - 16 - p.y) < 30) {
          this.collected.add(o.id)
          this.burst(o.x, o.y - 24, o.color, 18, 'spark')
          this.ring(o.x, o.y - 6, o.color)
          this.floaters.push({ x: o.x, y: o.y - 50, life: 1.4, text: `+${XP.orb} XP`, color: o.color })
          st.collectOrb(o.id, o.skill)
        }
      }
    }

    // interactions
    let best: Interactable | null = null
    let bestD = Infinity
    if (playing) {
      for (const it of interactables) {
        const d = Math.hypot(it.x - p.x, it.y - p.y)
        if (d < it.r && d < bestD) {
          best = it
          bestD = d
        }
      }
    }
    if ((best?.id ?? null) !== (this.focus?.id ?? null)) {
      this.focus = best
      st.setFocus(best ? { id: best.id, prompt: best.prompt } : null)
    }
    if (input.interactQueued) {
      input.interactQueued = false
      if (playing && this.focus) this.perform(this.focus, st)
    }

    // OBI speech bubble
    const dOb = Math.hypot(this.obiPos.x - p.x, this.obiPos.y - p.y)
    const near = st.phase === 'title' || (playing && dOb < 320)
    if (near) {
      this.bubbleTimer -= dt
      if (this.bubbleTimer <= 0 || !this.bubble) {
        const lines = portfolio.ai.lines
        this.bubble = lines[this.bubbleIdx % lines.length]
        this.bubbleIdx++
        this.bubbleTimer = 5
      }
    } else {
      this.bubble = null
      this.bubbleTimer = 0
    }

    // pads
    for (let i = 0; i < this.padPress.length; i++) this.padPress[i] += dt

    // particles / floaters
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const q = this.particles[i]
      q.life -= dt
      if (q.life <= 0) {
        this.particles.splice(i, 1)
        continue
      }
      q.x += q.vx * dt
      q.y += q.vy * dt
      if (q.kind !== 'ring') {
        q.vx *= 1 - dt * 2.2
        q.vy *= 1 - dt * 2.2
      }
    }
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i]
      f.life -= dt
      f.y -= 34 * dt
      if (f.life <= 0) this.floaters.splice(i, 1)
    }

    // camera
    let tx: number
    let ty: number
    if (st.phase === 'playing') {
      tx = p.x + p.vx * 0.22
      ty = p.y - 30 + p.vy * 0.18
    } else {
      tx = Math.cos(this.t * 0.16) * 130
      ty = -20 + Math.sin(this.t * 0.22) * 70
    }
    const ck = 1 - Math.exp(-dt * (st.phase === 'playing' ? 6 : 1.4))
    this.camX += (tx - this.camX) * ck
    this.camY += (ty - this.camY) * ck
    this.shake = Math.max(0, this.shake - dt * 22)
  }

  private draw(st: ReturnType<typeof useGame.getState>) {
    const shakeOn = !st.reducedMotion && this.shake > 0
    const sx = shakeOn ? (Math.random() - 0.5) * this.shake : 0
    const sy = shakeOn ? (Math.random() - 0.5) * this.shake : 0
    const rs: RenderState = {
      t: this.t,
      W: this.W,
      H: this.H,
      dpr: this.dpr,
      zoom: this.zoom,
      camX: this.camX + sx,
      camY: this.camY + sy,
      player: this.player,
      focusId: this.focus?.id ?? null,
      visited: this.visited,
      collected: this.collected,
      seenProjects: this.seenProjects,
      padPress: this.padPress,
      bubble: this.bubble,
      particles: this.particles,
      floaters: this.floaters,
      hq: this.hq,
      mode: st.phase === 'playing' ? 'playing' : 'title',
      touch: st.touch,
      moved: st.moved,
    }
    render(this.ctx, rs)
  }

  /** Auto-drop resolution/effects on slow devices so the game stays smooth. */
  private watchPerf(dt: number, quality: 'auto' | 'high' | 'low') {
    if (quality !== 'auto') return
    this.warm += dt
    if (this.warm < 2.5 || this.perfLevel >= 2) return
    if (dt > 1 / 36) this.slowFrames++
    else this.slowFrames = Math.max(0, this.slowFrames - 2)
    if (this.slowFrames > 50) {
      this.perfLevel++
      this.slowFrames = 0
      this.warm = 1.5
      if (this.perfLevel >= 2) this.hq = false
      this.resize()
    }
  }

  /* ── actions ── */

  private perform(it: Interactable, st: ReturnType<typeof useGame.getState>) {
    const a: Action = it.action
    switch (a.type) {
      case 'panel':
        if (it.landmark) st.visit(it.landmark)
        st.openPanel(a.panel)
        break
      case 'project':
        st.visit('projects')
        st.viewProject(a.id)
        st.openPanel('project', a.id)
        break
      case 'soon':
        sfx.click()
        st.toast({ kind: 'info', text: 'Next project loading…', sub: 'Something new is always in the oven.' })
        break
      case 'pad': {
        const pad = portfolio.pads[a.index]
        this.padPress[a.index] = 0
        sfx.pad(a.index)
        this.shake = 10
        this.burst(it.x, it.y - 6, pad.color, 22, 'spark')
        this.ring(it.x, it.y, pad.color)
        st.toast({ kind: 'info', text: pad.label, sub: pad.response })
        st.bump(`pad-${a.index}`)
        if (a.index === 2) setTimeout(() => useGame.getState().openPanel('contact'), 1100)
        break
      }
      case 'external': {
        sfx.click()
        st.toast({ kind: 'info', text: 'Booting terminal…', sub: 'Opening in a new tab' })
        const w = window.open(a.url, '_blank', 'noopener,noreferrer')
        if (!w) st.toast({ kind: 'info', text: 'Popup blocked', sub: 'Allow popups for this site to open the terminal.' })
        break
      }
      case 'danfo':
        sfx.honk()
        this.shake = 6
        this.burst(it.x, it.y - 30, '#ffd23a', 16, 'spark')
        this.ring(it.x, it.y - 10, '#ffd23a')
        st.toast({ kind: 'info', text: 'Beep beep!', sub: 'Conductor: "Enter, enter! Next stop — Projects."' })
        st.bump('honk')
        break
    }
  }

  /* ── fx ── */

  private push(q: Particle) {
    if (this.particles.length < MAX_PARTICLES) this.particles.push(q)
  }

  private burst(x: number, y: number, color: string, n: number, kind: 'dot' | 'spark') {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = 60 + Math.random() * 220
      const life = 0.4 + Math.random() * 0.5
      this.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life, max: life, size: 2 + Math.random() * 3, color, kind })
    }
  }

  private ring(x: number, y: number, color: string) {
    this.push({ x, y, vx: 0, vy: 0, life: 0.7, max: 0.7, size: 30, color, kind: 'ring' })
  }

  private dust(x: number, y: number) {
    this.push({ x, y, vx: (Math.random() - 0.5) * 20, vy: -8 - Math.random() * 12, life: 0.4, max: 0.4, size: 2.4, color: '#7fa8ff', kind: 'dot' })
  }
}

let current: Game | null = null
export const setGame = (g: Game | null) => {
  current = g
}
export const getGame = () => current
