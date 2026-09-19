import type { BoxCollider, Level } from '@/types'
import {
  staticColliders,
  entranceDoorCollider,
  RAMP,
  LOFT,
  WORLD_SAFETY_BOUNDS,
} from '@/data/worldColliders'
import { LOFT_Y } from '@/lib/theme'

function boxHit(x: number, z: number, r: number, c: BoxCollider): boolean {
  return x + r > c.minX && x - r < c.maxX && z + r > c.minZ && z - r < c.maxZ
}

function collidesAny(x: number, z: number, r: number, colliders: BoxCollider[]): boolean {
  for (let i = 0; i < colliders.length; i++) {
    if (boxHit(x, z, r, colliders[i])) return true
  }
  return false
}

/** The entrance door only blocks while closed — computed fresh each frame from live store state. */
export function getActiveColliders(doorsOpen: { entrance: boolean }): BoxCollider[] {
  const list = staticColliders.slice()
  if (!doorsOpen.entrance) list.push(entranceDoorCollider)
  return list
}

/**
 * Moves (x,z) by (dx,dz), resolving each axis independently so the player
 * slides along a wall instead of stopping dead when approaching at an angle.
 */
export function resolveXZ(
  x: number,
  z: number,
  dx: number,
  dz: number,
  radius: number,
  colliders: BoxCollider[],
): { x: number; z: number } {
  let nx = x
  let nz = z

  const tryX = x + dx
  if (!collidesAny(tryX, z, radius, colliders)) nx = tryX

  const tryZ = z + dz
  if (!collidesAny(nx, tryZ, radius, colliders)) nz = tryZ

  // Defensive clamp — the enclosed rooms should make this unreachable, but
  // it's a cheap guarantee the player can never end up outside the world.
  nx = Math.min(Math.max(nx, WORLD_SAFETY_BOUNDS.minX), WORLD_SAFETY_BOUNDS.maxX)
  nz = Math.min(Math.max(nz, WORLD_SAFETY_BOUNDS.minZ), WORLD_SAFETY_BOUNDS.maxZ)

  return { x: nx, z: nz }
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

// Buffer around the ramp's Z bounds used only to decide WHEN to flip levelRef,
// not to compute height (height always uses the exact RAMP bounds below).
// This has to stay comfortably wider than the largest possible single-frame
// movement, or a normal frame-rate hitch can step clean over a narrow
// trigger window and land back at the wrong level. Player.tsx clamps delta
// to 1/30s and moves at MOVE_SPEED units/sec, so worst case is well under
// 0.15 units per frame — 0.25 leaves a comfortable margin.
const LEVEL_FLIP_BUFFER = 0.25

/**
 * Two-level height field: ground (y=0) everywhere, except the loft (y=LOFT_Y)
 * once the player has actually climbed the ramp onto it. `levelRef` is
 * mutated in place so the caller just needs to keep passing the same ref
 * back in every frame — this is what lets the same (x,z) footprint mean
 * "floor of the office" when you're on the ground and "top of the loft"
 * once you've climbed up, without full 3D physics.
 */
export function computeFloorY(x: number, z: number, levelRef: { current: Level }): number {
  const inRampX = x >= RAMP.minX && x <= RAMP.maxX
  const inRampZ = z >= RAMP.topZ - LEVEL_FLIP_BUFFER && z <= RAMP.bottomZ + LEVEL_FLIP_BUFFER

  if (inRampX && inRampZ) {
    // Height always uses the exact bounds (clamped), regardless of the wider
    // detection buffer above, so the surface itself never has a seam.
    const t = clamp01((RAMP.bottomZ - z) / (RAMP.bottomZ - RAMP.topZ))
    const h = t * LOFT_Y

    // Position-based flip (not "is h within X of max"): reaching the last
    // stretch near either end sets the level outright, rather than requiring
    // a specific prior state. That makes it self-correcting regardless of
    // how large the step that got us here was.
    if (z <= RAMP.topZ + LEVEL_FLIP_BUFFER) levelRef.current = 'loft'
    if (z >= RAMP.bottomZ - LEVEL_FLIP_BUFFER) levelRef.current = 'ground'

    return h
  }

  if (levelRef.current === 'loft') {
    const inLoft = x >= LOFT.minX && x <= LOFT.maxX && z >= LOFT.minZ && z <= LOFT.maxZ
    return inLoft ? LOFT_Y : LOFT_Y // railings should make the else-branch unreachable; stay elevated defensively if it ever isn't
  }

  return 0
}
