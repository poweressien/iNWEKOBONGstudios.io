import { projects } from '@/data/projects'
import { portfolio } from '@/data/portfolio'
import type { ProjectData } from '@/types'

/* ────────────────────────────────────────────────────────────────────────
 * WORLD LAYOUT (world units ≈ CSS pixels at zoom 1, +Y is "down" the screen)
 *
 *                    ┌───────── PROJECT ARCADE ─────────┐
 *                    │  cabinets… + the INWEKOBONG tower │
 *                    └────────────────┬─────────────────┘
 *                                     │ north bridge
 *   GITHUB planet ── west bridge ──  HUB  ── east bridge ── ABOUT planet
 *                                     │ south bridge
 *                                  COMMS station
 *
 * Everything is compact on purpose: nothing is more than ~10 seconds away,
 * and the fast-travel map can hop between the five districts instantly.
 * ──────────────────────────────────────────────────────────────────────── */

export type LandmarkKey = 'about' | 'github' | 'projects' | 'contact'

export interface CircleShape {
  t: 'circle'
  x: number
  y: number
  r: number
  accent: string
  island: boolean
}
export interface RectShape {
  t: 'rect'
  x: number
  y: number
  w: number
  h: number
  radius: number
  accent: string
  island: boolean
  /** Direction lights flow along a bridge, away from the hub. */
  flow?: 'n' | 'e' | 'w' | 's'
}
export type Shape = CircleShape | RectShape

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}
export interface Circle {
  x: number
  y: number
  r: number
}

export type PanelTarget = 'about' | 'projects' | 'contact' | 'github' | 'chat'

export type Action =
  | { type: 'panel'; panel: PanelTarget }
  | { type: 'project'; id: string }
  | { type: 'soon' }
  | { type: 'pad'; index: number }
  | { type: 'external'; url: string }
  | { type: 'danfo' }

export interface Interactable {
  id: string
  prompt: string
  x: number
  y: number
  r: number
  action: Action
  landmark?: LandmarkKey
}

export type Prop =
  | { kind: 'tower'; x: number; y: number; id: string }
  | { kind: 'cabinet'; x: number; y: number; index: number; project?: ProjectData; id: string }
  | { kind: 'planet'; x: number; y: number; color: string; ring: boolean; seed: number; id: string; glyph: string }
  | { kind: 'pc'; x: number; y: number; id: string }
  | { kind: 'dish'; x: number; y: number; id: string }
  | { kind: 'pad'; x: number; y: number; index: number; color: string; id: string }
  | { kind: 'danfo'; x: number; y: number; id: string }
  | { kind: 'lamp'; x: number; y: number; color: string }
  | { kind: 'crystal'; x: number; y: number; s: number; color: string }
  | { kind: 'beacon'; x: number; y: number }
  | { kind: 'obi'; x: number; y: number; id: string }
  | { kind: 'crate'; x: number; y: number; w: number; h: number }

export interface Orb {
  id: string
  skill: string
  x: number
  y: number
  color: string
}

export interface Destination {
  id: string
  label: string
  x: number
  y: number
  color: string
  landmark?: LandmarkKey
}

export interface WorldLabel {
  text: string
  sub?: string
  x: number
  y: number
  color: string
  landmark?: LandmarkKey
}

const ACCENT = {
  hub: '#5aa9ff',
  about: '#9b7bff',
  github: '#5aa9ff',
  projects: '#ffb15e',
  contact: '#2ee6a6',
}

/* ── platforms ─────────────────────────────────────────────────────────── */

const HUB: CircleShape = { t: 'circle', x: 0, y: 0, r: 340, accent: ACCENT.hub, island: true }

const SLOTS = projects.length + 1 // +1 = the "coming soon" cabinet
const PER_ROW = 10
const ROWS = Math.ceil(SLOTS / PER_ROW)
const CAB_SPACING = 130
const PLAZA_BOTTOM = -700 + (ROWS - 1) * 170
const CAB_BASE_Y = -870
const TOWER_FRONT_Y = -1080

