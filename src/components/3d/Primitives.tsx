import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Vec3 } from '@/types'
import { useGameStore } from '@/store/gameStore'

interface SolidBoxProps {
  position: Vec3
  size: Vec3
  color?: string
  rotationY?: number
  metalness?: number
  roughness?: number
  emissive?: string
  emissiveIntensity?: number
  castShadow?: boolean
  receiveShadow?: boolean
}

export function SolidBox({
  position,
  size,
  color = '#15151f',
  rotationY = 0,
  metalness = 0.2,
  roughness = 0.7,
  emissive,
  emissiveIntensity = 0,
  castShadow = true,
  receiveShadow = true,
}: SolidBoxProps) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissive ? emissiveIntensity : 0}
      />
    </mesh>
  )
}

interface FloorProps {
  center: [number, number]
  size: [number, number]
  color?: string
}

export function Floor({ center, size, color = '#0c0c14' }: FloorProps) {
  return (
    <mesh position={[center[0], 0, center[1]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.55} />
    </mesh>
  )
}

interface WallSegmentProps {
  /** Center X of the wall run */
  x: number
  /** Center Z of the wall run */
  z: number
  /** Length along X (set lengthZ instead for a wall running along Z) */
  lengthX?: number
  lengthZ?: number
  height?: number
  thickness?: number
  color?: string
  accentStrip?: boolean
}

/** A wall segment with a subtle emissive accent strip near the base — reads as "designed", not a flat box. */
export function WallSegment({
  x,
  z,
  lengthX,
  lengthZ,
  height = 4.2,
  thickness = 0.3,
  color = '#15151f',
  accentStrip = true,
}: WallSegmentProps) {
  const size: Vec3 = lengthX ? [lengthX, height, thickness] : [thickness, height, lengthZ ?? 1]
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} metalness={0.15} roughness={0.85} />
      </mesh>
      {accentStrip && (
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={lengthX ? [lengthX * 0.94, 0.04, thickness + 0.01] : [thickness + 0.01, 0.04, (lengthZ ?? 1) * 0.94]} />
          <meshStandardMaterial color="#6ea8ff" emissive="#6ea8ff" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

/** Cheap, GPU-light dust motes that drift upward and wrap — reused by every room. */
export function FloatingParticles({
  count = 140,
  bounds = [18, 4, 18] as Vec3,
  colorHex = '#6ea8ff',
  center = [0, 0, 0] as Vec3,
}) {
  const reducedMotion = useGameStore((s) => s.reducedMotion)
  const pointsRef = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = center[0] + (Math.random() - 0.5) * bounds[0]
      arr[i * 3 + 1] = Math.random() * bounds[1]
      arr[i * 3 + 2] = center[2] + (Math.random() - 0.5) * bounds[2]
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  useFrame((_, delta) => {
    if (reducedMotion) return
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const speed = 0.25 * delta
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speed
      if (arr[i * 3 + 1] > bounds[1]) arr[i * 3 + 1] = 0
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial color={colorHex} size={0.035} transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  )
}
