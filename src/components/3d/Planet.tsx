import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import type { Mesh } from 'three'
import { useInteractable, useIsFocused } from '@/hooks/useInteraction'
import { useGameStore } from '@/store/gameStore'
import type { Vec3 } from '@/types'

interface PlanetProps {
  id: string
  name: string
  visualPosition: Vec3
  triggerPosition: Vec3
  radius: number
  color: string
  onInteract: () => void
}

export function Planet({ id, name, visualPosition, triggerPosition, radius, color, onInteract }: PlanetProps) {
  const meshRef = useRef<Mesh>(null)
  const reducedMotion = useGameStore((s) => s.reducedMotion)
  const focused = useIsFocused(`planet-${id}`)

  useInteractable({
    id: `planet-${id}`,
    label: `RECEIVE TRANSMISSION`,
    radius: 3,
    getPosition: () => triggerPosition,
    onInteract,
  })

  useFrame((_, delta) => {
    if (meshRef.current && !reducedMotion) meshRef.current.rotation.y += delta * 0.08
  })

  return (
    <group>
      {/* The planet itself, floating far off */}
      <group position={visualPosition}>
        <mesh ref={meshRef} castShadow={false}>
          <sphereGeometry args={[radius, 48, 32]} />
          <meshStandardMaterial color={color} roughness={0.55} metalness={0.15} emissive={color} emissiveIntensity={0.12} />
        </mesh>
        <mesh>
          <sphereGeometry args={[radius * 1.08, 32, 24]} />
          <meshBasicMaterial color={color} transparent opacity={0.12} toneMapped={false} />
        </mesh>
        <pointLight color={color} intensity={0.8} distance={radius * 6} decay={2} />
        <Text position={[0, radius + 1.6, 0]} fontSize={radius * 0.28} color="#f2f5ff" anchorX="center" anchorY="middle" letterSpacing={0.05}>
          {name}
        </Text>
      </group>

      {/* Floor marker at the walkable trigger point, so it's obvious where to stand */}
      <group position={triggerPosition}>
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.68, 40]} />
          <meshBasicMaterial color={color} transparent opacity={focused ? 0.6 : 0.28} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
