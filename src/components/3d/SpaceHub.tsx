import { Text } from '@react-three/drei'
import { Planet } from './Planet'
import { Portal } from './Portal'
import { FloatingPC } from './FloatingPC'
import { FunnyButtons } from './FunnyButtons'
import { HUB_BOUNDS, HUB_PORTAL_POSITION, PLAZA_ENTRY_POINT } from '@/data/worldColliders'
import { useGameStore } from '@/store/gameStore'
import { portfolio } from '@/data/portfolio'

function PlatformEdge() {
  // A thin glowing rim along each edge instead of a solid wall — the
  // collider is still a full invisible wall, this is purely cosmetic so
  // you can actually see the void (and the planets) beyond the platform.
  const { minX, maxX, minZ, maxZ } = HUB_BOUNDS
  const segments: { x: number; z: number; lengthX?: number; lengthZ?: number }[] = [
    { x: (minX + maxX) / 2, z: minZ, lengthX: maxX - minX },
    { x: (minX + maxX) / 2, z: maxZ, lengthX: maxX - minX },
    { x: minX, z: (minZ + maxZ) / 2, lengthZ: maxZ - minZ },
    { x: maxX, z: (minZ + maxZ) / 2, lengthZ: maxZ - minZ },
  ]
  return (
    <group>
      {segments.map((s, i) => (
        <mesh key={i} position={[s.x, 0.12, s.z]}>
          <boxGeometry args={[s.lengthX ?? 0.12, 0.1, s.lengthZ ?? 0.12]} />
          <meshStandardMaterial color="#6ea8ff" emissive="#6ea8ff" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export function SpaceHub() {
  const openPanel = useGameStore((s) => s.openPanel)
  const { minX, maxX, minZ, maxZ } = HUB_BOUNDS
  const width = maxX - minX
  const depth = maxZ - minZ
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2

  return (
    <group>
      <mesh position={[cx, -0.05, cz]} receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color="#0e0e1a" metalness={0.55} roughness={0.4} />
      </mesh>
      <PlatformEdge />

      <Text position={[0, 3.2, 3]} fontSize={0.4} color="#e8f0ff" anchorX="center" letterSpacing={0.08}>
        {portfolio.tagline}
      </Text>

      <Planet
        id="poweressien"
        name={portfolio.planetPoweressien.name}
        visualPosition={[-46, 14, -8]}
        triggerPosition={[minX + 1.2, 0, -7]}
        radius={7}
        color={portfolio.planetPoweressien.color}
        onInteract={() => openPanel('github')}
      />
      <Planet
        id="inwekobong"
        name={portfolio.planetInwekobong.name}
        visualPosition={[46, 16, -6]}
        triggerPosition={[maxX - 1.2, 0, -7]}
        radius={8}
        color={portfolio.planetInwekobong.color}
        onInteract={() => openPanel('about')}
      />

      <FloatingPC position={[-6, 2.1, 1]} url={portfolio.externalSiteUrl} />
      <FunnyButtons center={[6, 1.1, 1]} buttons={portfolio.funnyButtons} />

      <Portal
        id="portal-to-tower"
        position={[HUB_PORTAL_POSITION.x, 1, HUB_PORTAL_POSITION.z]}
        target={PLAZA_ENTRY_POINT}
        label="ENTER THE PORTAL"
      />
      <Text position={[HUB_PORTAL_POSITION.x, 3.6, HUB_PORTAL_POSITION.z]} fontSize={0.22} color="#a685ff" anchorX="center" letterSpacing={0.1}>
        INWEKOBONG TECHNOLOGIES →
      </Text>
    </group>
  )
}
