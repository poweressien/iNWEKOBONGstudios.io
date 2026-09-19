import { useEffect } from 'react'
import { inputState, interactionRegistry } from '@/lib/engine'
import { useGameStore } from '@/store/gameStore'
import { audioManager } from '@/lib/audio'

export function triggerInteract() {
  const { focusedInteractableId, activePanel } = useGameStore.getState()
  if (activePanel || !focusedInteractableId) return
  const entry = interactionRegistry.all().find((e) => e.id === focusedInteractableId)
  if (entry) {
    audioManager.uiClick()
    entry.onInteract()
  }
}

function triggerEscape() {
  const { activePanel, closePanel, phase, openPanel } = useGameStore.getState()
  if (activePanel) {
    closePanel()
  } else if (phase === 'playing') {
    openPanel('settings')
  }
}

/** Desktop keyboard only — mobile input is written directly by MobileControls. */
export function usePlayerControls() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          inputState.forward = 1
          break
        case 'KeyS':
        case 'ArrowDown':
          inputState.forward = -1
          break
        case 'KeyA':
        case 'ArrowLeft':
          inputState.right = -1
          break
        case 'KeyD':
        case 'ArrowRight':
          inputState.right = 1
          break
        case 'KeyE':
          triggerInteract()
          break
        case 'Escape':
          triggerEscape()
          break
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          if (inputState.forward === 1) inputState.forward = 0
          break
        case 'KeyS':
        case 'ArrowDown':
          if (inputState.forward === -1) inputState.forward = 0
          break
        case 'KeyA':
        case 'ArrowLeft':
          if (inputState.right === -1) inputState.right = 0
          break
        case 'KeyD':
        case 'ArrowRight':
          if (inputState.right === 1) inputState.right = 0
          break
      }
    }

    const onBlur = () => {
      inputState.forward = 0
      inputState.right = 0
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])
}
