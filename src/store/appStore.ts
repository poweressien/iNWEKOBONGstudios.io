import { create } from 'zustand'

export type PanelName = 'studio' | 'work' | 'project' | 'stack' | 'labs' | 'signal' | 'concierge' | null

interface Tour {
  active: boolean
  step: number
  paused: boolean
}

interface State {
  /** Intro sequence finished — HUD and labels may appear. */
  ready: boolean
  panel: PanelName
  projectId: string | null
  hover: number | null
  sound: boolean
  reducedMotion: boolean

  tour: Tour
  palette: boolean
  /** Slow automatic orbit while idle. */
  orbit: boolean
  /** 0 = dawn … 0.5 = the default golden light … 1 = dusk. */
  sunT: number
  sunAuto: boolean
  notice: string | null

  setReady: () => void
  open: (p: Exclude<PanelName, null>, projectId?: string) => void
  close: () => void
  setHover: (i: number | null) => void
  setSound: (v: boolean) => void

  startTour: () => void
  tourGo: (step: number) => void
  tourPause: (v: boolean) => void
  endTour: () => void
  setPalette: (v: boolean) => void
  setOrbit: (v: boolean) => void
  setSunT: (t: number) => void
  setSunAuto: (v: boolean) => void
  notify: (msg: string) => void
}

const prefersReduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
let noticeTimer: ReturnType<typeof setTimeout> | null = null
const idle: Tour = { active: false, step: 0, paused: false }

export const useApp = create<State>((set) => ({
  ready: false,
  panel: null,
  projectId: null,
  hover: null,
  sound: false,
  reducedMotion: prefersReduced,

  tour: idle,
  palette: false,
  orbit: true,
  sunT: 0.5,
  sunAuto: false,
  notice: null,

  setReady: () => set({ ready: true }),
  open: (panel, projectId) => set({ panel, projectId: projectId ?? null, tour: idle, palette: false }),
  close: () => set({ panel: null, projectId: null }),
  setHover: (hover) => set((s) => (s.hover === hover ? s : { hover })),
  setSound: (sound) => set({ sound }),

  startTour: () => set({ tour: { active: true, step: 0, paused: false }, panel: null, projectId: null, palette: false }),
  tourGo: (step) => set((s) => ({ tour: { ...s.tour, step, paused: s.tour.paused } })),
  tourPause: (paused) => set((s) => ({ tour: { ...s.tour, paused } })),
  endTour: () => set({ tour: idle }),
  setPalette: (palette) => set((s) => ({ palette, tour: palette ? idle : s.tour })),
  setOrbit: (orbit) => set({ orbit }),
  setSunT: (sunT) => set({ sunT, sunAuto: false }),
  setSunAuto: (sunAuto) => set({ sunAuto }),
  notify: (msg) => {
    set({ notice: msg })
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => set({ notice: null }), 2400)
  },
}))
