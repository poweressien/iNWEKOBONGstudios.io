import { create } from 'zustand'
import type { GamePhase, PanelType } from '@/types'

interface DoorsOpen {
  entrance: boolean
}

interface TeleportTarget {
  x: number
  z: number
}

interface GameState {
  phase: GamePhase
  setPhase: (p: GamePhase) => void

  activePanel: PanelType
  activeProjectId: string | null
  openPanel: (panel: PanelType, projectId?: string) => void
  closePanel: () => void

  soundEnabled: boolean
  toggleSound: () => void

  reducedMotion: boolean
  toggleReducedMotion: () => void

  isMobile: boolean
  setIsMobile: (v: boolean) => void

  doorsOpen: DoorsOpen
  setDoorOpen: (door: keyof DoorsOpen, open: boolean) => void

  interactionPrompt: string | null
  setInteractionPrompt: (p: string | null) => void

  focusedInteractableId: string | null
  setFocusedInteractableId: (id: string | null) => void

  accessibilityMenuOpen: boolean
  setAccessibilityMenuOpen: (v: boolean) => void

  // Portal travel between the Space Hub and the Tower
  teleportTarget: TeleportTarget | null
  warping: boolean
  requestWarp: (target: TeleportTarget) => void
  consumeTeleportTarget: () => void

  // Funny-button reactions
  toastMessage: string | null
  showToast: (message: string) => void
}

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

let toastTimer: ReturnType<typeof setTimeout> | null = null

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'loading',
  setPhase: (phase) => set({ phase }),

  activePanel: null,
  activeProjectId: null,
  openPanel: (panel, projectId) => {
    set({ activePanel: panel, activeProjectId: projectId ?? null })
    if (!get().isMobile && document.pointerLockElement) document.exitPointerLock()
  },
  closePanel: () => {
    set({ activePanel: null, activeProjectId: null })
    const { isMobile, phase } = get()
    if (!isMobile && phase === 'playing') {
      // Closing a panel is itself a user gesture (the click that triggered this),
      // so re-requesting the lock here satisfies the browser's activation rule.
      document.querySelector('canvas')?.requestPointerLock()
    }
  },

  soundEnabled: false,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

  reducedMotion: prefersReducedMotion,
  toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),

  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),

  doorsOpen: { entrance: false },
  setDoorOpen: (door, open) => set((s) => ({ doorsOpen: { ...s.doorsOpen, [door]: open } })),

  interactionPrompt: null,
  setInteractionPrompt: (interactionPrompt) => set({ interactionPrompt }),

  focusedInteractableId: null,
  setFocusedInteractableId: (focusedInteractableId) => set({ focusedInteractableId }),

  accessibilityMenuOpen: false,
  setAccessibilityMenuOpen: (accessibilityMenuOpen) => {
    set({ accessibilityMenuOpen })
    const { isMobile, phase } = get()
    if (isMobile) return
    if (accessibilityMenuOpen && document.pointerLockElement) document.exitPointerLock()
    else if (!accessibilityMenuOpen && phase === 'playing') document.querySelector('canvas')?.requestPointerLock()
  },

  teleportTarget: null,
  warping: false,
  requestWarp: (target) => {
    set({ warping: true })
    // The "quantum tunnel" beat: flash on, swap position while the screen is
    // washed out, flash off. Player.tsx picks up teleportTarget on its next frame.
    setTimeout(() => {
      set({ teleportTarget: target })
      setTimeout(() => set({ warping: false }), 320)
    }, 420)
  },
  consumeTeleportTarget: () => set({ teleportTarget: null }),

  toastMessage: null,
  showToast: (message) => {
    set({ toastMessage: message })
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => set({ toastMessage: null }), 3200)
  },
}))
