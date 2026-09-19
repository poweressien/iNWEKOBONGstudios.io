import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import type { Mesh } from 'three'
import { useInteractable, useIsFocused } from '@/hooks/useInteraction'
import { useGameStore } from '@/store/gameStore'
import { audioManager } from '@/lib/audio'
import type { FunnyButton, Vec3 } from '@/types'

const COLORS = ['#ff6e8c', '#5ee6b0', '#6ea8ff', '#ffb15e']

function BigButton({ id, data, position, color }: { id: string; data: FunnyButton; position: Vec3; color: string }) {
  const focused = useIsFocused(id)
  const pressed = useRef(false)
  const [pressY, setPressY] = useState(0)
  const capRef = useRef<Mesh>(null)

  useInteractable({
    id,
    label: data.label,
    radius: 1.8,
    getPosition: () => position,
    onInteract: () => {
      pressed.current = true
      audioManager.uiClick()
      useGameStore.getState().showToast(data.response)
    },
  })

  useFrame((_, delta) => {
    const target = pressed.current ? -0.06 : 0
    setPressY((y) => y + (target - y) * Math.min(1, delta * 10))
    if (pressed.current && Math.abs(pressY - target) < 0.002) pressed.current = false
  })

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.22, 20]} />
        <meshStandardMaterial color="#181822" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh ref={capRef} position={[0, 0.14 + pressY, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.14, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={focused ? 1.3 : 0.6} roughness={0.4} toneMapped={false} />
      </mesh>
      <Text position={[0, 0.45, 0]} fontSize={0.11} color="#e8f0ff" anchorX="center" anchorY="middle" maxWidth={1} textAlign="center">
        {data.label}
      </Text>
    </group>
  )
}

export function FunnyButtons({ center, buttons }: { center: Vec3; buttons: FunnyButton[] }) {
  const spacing = 1.3
  const startX = -((buttons.length - 1) * spacing) / 2

  return (
    <group>
      {buttons.map((b, i) => (
        <BigButton
          key={b.label}
          id={`funny-button-${i}`}
          data={b}
          position={[center[0] + startX + i * spacing, center[1], center[2]]}
          color={COLORS[i % COLORS.length]}
        />
      ))}
    </group>
  )
}
