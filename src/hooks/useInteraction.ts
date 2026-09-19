import { useEffect, useRef } from 'react'
import { interactionRegistry } from '@/lib/engine'
import { useGameStore } from '@/store/gameStore'
import type { Vec3 } from '@/types'

interface UseInteractableOptions {
  id: string
  label: string
  radius?: number
  getPosition: () => Vec3
  onInteract: () => void
  disabled?: boolean
}

/**
 * Registers a 3D object as something the player can press [E] on.
 * The actual proximity scan lives in Player.tsx (one loop for every
 * interactable is far cheaper than N components each doing their own
 * distance check) — this hook just adds/removes the entry and hands back
 * whether THIS object is the one currently focused, for a highlight glow.
 */
export function useInteractable({ id, label, radius = 2.2, getPosition, onInteract, disabled }: UseInteractableOptions) {
  const onInteractRef = useRef(onInteract)
  onInteractRef.current = onInteract

  useEffect(() => {
    if (disabled) {
      interactionRegistry.unregister(id)
      return
    }
    interactionRegistry.register({
      id,
      label,
      radius,
      getPosition,
      onInteract: () => onInteractRef.current(),
    })
    return () => interactionRegistry.unregister(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, label, radius, disabled])
}

export function useIsFocused(id: string): boolean {
  return useGameStore((s) => s.focusedInteractableId === id)
}
