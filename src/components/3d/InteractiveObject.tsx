import type { ReactNode } from 'react'
import { useInteractable, useIsFocused } from '@/hooks/useInteraction'
import type { Vec3 } from '@/types'

interface InteractiveObjectProps {
  id: string
  label: string
  position: Vec3
  radius?: number
  onInteract: () => void
  children: ReactNode
  showRing?: boolean
}

export function InteractiveObject({ id, label, position, radius = 2.2, onInteract, children, showRing = true }: InteractiveObjectProps) {
  const focused = useIsFocused(id)

  useInteractable({ id, label, radius, getPosition: () => position, onInteract })

  return (
    <group position={position}>
      {children}
      {showRing && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 0.55, radius * 0.6, 32]} />
          <meshBasicMaterial
            color="#6ea8ff"
            transparent
            opacity={focused ? 0.5 : 0}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  )
}
