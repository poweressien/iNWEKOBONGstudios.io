import type { InteractableEntry } from '@/types'

/**
 * Raw per-frame input. Written directly by keyboard/touch event handlers,
 * read directly inside useFrame loops. Deliberately NOT React state —
 * putting this in Zustand or useState would re-render the component tree
 * every keystroke/touch-move, which is exactly what we don't want in a
 * first-person controller.
 */
export const inputState = {
  forward: 0,
  right: 0,
  lookActive: false,
  lookDeltaX: 0,
  lookDeltaY: 0,
  interactRequested: false,
}

/**
 * Static-ish registry of everything the player can press [E] on.
 * Doors, the GitHub computer and the contact terminal register once;
 * project stations register one per project from data/projects.ts.
 * A single proximity loop in Player.tsx scans this each frame instead of
 * every interactable running its own distance check.
 */
class InteractionRegistry {
  private entries = new Map<string, InteractableEntry>()

  register(entry: InteractableEntry) {
    this.entries.set(entry.id, entry)
  }

  unregister(id: string) {
    this.entries.delete(id)
  }

  all(): InteractableEntry[] {
    return Array.from(this.entries.values())
  }
}

export const interactionRegistry = new InteractionRegistry()
