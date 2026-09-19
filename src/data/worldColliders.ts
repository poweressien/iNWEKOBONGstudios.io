import type { BoxCollider } from '@/types'

// World layout (meters, Y-up). Two zones, connected only by the portal
// (a teleport, not a walkable path) — there's real empty space between
// them, which is fine since nothing ever needs to walk through it.
//
//   SPACE HUB (spawn)              — X[-16,16]  Z[-16,10]
//     ...portal teleports here...
//   TOWER PLAZA                    — X[-12,12]  Z[-46,-30]
//   TOWER INTERIOR (through the tower's face, at Z=-46) — X[-9,9] Z[-60,-46]
//     + loft "Project Floor" at X[1.5,9] Z[-60,-52.2], Y=3.4
//       reached by a ramp at X[7,9] Z[-52.2,-49]
//
// The interior is the exact same shape as the original office room, just
// translated by dz=-51 — every ProjectFloor/ProjectStation coordinate below
// is unchanged from that design, only these bounds moved.

export const HUB_BOUNDS = { minX: -16, maxX: 16, minZ: -16, maxZ: 10 }
export const SPAWN_POSITION = { x: 0, z: 7 }

export const PLAZA_BOUNDS = { minX: -12, maxX: 12, minZ: -46, maxZ: -30 }
export const PLAZA_ENTRY_POINT = { x: 0, z: -32 }

export const TOWER_FACE_Z = -46
export const ENTRANCE_GAP = { minX: -1.5, maxX: 1.5 }

export const INTERIOR_BOUNDS = { minX: -9, maxX: 9, minZ: -60, maxZ: -46 }

export const RAMP = { minX: 7, maxX: 9, topZ: -52.2, bottomZ: -49 }
export const LOFT = { minX: 1.5, maxX: 9, minZ: -60, maxZ: -52.2 }

// Where the portal in the hub sends the player, and where the return
// portal in the plaza sends them back to.
export const HUB_PORTAL_POSITION = { x: 0, z: -13.5 }
export const PLAZA_RETURN_PORTAL_POSITION = { x: 0, z: -32.5 }

const WT = 0.3 // wall thickness

export const staticColliders: BoxCollider[] = [
  // --- Space Hub: fully enclosed, no gaps (the only way out is the portal) ---
  { minX: HUB_BOUNDS.minX - WT, maxX: HUB_BOUNDS.maxX + WT, minZ: HUB_BOUNDS.minZ - WT, maxZ: HUB_BOUNDS.minZ }, // back
  { minX: HUB_BOUNDS.minX - WT, maxX: HUB_BOUNDS.maxX + WT, minZ: HUB_BOUNDS.maxZ, maxZ: HUB_BOUNDS.maxZ + WT }, // front
  { minX: HUB_BOUNDS.minX - WT, maxX: HUB_BOUNDS.minX, minZ: HUB_BOUNDS.minZ - WT, maxZ: HUB_BOUNDS.maxZ + WT }, // left
  { minX: HUB_BOUNDS.maxX, maxX: HUB_BOUNDS.maxX + WT, minZ: HUB_BOUNDS.minZ - WT, maxZ: HUB_BOUNDS.maxZ + WT }, // right

  // --- Outer envelope around the plaza + tower footprint (keeps the player
  // from ever wandering into the empty space beside/behind the narrower
  // tower interior) ---
  { minX: PLAZA_BOUNDS.minX - WT, maxX: PLAZA_BOUNDS.maxX + WT, minZ: PLAZA_BOUNDS.maxZ, maxZ: PLAZA_BOUNDS.maxZ + WT }, // plaza near wall (Z=-30 side)
  { minX: PLAZA_BOUNDS.minX - WT, maxX: INTERIOR_BOUNDS.minX - WT, minZ: INTERIOR_BOUNDS.minZ - WT, maxZ: INTERIOR_BOUNDS.minZ }, // far corner, left of tower
  { minX: INTERIOR_BOUNDS.maxX + WT, maxX: PLAZA_BOUNDS.maxX + WT, minZ: INTERIOR_BOUNDS.minZ - WT, maxZ: INTERIOR_BOUNDS.minZ }, // far corner, right of tower
  { minX: PLAZA_BOUNDS.minX - WT, maxX: PLAZA_BOUNDS.minX, minZ: INTERIOR_BOUNDS.minZ - WT, maxZ: PLAZA_BOUNDS.maxZ + WT }, // outer left, full depth
  { minX: PLAZA_BOUNDS.maxX, maxX: PLAZA_BOUNDS.maxX + WT, minZ: INTERIOR_BOUNDS.minZ - WT, maxZ: PLAZA_BOUNDS.maxZ + WT }, // outer right, full depth

  // --- Tower face (shared plaza/interior wall), entrance gap left open ---
  { minX: INTERIOR_BOUNDS.minX, maxX: ENTRANCE_GAP.minX, minZ: TOWER_FACE_Z, maxZ: TOWER_FACE_Z + WT },
  { minX: ENTRANCE_GAP.maxX, maxX: INTERIOR_BOUNDS.maxX, minZ: TOWER_FACE_Z, maxZ: TOWER_FACE_Z + WT },

  // --- Interior's own back/left/right walls ---
  { minX: INTERIOR_BOUNDS.minX - WT, maxX: INTERIOR_BOUNDS.maxX + WT, minZ: INTERIOR_BOUNDS.minZ - WT, maxZ: INTERIOR_BOUNDS.minZ }, // back
  { minX: INTERIOR_BOUNDS.minX - WT, maxX: INTERIOR_BOUNDS.minX, minZ: INTERIOR_BOUNDS.minZ - WT, maxZ: TOWER_FACE_Z }, // left
  { minX: INTERIOR_BOUNDS.maxX, maxX: INTERIOR_BOUNDS.maxX + WT, minZ: INTERIOR_BOUNDS.minZ - WT, maxZ: TOWER_FACE_Z }, // right

  // --- Loft support structure (also doubles as the loft's railing) ---
  { minX: LOFT.minX, maxX: LOFT.minX + WT, minZ: LOFT.minZ, maxZ: LOFT.maxZ }, // inner (X) wall
  { minX: LOFT.minX, maxX: RAMP.minX, minZ: LOFT.maxZ - WT, maxZ: LOFT.maxZ }, // front (Z) wall, stops at the ramp opening

  // --- Stair guard rail (open long edge of the ramp) — only covers the
  // actually-elevated part; the low end near RAMP.bottomZ stays open as
  // the walk-in approach from the interior floor. ---
  { minX: RAMP.minX - WT, maxX: RAMP.minX, minZ: RAMP.topZ, maxZ: RAMP.topZ + 2.7 },

  // --- Interior furniture ---
  { minX: -8.2, maxX: -0.8, minZ: INTERIOR_BOUNDS.minZ, maxZ: INTERIOR_BOUNDS.minZ + 1.5 }, // desk run against the back wall
  { minX: -8.8, maxX: -8.2, minZ: INTERIOR_BOUNDS.minZ + 4.4, maxZ: INTERIOR_BOUNDS.minZ + 5.6 }, // bookshelf
]

export const entranceDoorCollider: BoxCollider = {
  minX: ENTRANCE_GAP.minX,
  maxX: ENTRANCE_GAP.maxX,
  minZ: TOWER_FACE_Z - 0.15,
  maxZ: TOWER_FACE_Z + 0.15,
}

// Generous outer safety net — should never actually be reached since both
// zones above are fully enclosed, but cheap insurance against ever ending
// up outside the world.
export const WORLD_SAFETY_BOUNDS = { minX: -20, maxX: 20, minZ: -65, maxZ: 15 }
