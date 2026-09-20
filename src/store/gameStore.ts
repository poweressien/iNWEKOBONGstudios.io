import { create } from 'zustand'
import { loadSave, writeSave, clearSave, defaultSave, type SaveData } from '@/game/save'
import { sfx } from '@/game/audio'
import { XP, TROPHIES, levelInfo, TOTAL_ORBS } from '@/game/progress'
import { projects } from '@/data/projects'

export type Phase = 'boot' | 'title' | 'playing'
export type PanelName = 'about' | 'projects' | 'project' | 'contact' | 'github' | 'chat' | 'map' | 'menu' | null

export interface Toast {
  id: number
  kind: 'info' | 'xp' | 'trophy' | 'level'
  text: string
  sub?: string
}

interface State {
  phase: Phase
  ready: boolean
  touch: boolean
  moved: boolean
  warping: boolean

  panel: PanelName
  projectId: string | null
  focus: { id: string; prompt: string } | null
  toasts: Toast[]

  xp: number
  orbs: string[]
  visited: string[]
  seenProjects: string[]
  trophies: string[]
  counters: Record<string, number>
  sound: boolean
  quality: SaveData['quality']
  reducedMotion: boolean

  setReady: () => void
  setTouch: (v: boolean) => void
  setMoved: () => void
  setWarping: (v: boolean) => void
  setFocus: (f: State['focus']) => void
  start: () => void
  openPanel: (p: Exclude<PanelName, null>, projectId?: string) => void
  closePanel: () => void
  toast: (t: Omit<Toast, 'id'>) => void
  addXp: (n: number, why?: string) => void
  collectOrb: (id: string, skill: string) => void
  visit: (landmark: string) => void
  viewProject: (id: string) => void
  bump: (counter: string, by?: number) => void
  setSound: (on: boolean) => void
  setQuality: (q: SaveData['quality']) => void
  setReducedMotion: (v: boolean) => void
  resetProgress: () => void
}

const saved = loadSave()
let toastId = 1

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false

function persist(s: State) {
  writeSave({
    xp: s.xp,
    orbs: s.orbs,
    visited: s.visited,
    seenProjects: s.seenProjects,
    trophies: s.trophies,
    counters: s.counters,
    sound: s.sound,
    quality: s.quality,
    reducedMotion: s.reducedMotion,
  })
}

export const useGame = create<State>((set, get) => {
  const pushToast = (t: Omit<Toast, 'id'>, ms = 3400) => {
    const id = toastId++
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), ms)
  }

  /** Award any trophies whose condition is now met. */
  const checkTrophies = () => {
    const s = get()
    for (const t of TROPHIES) {
      if (s.trophies.includes(t.id)) continue
      if (t.value(s) >= t.target) {
        set((st) => ({ trophies: [...st.trophies, t.id] }))
        sfx.trophy()
        pushToast({ kind: 'trophy', text: t.name, sub: t.desc }, 4200)
      }
    }
    persist(get())
  }

  const gainXp = (n: number) => {
    const before = levelInfo(get().xp)
    set((s) => ({ xp: s.xp + n }))
    const after = levelInfo(get().xp)
    if (after.level > before.level) {
      sfx.levelUp()
      pushToast({ kind: 'level', text: `Level ${after.level} — ${after.title}`, sub: 'Keep exploring' }, 3800)
    }
  }

  return {
    phase: 'boot',
    ready: false,
    touch: false,
    moved: false,
    warping: false,

    panel: null,
    projectId: null,
    focus: null,
    toasts: [],

    xp: saved.xp,
    orbs: saved.orbs,
    visited: saved.visited,
    seenProjects: saved.seenProjects,
    trophies: saved.trophies,
    counters: saved.counters,
    sound: saved.sound,
    quality: saved.quality,
    reducedMotion: saved.reducedMotion || prefersReduced,

    setReady: () => set({ ready: true, phase: 'title' }),
    setTouch: (touch) => set({ touch }),
    setMoved: () => set({ moved: true }),
    setWarping: (warping) => set({ warping }),
    setFocus: (focus) => set({ focus }),
    start: () => {
      set({ phase: 'playing' })
    },

    openPanel: (panel, projectId) => {
      sfx.open()
      set({ panel, projectId: projectId ?? null })
    },
    closePanel: () => {
      if (get().panel) sfx.close()
      set({ panel: null, projectId: null })
    },

    toast: (t) => pushToast(t),

    addXp: (n) => {
      gainXp(n)
      checkTrophies()
    },

    collectOrb: (id, skill) => {
      if (get().orbs.includes(id)) return
      const n = get().orbs.length
      set((s) => ({ orbs: [...s.orbs, id] }))
      sfx.pickup(n)
      pushToast({ kind: 'xp', text: skill, sub: `Skill orb ${n + 1}/${TOTAL_ORBS}  ·  +${XP.orb} XP` }, 2400)
      gainXp(XP.orb)
      checkTrophies()
    },

    visit: (landmark) => {
      if (get().visited.includes(landmark)) return
      set((s) => ({ visited: [...s.visited, landmark] }))
      pushToast({ kind: 'xp', text: 'New landmark discovered', sub: `+${XP.landmark} XP` }, 2600)
      gainXp(XP.landmark)
      checkTrophies()
    },

    viewProject: (id) => {
      if (get().seenProjects.includes(id) || !projects.some((p) => p.id === id)) return
      set((s) => ({ seenProjects: [...s.seenProjects, id] }))
      gainXp(XP.project)
      checkTrophies()
    },

    bump: (counter, by = 1) => {
      const first = !(get().counters[counter] > 0)
      set((s) => ({ counters: { ...s.counters, [counter]: (s.counters[counter] ?? 0) + by } }))
      if (first) {
        if (counter === 'chat') gainXp(XP.chat)
        if (counter === 'honk') gainXp(XP.honk)
        if (counter.startsWith('pad-')) gainXp(XP.pad)
      }
      checkTrophies()
    },

    setSound: (sound) => {
      sfx.setEnabled(sound)
      set({ sound })
      persist(get())
    },
    setQuality: (quality) => {
      set({ quality })
      persist(get())
    },
    setReducedMotion: (reducedMotion) => {
      set({ reducedMotion })
      persist(get())
    },
    resetProgress: () => {
      clearSave()
      const d = defaultSave()
      set({
        xp: d.xp,
        orbs: d.orbs,
        visited: d.visited,
        seenProjects: d.seenProjects,
        trophies: d.trophies,
        counters: d.counters,
      })
      persist(get())
    },
  }
})
