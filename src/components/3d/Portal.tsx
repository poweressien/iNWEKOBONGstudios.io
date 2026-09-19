import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useInteractable, useIsFocused } from '@/hooks/useInteraction'
import { useGameStore } from '@/store/gameStore'
import { audioManager } from '@/lib/audio'
import type { Vec3 } from '@/types'

interface PortalProps {
  id: string
  position: Vec3
  target: { x: number; z: number }
  label: string
  colorA?: string
  colorB?: string
}

export function Portal({ id, position, target, label, colorA = '#6ea8ff', colorB = '#a685ff' }: PortalProps) {
  const groupRef = useRef<Group>(null)
  const ring1 = useRef<Group>(null)
  const ring2 = useRef<Group>(null)
  const ring3 = useRef<Group>(null)
  const reducedMotion = useGameStore((s) => s.reducedMotion)
  const focused = useIsFocused(id)

  useInteractable({
    id,
    label,
    radius: 2.4,
    getPosition: () => position,
    onInteract: () => {
      audioManager.doorOpen()
      useGameStore.getState().requestWarp(target)
    },
  })

  useFrame((_, delta) => {
    if (reducedMotion) return
    if (ring1.current) ring1.current.rotation.z += delta * 0.6
    if (ring2.current) ring2.current.rotation.z -= delta * 0.9
    if (ring3.current) ring3.current.rotation.z += delta * 1.4
    if (groupRef.current) groupRef.current.position.y = position[1] + Math.sin(Date.now() * 0.001) * 0.08
  })

  return (
    <group ref={groupRef} position={position}>
      <group ref={ring1}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.08, 12, 48]} />
          <meshStandardMaterial color={colorA} emissive={colorA} emissiveIntensity={focused ? 2 : 1.1} toneMapped={false} />
        </mesh>
      </group>
      <group ref={ring2}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.15, 0.05, 10, 40]} />
          <meshStandardMaterial color={colorB} emissive={colorB} emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
      </group>
      <group ref={ring3}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.8, 0.03, 8, 40]} />
          <meshStandardMaterial color={colorA} emissive={colorA} emissiveIntensity={0.8} toneMapped={false} transparent opacity={0.7} />
        </mesh>
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.4, 40]} />
        <meshBasicMaterial color={colorB} transparent opacity={0.22} toneMapped={false} />
      </mesh>
      <pointLight color={colorA} intensity={focused ? 1.6 : 1} distance={7} decay={2} />
    </group>
  )
}
