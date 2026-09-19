import { useMemo } from 'react'
import { Text, RoundedBox } from '@react-three/drei'
import { Floor, WallSegment, SolidBox } from './Primitives'
import { Computer } from './Computer'
import { InteractiveObject } from './InteractiveObject'
import { AIHologram } from './AIHologram'
import { createCodeScreenTexture } from '@/lib/canvasTextures'
import { INTERIOR_BOUNDS, RAMP } from '@/data/worldColliders'
import { useGameStore } from '@/store/gameStore'

const DESK_Y = 0.75
const DZ = -51 // translation applied to every hand-placed coordinate below, relative to the original office layout

function SmallScreen({ x }: { x: number }) {
  const tex = useMemo(() => createCodeScreenTexture('#a685ff'), [])
  return (
    <group position={[x, DESK_Y, -8.35 + DZ]}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.4, 0.28, 0.03]} />
        <meshStandardMaterial color="#101018" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.2, 0.017]}>
        <planeGeometry args={[0.35, 0.23]} />
        <meshStandardMaterial map={tex} emissive="#a685ff" emissiveIntensity={0.3} emissiveMap={tex} toneMapped={false} />
      </mesh>
    </group>
  )
}

function MainMonitor({ x }: { x: number }) {
  const tex = useMemo(() => createCodeScreenTexture('#6ea8ff'), [])
  return (
    <group position={[x, DESK_Y, -8.3 + DZ]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.9, 0.6, 0.035]} />
        <meshStandardMaterial color="#101018" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.42, 0.02]}>
        <planeGeometry args={[0.82, 0.52]} />
        <meshStandardMaterial map={tex} emissive="#6ea8ff" emissiveIntensity={0.35} emissiveMap={tex} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.1, 0.15, 0.1]} />
        <meshStandardMaterial color="#101018" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.015, 0.45]}>
        <boxGeometry args={[0.55, 0.03, 0.2]} />
        <meshStandardMaterial color="#181822" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0.42, 0.012, 0.5]}>
        <boxGeometry args={[0.1, 0.025, 0.16]} />
        <meshStandardMaterial color="#181822" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  )
}

function DeskLamp({ x }: { x: number }) {
  return (
    <group position={[x, DESK_Y, -8.5 + DZ]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.03, 16]} />
        <meshStandardMaterial color="#2a2a38" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
        <meshStandardMaterial color="#2a2a38" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.08, 0.42, 0.06]} rotation={[0.5, 0, 0.3]}>
        <coneGeometry args={[0.09, 0.16, 16, 1, true]} />
        <meshStandardMaterial color="#1c1c2a" metalness={0.5} roughness={0.4} side={2} />
      </mesh>
      <pointLight position={[0.1, 0.36, 0.1]} intensity={0.7} color="#ffb15e" distance={2.5} decay={2} />
    </group>
  )
}

