import { create } from 'zustand'

export type PanelName = 'studio' | 'work' | 'project' | 'stack' | 'labs' | 'signal' | 'concierge' | 'menu' | null

interface State {
  /** Intro sequence finished — HUD and labels may appear. */
  ready: boolean
  panel: PanelName
  projectId: string | null
  hover: number | null
  sound: boolean
  reducedMotion: boolean

  setReady: () => void
  open: (p: Exclude<PanelName, null>, projectId?: string) => void
  close: () => void
  setHover: (i: number | null) => void
  setSound: (v: boolean) => void
  setReducedMotion: (v: boolean) => void
}

const prefersReduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export const useApp = create<State>((set) => ({
  ready: false,
  panel: null,
  projectId: null,
  hover: null,
  sound: false,
  reducedMotion: prefersReduced,

  setReady: () => set({ ready: true }),
  open: (panel, projectId) => set({ panel, projectId: projectId ?? null }),
  close: () => set({ panel: null, projectId: null }),
  setHover: (hover) => set((s) => (s.hover === hover ? s : { hover })),
  setSound: (sound) => set({ sound }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}))
