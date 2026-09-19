import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshStandardMaterial } from 'three'
import { useInteractable, useIsFocused } from '@/hooks/useInteraction'
import { useGameStore } from '@/store/gameStore'
import { audioManager } from '@/lib/audio'
import { createCodeScreenTexture } from '@/lib/canvasTextures'
import type { Vec3 } from '@/types'

interface ComputerProps {
  position: Vec3
}

export function Computer({ position }: ComputerProps) {
  const focused = useIsFocused('github-computer')
  const openPanel = useGameStore((s) => s.openPanel)
  const [screenOn, setScreenOn] = useState(false)
  const screenMatRef = useRef<MeshStandardMaterial>(null)
  const screenTexture = useMemo(() => createCodeScreenTexture('#6ea8ff'), [])
  const towerRef = useRef<Mesh>(null)

  useInteractable({
    id: 'github-computer',
    label: 'ACCESS GITHUB',
    radius: 2,
    getPosition: () => position,
    onInteract: () => {
      setScreenOn(true)
      audioManager.computerOn()
      openPanel('github')
    },
  })

  useFrame((_, delta) => {
    if (!screenMatRef.current) return
    const target = screenOn ? 1.6 : 0.15
    screenMatRef.current.emissiveIntensity += (target - screenMatRef.current.emissiveIntensity) * Math.min(1, delta * 3)
  })

  return (
    <group position={position}>
      {/* Everything below assumes position.y is already the desk surface height */}

      {/* Tower, standing on the desk to the side */}
      <mesh ref={towerRef} position={[0.55, 0.25, -0.3]} castShadow>
        <boxGeometry args={[0.22, 0.5, 0.4]} />
        <meshStandardMaterial color="#101018" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0.55, 0.25, -0.09]}>
        <planeGeometry args={[0.05, 0.05]} />
        <meshStandardMaterial
          color="#5ee6b0"
          emissive="#5ee6b0"
          emissiveIntensity={screenOn ? 2 : 0.4}
          toneMapped={false}
        />
      </mesh>

      {/* Monitor */}
      <group position={[0, 0, -0.25]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.75, 0.5, 0.04]} />
          <meshStandardMaterial color="#101018" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.35, 0.023]}>
          <planeGeometry args={[0.68, 0.43]} />
          <meshStandardMaterial
            ref={screenMatRef}
            map={screenTexture}
            color="#ffffff"
            emissive="#6ea8ff"
            emissiveIntensity={0.15}
            emissiveMap={screenTexture}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.08]} />
          <meshStandardMaterial color="#101018" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>

      {/* Focus glow ring on the real floor, out in front of the desk */}
      <mesh position={[0, -position[1] + 0.01, 0.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.65, 0.72, 32]} />
        <meshBasicMaterial color="#5ee6b0" transparent opacity={focused ? 0.45 : 0} toneMapped={false} />
      </mesh>
    </group>
  )
}
