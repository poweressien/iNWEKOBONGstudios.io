import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import { ProjectStation } from './ProjectStation'
import { LOFT, RAMP } from '@/data/worldColliders'
import { LOFT_Y } from '@/lib/theme'
import { projects } from '@/data/projects'

function Railing({ x, z, lengthX, lengthZ }: { x: number; z: number; lengthX?: number; lengthZ?: number }) {
  const size: [number, number, number] = lengthX ? [lengthX, 0.03, 0.02] : [0.02, 0.03, lengthZ ?? 1]
  const postCount = Math.max(2, Math.round((lengthX ?? lengthZ ?? 1) / 1.1))
  return (
    <group position={[x, LOFT_Y, z]}>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#2a2a38" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <planeGeometry args={lengthX ? [lengthX * 0.97, 1] : [1, (lengthZ ?? 1) * 0.97]} />
        <meshPhysicalMaterial color="#6ea8ff" transparent opacity={0.12} roughness={0.1} transmission={0.5} />
      </mesh>
      {Array.from({ length: postCount }).map((_, i) => {
        const t = i / (postCount - 1) - 0.5
        const px = lengthX ? t * lengthX : 0
        const pz = lengthZ ? t * lengthZ : 0
        return (
          <mesh key={i} position={[px, 0.5, pz]}>
            <boxGeometry args={[0.03, 1, 0.03]} />
            <meshStandardMaterial color="#2a2a38" metalness={0.6} roughness={0.3} />
          </mesh>
        )
      })}
    </group>
  )
}

function ActivityWall() {
  const cells = useMemo(() => {
    const out: { x: number; y: number; v: number }[] = []
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 6; y++) {
        out.push({ x, y, v: Math.random() })
      }
    }
    return out
  }, [])

  return (
    <group position={[LOFT.minX + 0.35, LOFT_Y + 1.7, (LOFT.minZ + LOFT.maxZ) / 2]} rotation={[0, Math.PI / 2, 0]}>
      <Text position={[0, 1, 0]} fontSize={0.16} color="#5ee6b0" anchorX="center" letterSpacing={0.1}>
        BUILD ACTIVITY
      </Text>
      {cells.map((c, i) => (
        <mesh key={i} position={[(c.x - 9.5) * 0.16, 0.6 - c.y * 0.16, 0]}>
          <boxGeometry args={[0.13, 0.13, 0.01]} />
          <meshStandardMaterial
            color="#5ee6b0"
            emissive="#5ee6b0"
            emissiveIntensity={c.v * 1.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

export function ProjectFloor() {
  const leftX = LOFT.minX + 1.0
  const rightX = LOFT.maxX - 0.9
  const zStart = -2.6
  const zEnd = LOFT.minZ + 0.9
  const rows = Math.ceil(projects.length / 2)
  const zStep = rows > 1 ? (zEnd - zStart) / (rows - 1) : 0

  return (
    <group>
      {/* Floor always sits at y=0, so the loft's floor is built directly at LOFT_Y instead */}
      <mesh position={[(LOFT.minX + LOFT.maxX) / 2, LOFT_Y, (LOFT.minZ + LOFT.maxZ) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[LOFT.maxX - LOFT.minX, LOFT.maxZ - LOFT.minZ]} />
        <meshStandardMaterial color="#0d0d16" metalness={0.35} roughness={0.5} />
      </mesh>

      <Railing x={LOFT.minX} z={(LOFT.minZ + LOFT.maxZ) / 2} lengthZ={LOFT.maxZ - LOFT.minZ} />
      <Railing x={(LOFT.minX + RAMP.minX) / 2} z={LOFT.maxZ} lengthX={RAMP.minX - LOFT.minX} />

      <Text position={[(LOFT.minX + LOFT.maxX) / 2, LOFT_Y + 2.1, LOFT.minZ + 0.05]} fontSize={0.26} color="#6ea8ff" anchorX="center" letterSpacing={0.12}>
        PROJECTS
      </Text>

      <ActivityWall />

      {projects.map((project, i) => {
        const side = i % 2 === 0 ? 'left' : 'right'
        const row = Math.floor(i / 2)
        const z = zStart + row * zStep
        const x = side === 'left' ? leftX : rightX
        const rotationY = side === 'left' ? Math.PI / 2 : -Math.PI / 2
        return <ProjectStation key={project.id} project={project} position={[x, LOFT_Y, z]} rotationY={rotationY} />

      })}
    </group>
  )
}
