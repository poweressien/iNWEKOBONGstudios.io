import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import type { Group, Mesh } from 'three'
import { useInteractable, useIsFocused } from '@/hooks/useInteraction'
import { useGameStore } from '@/store/gameStore'
import { audioManager } from '@/lib/audio'
import { portfolio } from '@/data/portfolio'
import type { Vec3 } from '@/types'

export function AIHologram({ position }: { position: Vec3 }) {
  const groupRef = useRef<Group>(null)
  const coreRef = useRef<Mesh>(null)
  const ringARef = useRef<Group>(null)
  const ringBRef = useRef<Group>(null)
  const reducedMotion = useGameStore((s) => s.reducedMotion)
  const openPanel = useGameStore((s) => s.openPanel)
  const focused = useIsFocused('ai-hologram')

  useInteractable({
    id: 'ai-hologram',
    label: `TALK TO ${portfolio.aiAssistant.name}`,
    radius: 2.4,
    getPosition: () => position,
    onInteract: () => {
      audioManager.uiClick()
      openPanel('ai')
    },
  })

  useFrame(({ clock }, delta) => {
    if (groupRef.current) groupRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.1) * 0.12
    if (reducedMotion) return
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.5
    if (ringARef.current) ringARef.current.rotation.x += delta * 0.6
    if (ringBRef.current) ringBRef.current.rotation.z -= delta * 0.4
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.28, 1]} />
        <meshStandardMaterial
          color="#6ea8ff"
          emissive="#6ea8ff"
          emissiveIntensity={focused ? 1.8 : 1.1}
          wireframe
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial color="#e8f0ff" emissive="#e8f0ff" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <group ref={ringARef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.012, 8, 40]} />
          <meshStandardMaterial color="#a685ff" emissive="#a685ff" emissiveIntensity={1} toneMapped={false} />
        </mesh>
      </group>
      <group ref={ringBRef} rotation={[0.6, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.65, 0.008, 8, 40]} />
          <meshStandardMaterial color="#6ea8ff" emissive="#6ea8ff" emissiveIntensity={0.8} toneMapped={false} transparent opacity={0.7} />
        </mesh>
      </group>
      <pointLight color="#6ea8ff" intensity={focused ? 1.4 : 0.9} distance={4} decay={2} />
      <Text position={[0, -0.55, 0]} fontSize={0.1} color="#a8c4ff" anchorX="center" anchorY="middle" letterSpacing={0.15}>
        {portfolio.aiAssistant.name}
      </Text>
    </group>
  )
}
