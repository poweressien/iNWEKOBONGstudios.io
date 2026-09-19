import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import type { Group } from 'three'
import { useInteractable, useIsFocused } from '@/hooks/useInteraction'
import { useGameStore } from '@/store/gameStore'
import { audioManager } from '@/lib/audio'
import type { Vec3 } from '@/types'

interface DoorProps {
  id: 'entrance'
  position: Vec3
  /** Which way the panel swings open, in radians, once already facing along the wall (see rotationY). */
  openAngle: number
  /** Base orientation of the doorway itself: 0 for a wall running along X, Math.PI/2 for a wall running along Z. */
  rotationY?: number
  label: string
  width?: number
  height?: number
}

export function Door({ id, position, openAngle, rotationY = 0, label, width = 1.5, height = 3.1 }: DoorProps) {
  const hingeRef = useRef<Group>(null)
  const isOpen = useGameStore((s) => s.doorsOpen[id])
  const setDoorOpen = useGameStore((s) => s.setDoorOpen)
  const reducedMotion = useGameStore((s) => s.reducedMotion)
  const focused = useIsFocused(`door-${id}`)

  useInteractable({
    id: `door-${id}`,
    label,
    radius: 2.4,
    getPosition: () => position,
    onInteract: () => {
      const next = !useGameStore.getState().doorsOpen[id]
      setDoorOpen(id, next)
      if (next) audioManager.doorOpen()
      else audioManager.doorClose()
    },
  })

  useFrame((_, delta) => {
    if (!hingeRef.current) return
    const target = isOpen ? openAngle : 0
    if (reducedMotion) {
      hingeRef.current.rotation.y = target
      return
    }
    const current = hingeRef.current.rotation.y
    hingeRef.current.rotation.y = current + (target - current) * Math.min(1, delta * 4.5)
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Frame */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width + 0.3, height + 0.2, 0.35]} />
        <meshStandardMaterial color="#1c1c2a" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Hinged panel, pivoting from the edge */}
      <group ref={hingeRef} position={[-width / 2, 0, 0]}>
        <mesh position={[width / 2, height / 2, 0]} castShadow>
          <boxGeometry args={[width, height, 0.12]} />
          <meshStandardMaterial
            color={focused ? '#22263a' : '#181822'}
            metalness={0.5}
            roughness={0.4}
            emissive="#6ea8ff"
            emissiveIntensity={focused ? 0.35 : 0.08}
          />
        </mesh>
      </group>
      {/* Small backlit plaque, not a navbar — reads as a real door sign */}
      <mesh position={[0, height + 0.35, 0.02]}>
        <planeGeometry args={[width * 0.8, 0.32]} />
        <meshStandardMaterial color="#0a0a12" emissive="#6ea8ff" emissiveIntensity={0.35} toneMapped={false} />
      </mesh>
      <Text
        position={[0, height + 0.35, 0.19]}
        fontSize={0.16}
        color="#e8f0ff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        {label.toUpperCase()}
      </Text>
    </group>
  )
}