export const SPAWN = { x: 0, y: 150 }

const ABOUT_ISLAND: CircleShape = { t: 'circle', x: 900, y: 0, r: 250, accent: ACCENT.about, island: true }
const GITHUB_ISLAND: CircleShape = { t: 'circle', x: -900, y: 0, r: 250, accent: ACCENT.github, island: true }
const COMMS_ISLAND: CircleShape = { t: 'circle', x: 0, y: 850, r: 250, accent: ACCENT.contact, island: true }

export const shapes: Shape[] = [
  HUB,
  { t: 'rect', x: -70, y: PLAZA_BOTTOM - 20, w: 140, h: -300 - (PLAZA_BOTTOM - 20), radius: 0, accent: ACCENT.projects, island: false, flow: 'n' },
  { t: 'rect', x: -690, y: -1260, w: 1380, h: PLAZA_BOTTOM + 1260, radius: 64, accent: ACCENT.projects, island: true },
  { t: 'rect', x: 300, y: -70, w: 420, h: 140, radius: 0, accent: ACCENT.about, island: false, flow: 'e' },
  ABOUT_ISLAND,
  { t: 'rect', x: -720, y: -70, w: 420, h: 140, radius: 0, accent: ACCENT.github, island: false, flow: 'w' },
  GITHUB_ISLAND,
  { t: 'rect', x: -70, y: 300, w: 140, h: 340, radius: 0, accent: ACCENT.contact, island: false, flow: 's' },
  COMMS_ISLAND,
]

export const WORLD_BOUNDS = { minX: -1200, maxX: 1200, minY: -1290, maxY: 1120 }

/* ── walkability & collision ──────────────────────────────────────────── */

function inShape(s: Shape, x: number, y: number, m: number): boolean {
  if (s.t === 'circle') {
    const rr = s.r - m
    const dx = x - s.x
    const dy = y - s.y
    return rr > 0 && dx * dx + dy * dy <= rr * rr
  }
  const x0 = s.x + m
  const x1 = s.x + s.w - m
  const y0 = s.y + m
  const y1 = s.y + s.h - m
  if (x < x0 || x > x1 || y < y0 || y > y1) return false
  const rad = Math.max(0, s.radius - m)
  if (rad <= 0) return true
  const cx = x < x0 + rad ? x0 + rad : x > x1 - rad ? x1 - rad : x
  const cy = y < y0 + rad ? y0 + rad : y > y1 - rad ? y1 - rad : y
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= rad * rad
}

export function walkable(x: number, y: number, margin: number): boolean {
  for (let i = 0; i < shapes.length; i++) if (inShape(shapes[i], x, y, margin)) return true
  return false
}

export const rectObstacles: Rect[] = []
export const circleObstacles: Circle[] = []

export function blocked(x: number, y: number, r: number): boolean {
  for (let i = 0; i < circleObstacles.length; i++) {
    const c = circleObstacles[i]
    const dx = x - c.x
    const dy = y - c.y
    const rr = c.r + r
    if (dx * dx + dy * dy < rr * rr) return true
  }
  for (let i = 0; i < rectObstacles.length; i++) {
    const b = rectObstacles[i]
    const cx = Math.max(b.x, Math.min(x, b.x + b.w))
    const cy = Math.max(b.y, Math.min(y, b.y + b.h))
    const dx = x - cx
    const dy = y - cy
    if (dx * dx + dy * dy < r * r) return true
  }
  return false
}

/* ── props, interactables, orbs, destinations ─────────────────────────── */

export const props: Prop[] = []
export const interactables: Interactable[] = []
export const orbs: Orb[] = []
export const labels: WorldLabel[] = []

function rectAt(x: number, y: number, w: number, h: number) {
  rectObstacles.push({ x, y, w, h })
}

// Central beacon
props.push({ kind: 'beacon', x: 0, y: 0 })
circleObstacles.push({ x: 0, y: 6, r: 30 })

