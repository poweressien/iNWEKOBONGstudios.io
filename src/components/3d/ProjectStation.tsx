import { useMemo } from 'react'
import { RoundedBox, Text } from '@react-three/drei'
import { useInteractable, useIsFocused } from '@/hooks/useInteraction'
import { useGameStore } from '@/store/gameStore'
import { createProjectPreviewTexture } from '@/lib/canvasTextures'
import type { ProjectData, Vec3 } from '@/types'

interface ProjectStationProps {
  project: ProjectData
  position: Vec3
  /** Which way the pod faces (radians) so it looks into the walking aisle. */
  rotationY: number
}

export function ProjectStation({ project, position, rotationY }: ProjectStationProps) {
  const focused = useIsFocused(`project-${project.id}`)
  const openPanel = useGameStore((s) => s.openPanel)
  const preview = useMemo(() => createProjectPreviewTexture(project.title, project.accent), [project.title, project.accent])

  useInteractable({
    id: `project-${project.id}`,
    label: `VIEW ${project.title.toUpperCase()}`,
    radius: 2,
    getPosition: () => position,
    onInteract: () => openPanel('project', project.id),
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Pedestal desk */}
      <RoundedBox args={[1.3, 0.72, 0.7]} radius={0.03} position={[0, 0.36, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#161620" metalness={0.35} roughness={0.6} />
      </RoundedBox>

      {/* Angled preview screen */}
      <group position={[0, 1.15, -0.15]} rotation={[-0.15, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.1, 0.72, 0.04]} />
          <meshStandardMaterial color="#101018" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[1.02, 0.64]} />
          <meshStandardMaterial
            map={preview}
            emissiveMap={preview}
            emissive={project.accent}
            emissiveIntensity={focused ? 0.9 : 0.45}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Stand */}
      <mesh position={[0, 0.75, -0.1]}>
        <boxGeometry args={[0.06, 0.35, 0.06]} />
        <meshStandardMaterial color="#101018" metalness={0.6} roughness={0.35} />
      </mesh>

      <Text
        position={[0, 1.62, -0.15]}
        fontSize={0.13}
        color="#e8f0ff"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.4}
      >
        {project.title}
      </Text>

      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.85, 0.92, 32]} />
        <meshBasicMaterial color={project.accent} transparent opacity={focused ? 0.4 : 0} toneMapped={false} />
      </mesh>
    </group>
  )
}
