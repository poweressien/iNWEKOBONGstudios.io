import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import { Floor, WallSegment } from './Primitives'
import { Door } from './Door'
import { Portal } from './Portal'
import { PLAZA_BOUNDS, TOWER_FACE_Z, ENTRANCE_GAP, PLAZA_RETURN_PORTAL_POSITION, SPAWN_POSITION } from '@/data/worldColliders'

function TowerBuilding() {
  const towerHeight = 46
  const windowRows = 22
  const windowCols = 7

  const windowData = useMemo(() => {
    const out: { y: number; x: number; on: boolean }[] = []
    for (let r = 0; r < windowRows; r++) {
      for (let c = 0; c < windowCols; c++) {
        out.push({ y: 2 + r * 2, x: -6 + c * 2, on: Math.random() > 0.35 })
      }
    }
    return out
  }, [])

  return (
    <group position={[0, 0, TOWER_FACE_Z - 6]}>
      {/* Main body */}
      <mesh position={[0, towerHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[16, towerHeight, 12]} />
        <meshStandardMaterial color="#0c0c16" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Setback crown */}
      <mesh position={[0, towerHeight + 2, 0]} castShadow>
        <boxGeometry args={[9, 4, 7]} />
        <meshStandardMaterial color="#0e0e18" metalness={0.65} roughness={0.3} />
      </mesh>
      {/* Beacon */}
      <mesh position={[0, towerHeight + 6, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 4, 8]} />
        <meshStandardMaterial color="#a685ff" emissive="#a685ff" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <pointLight position={[0, towerHeight + 8, 0]} color="#a685ff" intensity={1.2} distance={14} decay={2} />

      {/* Windows, front face */}
      {windowData.map((w, i) => (
        <mesh key={i} position={[w.x, w.y, 6.05]}>
          <planeGeometry args={[1.1, 1.3]} />
          <meshStandardMaterial
            color={w.on ? '#6ea8ff' : '#0a0a12'}
            emissive={w.on ? '#6ea8ff' : '#000000'}
            emissiveIntensity={w.on ? 0.9 : 0}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* INWEKOBONG TECHNOLOGIES signage, lit up on the face */}
      <Text position={[0, 12, 6.1]} fontSize={1.1} color="#f2f5ff" anchorX="center" anchorY="middle" letterSpacing={0.05}>
        INWEKOBONG
      </Text>
      <Text position={[0, 10.2, 6.1]} fontSize={0.55} color="#6ea8ff" anchorX="center" anchorY="middle" letterSpacing={0.25}>
        TECHNOLOGIES
      </Text>
    </group>
  )
}

export function TowerExterior() {
  const { minX, maxX, minZ, maxZ } = PLAZA_BOUNDS
  const cx = (minX + maxX) / 2

  return (
    <group>
      <Floor center={[cx, (minZ + maxZ) / 2]} size={[maxX - minX + 8, maxZ - minZ + 4]} color="#0a0a12" />

      {/* Plaza outer walls (near side + the two side walls, which run the full
          combined plaza+tower depth to match the actual collider extent) */}
      <WallSegment x={cx} z={minZ} lengthX={maxX - minX} color="#101018" accentStrip={false} />
      <WallSegment x={minX} z={-45} lengthZ={30} color="#101018" />
      <WallSegment x={maxX} z={-45} lengthZ={30} color="#101018" />

      {/* Tower face, with the entrance gap */}
      <WallSegment x={(minX + ENTRANCE_GAP.minX) / 2} z={TOWER_FACE_Z} lengthX={ENTRANCE_GAP.minX - minX} color="#12121e" />
      <WallSegment x={(ENTRANCE_GAP.maxX + maxX) / 2} z={TOWER_FACE_Z} lengthX={maxX - ENTRANCE_GAP.maxX} color="#12121e" />

      <TowerBuilding />

      <Door
        id="entrance"
        position={[0, 0, TOWER_FACE_Z]}
        openAngle={Math.PI / 2}
        label="ENTER THE TOWER"
        width={ENTRANCE_GAP.maxX - ENTRANCE_GAP.minX}
        height={3.4}
      />

      <Portal
        id="portal-to-hub"
        position={[PLAZA_RETURN_PORTAL_POSITION.x, 1, PLAZA_RETURN_PORTAL_POSITION.z]}
        target={SPAWN_POSITION}
        label="RETURN TO THE HUB"
        colorA="#a685ff"
        colorB="#6ea8ff"
      />
    </group>
  )
}