// OBI — the resident AI, just off the spawn point
const OBI_POS = { x: -185, y: -95 }
props.push({ kind: 'obi', x: OBI_POS.x, y: OBI_POS.y, id: 'obi' })
circleObstacles.push({ x: OBI_POS.x, y: OBI_POS.y + 8, r: 16 })
interactables.push({
  id: 'obi',
  prompt: `Talk to ${portfolio.ai.name}`,
  x: OBI_POS.x,
  y: OBI_POS.y,
  r: 105,
  action: { type: 'panel', panel: 'chat' },
})

// Danfo-style minibus (easter egg)
const BUS = { x: 110, y: -180, w: 150, h: 70 }
props.push({ kind: 'danfo', x: BUS.x + BUS.w / 2, y: BUS.y + BUS.h, id: 'danfo' })
rectAt(BUS.x, BUS.y + 8, BUS.w, BUS.h - 8)
interactables.push({
  id: 'danfo',
  prompt: 'Honk the horn',
  x: BUS.x + BUS.w / 2,
  y: BUS.y + BUS.h + 6,
  r: 95,
  action: { type: 'danfo' },
})

// Button pads (SW rim of the hub)
portfolio.pads.forEach((pad, i) => {
  const ang = ((110 + i * 15) * Math.PI) / 180
  const x = Math.cos(ang) * 272
  const y = Math.sin(ang) * 272
  props.push({ kind: 'pad', x, y, index: i, color: pad.color, id: `pad-${i}` })
  interactables.push({
    id: `pad-${i}`,
    prompt: pad.label,
    x,
    y,
    r: 40,
    action: { type: 'pad', index: i },
  })
})

// Hub lamps + crystals around the rim (skipping the four bridge mouths)
for (let k = 0; k < 8; k++) {
  const ang = ((22.5 + k * 45) * Math.PI) / 180
  props.push({ kind: 'lamp', x: Math.cos(ang) * 318, y: Math.sin(ang) * 318, color: ACCENT.hub })
}
;[
  [-300, -150, 1],
  [305, 130, 1.15],
  [270, -215, 0.8],
  [-140, 300, 0.9],
].forEach(([x, y, s]) => props.push({ kind: 'crystal', x, y, s, color: '#5aa9ff' }))

// ── Project arcade ──────────────────────────────────────────────────────
const cabinetSlots: { x: number; y: number }[] = []
for (let row = 0; row < ROWS; row++) {
  const n = Math.min(PER_ROW, SLOTS - row * PER_ROW)
  for (let i = 0; i < n; i++) {
    cabinetSlots.push({ x: (i - (n - 1) / 2) * CAB_SPACING, y: CAB_BASE_Y + row * 170 })
  }
}
cabinetSlots.forEach((slot, i) => {
  const project = projects[i]
  const id = project ? `cab-${project.id}` : 'cab-soon'
  props.push({ kind: 'cabinet', x: slot.x, y: slot.y, index: i, project, id })
  rectAt(slot.x - 38, slot.y - 44, 76, 44)
  interactables.push({
    id,
    prompt: project ? project.title : 'Next project…',
    x: slot.x,
    y: slot.y - 20,
    r: 72,
    action: project ? { type: 'project', id: project.id } : { type: 'soon' },
    landmark: project ? 'projects' : undefined,
  })
})

// Tower at the back of the arcade
props.push({ kind: 'tower', x: 0, y: TOWER_FRONT_Y, id: 'tower' })
rectAt(-190, TOWER_FRONT_Y - 100, 380, 100)
interactables.push({
  id: 'tower',
  prompt: 'Enter the Project Tower',
  x: 0,
  y: TOWER_FRONT_Y + 30,
  r: 100,
  action: { type: 'panel', panel: 'projects' },
  landmark: 'projects',
})

