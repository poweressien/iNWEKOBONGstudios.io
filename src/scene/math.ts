/** A tiny perspective camera — just enough 3D to draw one building convincingly on a 2D canvas. */

export interface Cam {
  x: number
  y: number
  z: number
  rx: number
  ry: number
  rz: number
  ux: number
  uy: number
  uz: number
  fx: number
  fy: number
  fz: number
  F: number
  cx: number
  cy: number
}

/** Output of project(): screen x/y and view depth. Shared to avoid allocating in the hot loop. */
export const P = { x: 0, y: 0, z: 0 }

export function makeCam(tx: number, ty: number, tz: number, dist: number, yaw: number, pitch: number, F: number, cx: number, cy: number): Cam {
  const cp = Math.cos(pitch)
  const x = tx + dist * Math.sin(yaw) * cp
  const y = ty + dist * Math.sin(pitch)
  const z = tz + dist * Math.cos(yaw) * cp
  let fx = tx - x
  let fy = ty - y
  let fz = tz - z
  const fl = Math.hypot(fx, fy, fz)
  fx /= fl
  fy /= fl
  fz /= fl
  // right = normalize(f × up)
  let rx = fy * 0 - fz * 1
  let ry = fz * 0 - fx * 0
  let rz = fx * 1 - fy * 0
  const rl = Math.hypot(rx, ry, rz)
  rx /= rl
  ry /= rl
  rz /= rl
  // up' = r × f
  const ux = ry * fz - rz * fy
  const uy = rz * fx - rx * fz
  const uz = rx * fy - ry * fx
  return { x, y, z, rx, ry, rz, ux, uy, uz, fx, fy, fz, F, cx, cy }
}

/** Projects a world point. Returns false when it is behind the near plane. */
export function project(c: Cam, x: number, y: number, z: number): boolean {
  const vx = x - c.x
  const vy = y - c.y
  const vz = z - c.z
  const d = vx * c.fx + vy * c.fy + vz * c.fz
  if (d < 20) return false
  const px = vx * c.rx + vy * c.ry + vz * c.rz
  const py = vx * c.ux + vy * c.uy + vz * c.uz
  const k = c.F / d
  P.x = c.cx + px * k
  P.y = c.cy - py * k
  P.z = d
  return true
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3)
export const smooth = (t: number) => {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}

export function hash(n: number): number {
  let x = (n | 0) + 0x9e3779b9
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  x ^= x >>> 16
  return (x >>> 0) / 4294967296
}

export const wrapAngle = (a: number) => {
  let x = a % (Math.PI * 2)
  if (x > Math.PI) x -= Math.PI * 2
  if (x < -Math.PI) x += Math.PI * 2
  return x
}
