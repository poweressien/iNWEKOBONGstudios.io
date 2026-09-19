import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import type { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib'
import { inputState, interactionRegistry } from '@/lib/engine'
import { resolveXZ, computeFloorY, getActiveColliders } from '@/lib/collision'
import { useGameStore } from '@/store/gameStore'
import { audioManager } from '@/lib/audio'
import { EYE_HEIGHT, PLAYER_RADIUS, MOVE_SPEED } from '@/lib/theme'
import { SPAWN_POSITION } from '@/data/worldColliders'
import type { Level } from '@/types'

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function Player() {
  const { camera } = useThree()
  const controlsRef = useRef<PointerLockControlsImpl>(null)
  const pos = useRef({ x: SPAWN_POSITION.x, z: SPAWN_POSITION.z })
  const levelRef = useRef<Level>('ground')
  const bobPhase = useRef(0)
  const wasMoving = useRef(false)

  const isMobile = useGameStore((s) => s.isMobile)
  const phase = useGameStore((s) => s.phase)
  const activePanel = useGameStore((s) => s.activePanel)
  const reducedMotion = useGameStore((s) => s.reducedMotion)

  const shouldMove = phase === 'playing' && !activePanel

  // Initialize camera at spawn once
  useEffect(() => {
    camera.position.set(SPAWN_POSITION.x, EYE_HEIGHT, SPAWN_POSITION.z)
    camera.rotation.set(0, 0, 0)
  }, [camera])

  // Manage pointer lock lifecycle around panels opening/closing (desktop only)
  useEffect(() => {
    if (isMobile) return
    const controls = controlsRef.current
    if (!controls) return
    if (shouldMove) {
      controls.lock()
    } else {
      controls.unlock()
    }
  }, [shouldMove, isMobile])

  const lastFocusId = useRef<string | null>(null)

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30) // avoid huge jumps after a tab switch

    // --- Portal travel: apply a pending teleport unconditionally, so it
    // always lands even if something else changed shouldMove mid-warp ---
    const pendingTeleport = useGameStore.getState().teleportTarget
    if (pendingTeleport) {
      pos.current.x = pendingTeleport.x
      pos.current.z = pendingTeleport.z
      levelRef.current = 'ground'
      camera.position.set(pendingTeleport.x, EYE_HEIGHT, pendingTeleport.z)
      useGameStore.getState().consumeTeleportTarget()
    }

    if (!shouldMove) return

    // --- Mobile look: touch-drag rotates the camera directly ---
    if (isMobile && (inputState.lookDeltaX !== 0 || inputState.lookDeltaY !== 0)) {
      camera.rotation.y -= inputState.lookDeltaX * 0.0028
      camera.rotation.x = clamp(camera.rotation.x - inputState.lookDeltaY * 0.0028, -1.15, 1.15)
      inputState.lookDeltaX = 0
      inputState.lookDeltaY = 0
    }

    // --- Movement, relative to current camera yaw ---
    const yaw = camera.rotation.y
    const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) }
    const right = { x: Math.cos(yaw), z: -Math.sin(yaw) }
    const moveX = forward.x * inputState.forward + right.x * inputState.right
    const moveZ = forward.z * inputState.forward + right.z * inputState.right
    const len = Math.hypot(moveX, moveZ) || 1
    const speed = MOVE_SPEED * delta
    const dx = (moveX / len) * speed * (inputState.forward !== 0 || inputState.right !== 0 ? 1 : 0)
    const dz = (moveZ / len) * speed * (inputState.forward !== 0 || inputState.right !== 0 ? 1 : 0)

    const isMoving = dx !== 0 || dz !== 0

    if (isMoving) {
      const colliders = getActiveColliders(useGameStore.getState().doorsOpen)
      const resolved = resolveXZ(pos.current.x, pos.current.z, dx, dz, PLAYER_RADIUS, colliders)
      pos.current.x = resolved.x
      pos.current.z = resolved.z
      if (!wasMoving.current) audioManager.footstep()
    }

    if (isMoving && !reducedMotion) {
      bobPhase.current += delta * 9
      if (Math.floor(bobPhase.current / Math.PI) !== Math.floor((bobPhase.current - delta * 9) / Math.PI)) {
        audioManager.footstep()
      }
    }
    wasMoving.current = isMoving

    const floorY = computeFloorY(pos.current.x, pos.current.z, levelRef)
    const bob = isMoving && !reducedMotion ? Math.sin(bobPhase.current) * 0.045 : 0
    camera.position.set(pos.current.x, floorY + EYE_HEIGHT + bob, pos.current.z)

    // --- Interaction proximity scan: find the nearest in-range interactable ---
    const entries = interactionRegistry.all()
    let nearestId: string | null = null
    let nearestLabel: string | null = null
    let nearestDist = Infinity
    for (const entry of entries) {
      const [ex, , ez] = entry.getPosition()
      const d = Math.hypot(ex - pos.current.x, ez - pos.current.z)
      if (d <= entry.radius && d < nearestDist) {
        nearestDist = d
        nearestId = entry.id
        nearestLabel = entry.label
      }
    }
    if (nearestId !== lastFocusId.current) {
      lastFocusId.current = nearestId
      useGameStore.getState().setFocusedInteractableId(nearestId)
      useGameStore.getState().setInteractionPrompt(nearestLabel)
    }
  })

  return !isMobile ? <PointerLockControls ref={controlsRef} makeDefault /> : null
}