// Arcade lamps & crystals
for (let x = -600; x <= 600; x += 150) {
  props.push({ kind: 'lamp', x, y: PLAZA_BOTTOM - 26, color: ACCENT.projects })
}
;[
  [-640, -1210, 1.2],
  [640, -1210, 1.2],
  [-640, -740, 0.9],
  [640, -740, 0.9],
].forEach(([x, y, s]) => props.push({ kind: 'crystal', x, y, s, color: '#ffb15e' }))

// ── About planet (east) ─────────────────────────────────────────────────
props.push({ kind: 'planet', x: 900, y: 14, color: portfolio.planetHome.color, ring: true, seed: 3, id: 'about', glyph: 'iN' })
circleObstacles.push({ x: 900, y: 14, r: 48 })
interactables.push({
  id: 'about',
  prompt: 'About iNWEKOBONG',
  x: 900,
  y: 14,
  r: 135,
  action: { type: 'panel', panel: 'about' },
  landmark: 'about',
})
;[
  [1090, 130, 1],
  [800, -190, 0.9],
  [1040, -150, 1.1],
].forEach(([x, y, s]) => props.push({ kind: 'crystal', x, y, s, color: '#9b7bff' }))
for (const a of [60, 110, 250, 300]) {
  const ang = (a * Math.PI) / 180
  props.push({ kind: 'lamp', x: 900 + Math.cos(ang) * 228, y: Math.sin(ang) * 228, color: ACCENT.about })
}

// ── GitHub planet + floating PC (west) ──────────────────────────────────
props.push({ kind: 'planet', x: -900, y: 14, color: portfolio.planetGithub.color, ring: false, seed: 7, id: 'github', glyph: '</>' })
circleObstacles.push({ x: -900, y: 14, r: 48 })
interactables.push({
  id: 'github',
  prompt: 'Open GitHub profile',
  x: -900,
  y: 14,
  r: 135,
  action: { type: 'panel', panel: 'github' },
  landmark: 'github',
})
props.push({ kind: 'pc', x: -790, y: 170, id: 'pc' })
circleObstacles.push({ x: -790, y: 170, r: 22 })
interactables.push({
  id: 'pc',
  prompt: 'Boot the terminal',
  x: -790,
  y: 170,
  r: 85,
  action: { type: 'external', url: portfolio.externalSiteUrl },
})
;[
  [-1090, 120, 1],
  [-1000, -180, 1.1],
  [-800, -190, 0.85],
].forEach(([x, y, s]) => props.push({ kind: 'crystal', x, y, s, color: '#5aa9ff' }))
for (const a of [108, 138, 245, 300]) {
  const ang = (a * Math.PI) / 180
  props.push({ kind: 'lamp', x: -900 + Math.cos(ang) * 228, y: Math.sin(ang) * 228, color: ACCENT.github })
}

// ── Comms station (south) ───────────────────────────────────────────────
props.push({ kind: 'dish', x: 0, y: 858, id: 'dish' })
rectAt(-48, 822, 96, 36)
interactables.push({
  id: 'dish',
  prompt: 'Open comms channel',
  x: 0,
  y: 850,
  r: 125,
  action: { type: 'panel', panel: 'contact' },
  landmark: 'contact',
})
;[
  [-170, 930, 1],
  [180, 940, 1.1],
  [120, 720, 0.8],
].forEach(([x, y, s]) => props.push({ kind: 'crystal', x, y, s, color: '#2ee6a6' }))
for (const a of [30, 75, 105, 150]) {
  const ang = (a * Math.PI) / 180
  props.push({ kind: 'lamp', x: Math.cos(ang) * 228, y: 850 + Math.sin(ang) * 228, color: ACCENT.contact })
}
props.push({ kind: 'crate', x: -130, y: 800, w: 34, h: 24 })
rectAt(-147, 788, 34, 24)
props.push({ kind: 'crate', x: 140, y: 800, w: 30, h: 22 })
rectAt(125, 789, 30, 22)

