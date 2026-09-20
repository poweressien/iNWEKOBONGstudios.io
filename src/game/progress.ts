import { projects } from '@/data/projects'
import { portfolio } from '@/data/portfolio'

export const XP = {
  orb: 15,
  landmark: 40,
  project: 10,
  chat: 20,
  pad: 5,
  honk: 10,
}

export const LEVELS = [
  { at: 0, title: 'Rookie' },
  { at: 60, title: 'Explorer' },
  { at: 140, title: 'Builder' },
  { at: 240, title: 'Architect' },
  { at: 360, title: 'Founder' },
  { at: 450, title: 'Legend' },
]

export interface LevelInfo {
  level: number
  title: string
  into: number
  span: number
  pct: number
  max: boolean
}

export function levelInfo(xp: number): LevelInfo {
  let idx = 0
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].at) idx = i
  const cur = LEVELS[idx]
  const next = LEVELS[idx + 1]
  if (!next) return { level: idx + 1, title: cur.title, into: 1, span: 1, pct: 1, max: true }
  const into = xp - cur.at
  const span = next.at - cur.at
  return { level: idx + 1, title: cur.title, into, span, pct: Math.min(1, into / span), max: false }
}

export interface ProgressSnapshot {
  xp: number
  orbs: string[]
  visited: string[]
  seenProjects: string[]
  counters: Record<string, number>
}

export interface TrophyDef {
  id: string
  name: string
  desc: string
  target: number
  value: (s: ProgressSnapshot) => number
}

const TOTAL_ORBS = portfolio.skills.length

export const TROPHIES: TrophyDef[] = [
  { id: 'explorer', name: 'Universe Explorer', desc: 'Visit every landmark', target: 4, value: (s) => s.visited.length },
  { id: 'orbs7', name: 'Orb Hunter', desc: 'Collect 7 skill orbs', target: 7, value: (s) => s.orbs.length },
  { id: 'orbsAll', name: 'Full Stack', desc: 'Collect every skill orb', target: TOTAL_ORBS, value: (s) => s.orbs.length },
  { id: 'arcade5', name: 'Arcade Regular', desc: 'Inspect 5 arcade cabinets', target: 5, value: (s) => s.seenProjects.length },
  { id: 'arcadeAll', name: 'Player One', desc: 'Inspect every project', target: projects.length, value: (s) => s.seenProjects.length },
  { id: 'obi', name: 'Hello, OBI', desc: 'Chat with the tower AI', target: 1, value: (s) => s.counters.chat ?? 0 },
  { id: 'red', name: 'You Pressed It', desc: 'Press the button you were told not to', target: 1, value: (s) => s.counters['pad-0'] ?? 0 },
  { id: 'honk', name: 'Conductor', desc: 'Honk the minibus', target: 1, value: (s) => s.counters.honk ?? 0 },
  { id: 'dash', name: 'Gotta Go Fast', desc: 'Dash 15 times', target: 15, value: (s) => s.counters.dash ?? 0 },
  { id: 'legend', name: 'Legend', desc: `Reach level ${LEVELS.length}`, target: LEVELS[LEVELS.length - 1].at, value: (s) => s.xp },
]

export const TOTAL_LANDMARKS = 4
export { TOTAL_ORBS }