function Bookshelf() {
  const shelfColors = ['#6ea8ff', '#a685ff', '#5ee6b0', '#ffb15e', '#e6a4ff', '#9aa0ae', '#ff6e8c']
  const books = useMemo(() => {
    const rows: { y: number }[] = [{ y: 0.6 }, { y: 1.2 }, { y: 1.8 }]
    return rows.flatMap((row, rowIdx) => {
      let x = -0.28
      const out: { x: number; y: number; w: number; h: number; color: string }[] = []
      for (let i = 0; i < 8; i++) {
        const w = 0.045 + Math.random() * 0.035
        const h = 0.32 + Math.random() * 0.18
        out.push({ x, y: row.y - 0.32 + h / 2, w, h, color: shelfColors[(i + rowIdx * 3) % shelfColors.length] })
        x += w + 0.015
      }
      return out
    })
  }, [])

  return (
    <group position={[-8.5, 0, -4 + DZ]}>
      <SolidBox position={[0, 1, 0]} size={[0.5, 2, 1.2]} color="#181822" />
      {[0.62, 1.22, 1.82].map((y) => (
        <mesh key={y} position={[0.02, y, 0]}>
          <boxGeometry args={[0.44, 0.03, 1.1]} />
          <meshStandardMaterial color="#0d0d16" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
      {books.map((b, i) => (
        <mesh key={i} position={[0.05, b.y, b.x]} castShadow>
          <boxGeometry args={[0.28, b.h, b.w]} />
          <meshStandardMaterial color={b.color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Plant({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.4, 12]} />
        <meshStandardMaterial color="#2a2420" roughness={0.9} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[Math.sin(i) * 0.12, 0.65 + i * 0.08, Math.cos(i) * 0.12]}
          rotation={[Math.random() * 0.5, i, Math.random() * 0.3]}
          castShadow
        >
          <coneGeometry args={[0.22, 0.55, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#2f6b45' : '#357a4d'} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function CommsTerminal({ x, z }: { x: number; z: number }) {
  const openPanel = useGameStore((s) => s.openPanel)
  const tex = useMemo(() => createCodeScreenTexture('#5ee6b0'), [])
  return (
    <InteractiveObject id="comms-terminal" label="OPEN CONTACT" position={[x, 0, z]} radius={2.2} onInteract={() => openPanel('contact')}>
      <RoundedBox args={[1.1, 0.75, 0.65]} radius={0.03} position={[0, 0.375, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#141420" metalness={0.35} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 1.1, -0.18]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.03]} />
        <meshStandardMaterial color="#101018" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.1, -0.16]} rotation={[-0.12, 0, 0]}>
        <planeGeometry args={[0.73, 0.43]} />
        <meshStandardMaterial map={tex} emissive="#5ee6b0" emissiveIntensity={0.4} emissiveMap={tex} toneMapped={false} />
      </mesh>
    </InteractiveObject>
  )
}

function Stairs() {
  const steps = 11
  const railTopZ = RAMP.topZ
  const railBottomZ = 1.5 + DZ // matches the shortened guard-rail collider — below this, the ramp is low enough to need no railing
  const railX = RAMP.minX - 0.15

  return (
    <group>
      {Array.from({ length: steps }).map((_, i) => {
        const t = i / (steps - 1)
        const z = RAMP.bottomZ - t * (RAMP.bottomZ - RAMP.topZ)
        const y = t * 3.4
        return (
          <mesh key={i} position={[(RAMP.minX + RAMP.maxX) / 2, y - 0.15, z]} receiveShadow castShadow>
            <boxGeometry args={[RAMP.maxX - RAMP.minX - 0.35, 0.3, (RAMP.bottomZ - RAMP.topZ) / steps + 0.05]} />
            <meshStandardMaterial color="#15151f" metalness={0.2} roughness={0.75} />
          </mesh>
        )
      })}

      {Array.from({ length: 8 }).map((_, i) => {
        const t = i / 7
        const z = railBottomZ - t * (railBottomZ - railTopZ)
        const heightT = (RAMP.bottomZ - z) / (RAMP.bottomZ - RAMP.topZ)
        const y = heightT * 3.4
        return (
          <mesh key={i} position={[railX, y + 0.5, z]}>
            <boxGeometry args={[0.03, 1, 0.03]} />
            <meshStandardMaterial color="#2a2a38" metalness={0.6} roughness={0.3} />
          </mesh>
        )
      })}
      {(() => {
        const heightAt = (z: number) => ((RAMP.bottomZ - z) / (RAMP.bottomZ - RAMP.topZ)) * 3.4
        const yTop = heightAt(railTopZ) + 1
        const yBottom = heightAt(railBottomZ) + 1
        const dz = railTopZ - railBottomZ
        const dy = yTop - yBottom
        const barLength = Math.hypot(dy, dz)
        const barAngle = Math.atan2(-dy, dz)
        return (
          <mesh position={[railX, (yTop + yBottom) / 2, (railTopZ + railBottomZ) / 2]} rotation={[barAngle, 0, 0]}>
            <boxGeometry args={[0.03, 0.03, barLength]} />
            <meshStandardMaterial color="#2a2a38" metalness={0.6} roughness={0.3} />
          </mesh>
        )
      })()}

      <group position={[(RAMP.minX + RAMP.maxX) / 2, 0.01, 1.7 + DZ]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.55, 32]} />
          <meshStandardMaterial color="#0a0a12" emissive="#6ea8ff" emissiveIntensity={0.35} toneMapped={false} />
        </mesh>
        <Text position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.14} color="#e8f0ff" anchorX="center" anchorY="middle" letterSpacing={0.06}>
          PROJECTS ↑
        </Text>
      </group>
    </group>
  )
}

export function TowerInterior() {
  const { minX, maxX, minZ, maxZ } = INTERIOR_BOUNDS
  return (
    <group>
      <Floor center={[0, (minZ + maxZ) / 2]} size={[maxX - minX + 0.3, maxZ - minZ + 0.3]} color="#0c0c14" />

      {/* Solid outer walls — the only opening is the shared entrance wall, rendered by TowerExterior */}
      <WallSegment x={0} z={minZ} lengthX={maxX - minX} />
      <WallSegment x={minX} z={(minZ + maxZ) / 2} lengthZ={maxZ - minZ} />
      <WallSegment x={maxX} z={(minZ + maxZ) / 2} lengthZ={maxZ - minZ} />

      {/* Desk surface */}
      <SolidBox position={[-4.5, DESK_Y - 0.02, -8.05 + DZ]} size={[7.4, 0.06, 1.0]} color="#1a1a24" metalness={0.3} roughness={0.5} />
      <SolidBox position={[-8, 0.375, -8.35 + DZ]} size={[0.08, 0.75, 0.08]} color="#101018" />
      <SolidBox position={[-1, 0.375, -8.35 + DZ]} size={[0.08, 0.75, 0.08]} color="#101018" />

      <SmallScreen x={-7.7} />
      <MainMonitor x={-6.0} />
      <SmallScreen x={-4.2} />
      <DeskLamp x={-2.6} />
      <Computer position={[-1.2, DESK_Y, -8.1 + DZ]} />

      {/* Chair, facing the desk */}
      <group position={[-6, 0, -6.5 + DZ]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.5, 0.08, 0.5]} />
          <meshStandardMaterial color="#1c1c2a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.85, -0.22]} castShadow>
          <boxGeometry args={[0.5, 0.7, 0.08]} />
          <meshStandardMaterial color="#1c1c2a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.44, 8]} />
          <meshStandardMaterial color="#2a2a38" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      <Bookshelf />
      <Plant x={-8} z={3.6 + DZ} />
      <Plant x={7.8} z={-6.2 + DZ} />

      <CommsTerminal x={5.5} z={-4 + DZ} />
      <AIHologram position={[-3, 1.9, -6 + DZ]} />

      <Stairs />
    </group>
  )
}