// ── Bridge lamps ────────────────────────────────────────────────────────
for (let y = -300 + 60; y > PLAZA_BOTTOM; y -= 120) {
  props.push({ kind: 'lamp', x: -60, y, color: ACCENT.projects })
  props.push({ kind: 'lamp', x: 60, y, color: ACCENT.projects })
}
for (let x = 380; x < 690; x += 120) {
  props.push({ kind: 'lamp', x, y: -60, color: ACCENT.about })
  props.push({ kind: 'lamp', x, y: 60, color: ACCENT.about })
  props.push({ kind: 'lamp', x: -x, y: -60, color: ACCENT.github })
  props.push({ kind: 'lamp', x: -x, y: 60, color: ACCENT.github })
}
for (let y = 380; y < 620; y += 120) {
  props.push({ kind: 'lamp', x: -60, y, color: ACCENT.contact })
  props.push({ kind: 'lamp', x: 60, y, color: ACCENT.contact })
}

/* ── skill orbs ───────────────────────────────────────────────────────── */

const ORB_SPOTS: [number, number][] = [
  [175, 150], // Python — hub, SE
  [-45, -205], // Django — hub, N
  [0, -450], // React — north bridge
  [0, -610], // TypeScript — north bridge
  [-545, -790], // JavaScript — arcade left
  [545, -790], // Flutter — arcade right
  [0, -770], // React Native — arcade centre
  [480, 0], // Node — east bridge
  [610, 0], // Three/Babylon — east bridge
  [770, 150], // Postgres — about island
  [1050, 130], // Kotlin — about island
  [-500, 0], // Paystack — west bridge
  [-1020, -120], // Docker — github island
  [0, 480], // Git — south bridge
]
portfolio.skills.forEach((skill, i) => {
  const spot = ORB_SPOTS[i % ORB_SPOTS.length]
  orbs.push({ id: `orb-${i}`, skill: skill.name, x: spot[0], y: spot[1], color: skill.color })
})

/* ── destinations (fast-travel + minimap + compass) ───────────────────── */

export const destinations: Destination[] = [
  { id: 'hub', label: 'Hub', x: SPAWN.x, y: SPAWN.y, color: ACCENT.hub },
  { id: 'projects', label: 'Project Arcade', x: 0, y: CAB_BASE_Y + 60, color: ACCENT.projects, landmark: 'projects' },
  { id: 'about', label: 'About Planet', x: 770, y: 60, color: ACCENT.about, landmark: 'about' },
  { id: 'github', label: 'GitHub Planet', x: -770, y: 60, color: ACCENT.github, landmark: 'github' },
  { id: 'contact', label: 'Comms Station', x: 0, y: 740, color: ACCENT.contact, landmark: 'contact' },
]

/** Compass / minimap targets for each landmark (world position of the landmark itself). */
export const landmarkPos: Record<LandmarkKey, { x: number; y: number; label: string; color: string }> = {
  about: { x: 900, y: 14, label: 'About', color: ACCENT.about },
  github: { x: -900, y: 14, label: 'GitHub', color: ACCENT.github },
  projects: { x: 0, y: TOWER_FRONT_Y + 30, label: 'Projects', color: ACCENT.projects },
  contact: { x: 0, y: 850, label: 'Contact', color: ACCENT.contact },
}

/** Big always-visible signposts above each landmark. */
labels.push(
  { text: 'ABOUT ME', sub: portfolio.planetHome.tagline, x: 900, y: -222, color: ACCENT.about, landmark: 'about' },
  { text: 'GITHUB', sub: portfolio.planetGithub.tagline, x: -900, y: -222, color: ACCENT.github, landmark: 'github' },
  { text: 'PROJECTS', sub: 'Enter the tower', x: 0, y: TOWER_FRONT_Y - 108, color: ACCENT.projects, landmark: 'projects' },
  { text: 'CONTACT', sub: 'Open a channel', x: 0, y: 566, color: ACCENT.contact, landmark: 'contact' },
)

export const ARCADE = { plazaBottom: PLAZA_BOTTOM, cabBaseY: CAB_BASE_Y, towerFrontY: TOWER_FRONT_Y }
