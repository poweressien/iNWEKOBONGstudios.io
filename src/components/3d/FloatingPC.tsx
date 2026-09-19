import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useInteractable, useIsFocused } from '@/hooks/useInteraction'
import { useGameStore } from '@/store/gameStore'
import { createCodeScreenTexture } from '@/lib/canvasTextures'
import type { Vec3 } from '@/types'

interface FloatingPCProps {
  position: Vec3
  url: string
}

export function FloatingPC({ position, url }: FloatingPCProps) {
  const groupRef = useRef<Group>(null)
  const reducedMotion = useGameStore((s) => s.reducedMotion)
  const focused = useIsFocused('floating-pc')
  const screenTex = useMemo(() => createCodeScreenTexture('#5ee6b0'), [])

  useInteractable({
    id: 'floating-pc',
    label: 'OPEN ANOTHER SITE',
    radius: 2.2,
    getPosition: () => position,
    onInteract: () => window.open(url, '_blank', 'noopener,noreferrer'),
  })

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return
    if (reducedMotion) return
    groupRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.9) * 0.18
    groupRef.current.rotation.y += delta * 0.25
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Tower unit */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.9, 0.45]} />
        <meshStandardMaterial color="#181822" metalness={0.5} roughness={0.35} />
      </mesh>
      {/* Screen, angled to face outward */}
      <group position={[0, 0.75, 0.1]} rotation={[-0.25, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.85, 0.55, 0.04]} />
          <meshStandardMaterial color="#101018" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.023]}>
          <planeGeometry args={[0.78, 0.48]} />
          <meshStandardMaterial
            map={screenTex}
            emissive="#5ee6b0"
            emissiveIntensity={focused ? 0.7 : 0.4}
            emissiveMap={screenTex}
            toneMapped={false}
          />
        </mesh>
      </group>
      {/* Levitation glow underneath */}
      <mesh position={[0, -0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial color="#5ee6b0" transparent opacity={focused ? 0.7 : 0.4} toneMapped={false} />
      </mesh>
      <pointLight position={[0, -0.4, 0]} color="#5ee6b0" intensity={0.7} distance={3} decay={2} />
    </group>
  )
}
