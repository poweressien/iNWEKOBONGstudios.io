import { Html, Text } from '@react-three/drei'
import { Floor, WallSegment } from './Primitives'
import { ABOUT_BOUNDS } from '@/data/worldColliders'
import { portfolio } from '@/data/portfolio'

function SkillBadge({ x, z, name, color, index }: { x: number; z: number; name: string; color: string; index: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.19, 1.1, 12]} />
        <meshStandardMaterial color="#181822" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.25, 0]} rotation={[index * 0.6, index * 0.4, 0]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.3} metalness={0.4} />
      </mesh>
      <Text position={[0, 1.68, 0]} fontSize={0.115} color="#e8f0ff" anchorX="center" anchorY="middle" maxWidth={1.1}>
        {name}
      </Text>
    </group>
  )
}

export function AboutRoom() {
  const wallX = ABOUT_BOUNDS.minX + 0.35
  const skillSpacing = (ABOUT_BOUNDS.maxZ - ABOUT_BOUNDS.minZ - 1.2) / (portfolio.skills.length - 1)

  return (
    <group>
      <Floor center={[(ABOUT_BOUNDS.minX + ABOUT_BOUNDS.maxX) / 2, (ABOUT_BOUNDS.minZ + ABOUT_BOUNDS.maxZ) / 2]} size={[12.6, 10.6]} color="#0d0c12" />

      <WallSegment x={ABOUT_BOUNDS.minX} z={(ABOUT_BOUNDS.minZ + ABOUT_BOUNDS.maxZ) / 2} lengthZ={ABOUT_BOUNDS.maxZ - ABOUT_BOUNDS.minZ + 0.6} color="#141420" />
      <WallSegment x={(ABOUT_BOUNDS.minX + ABOUT_BOUNDS.maxX) / 2} z={ABOUT_BOUNDS.minZ} lengthX={ABOUT_BOUNDS.maxX - ABOUT_BOUNDS.minX + 0.6} color="#141420" accentStrip={false} />
      <WallSegment x={(ABOUT_BOUNDS.minX + ABOUT_BOUNDS.maxX) / 2} z={ABOUT_BOUNDS.maxZ} lengthX={ABOUT_BOUNDS.maxX - ABOUT_BOUNDS.minX + 0.6} color="#141420" accentStrip={false} />

      {/* Bio hologram, first thing you see coming through the door */}
      <group position={[-13, 1.6, -1]}>
        <Html center distanceFactor={7} occlude={false} transform>
          <div className="w-[420px] rounded-2xl border border-white/10 bg-[#0d0d18]/70 backdrop-blur-md p-6 text-white shadow-[0_0_60px_rgba(110,168,255,0.15)]">
            <div className="font-display text-2xl font-semibold text-glow-accent">{portfolio.name}</div>
            <div className="mt-1 text-sm text-[#a685ff]">{portfolio.role} · {portfolio.studio}</div>
            <p className="mt-3 text-[13px] leading-relaxed text-white/80">{portfolio.bio}</p>
          </div>
        </Html>
      </group>

      {/* Skill badges lining the back wall */}
      {portfolio.skills.map((skill, i) => (
        <SkillBadge
          key={skill.name}
          x={wallX}
          z={ABOUT_BOUNDS.minZ + 0.6 + i * skillSpacing}
          name={skill.name}
          color={skill.color}
          index={i}
        />
      ))}
      <Text
        position={[wallX + 0.02, 2.3, ABOUT_BOUNDS.minZ + 0.6]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.22}
        color="#6ea8ff"
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.1}
      >
        SKILLS
      </Text>

      {/* Experience + education timeline along the far wall */}
      <group position={[-15, 0, ABOUT_BOUNDS.maxZ - 0.5]}>
        <Text fontSize={0.22} color="#ffd9a8" position={[0, 2.3, 0]} anchorX="center" letterSpacing={0.1}>
          EXPERIENCE
        </Text>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[6, 0.02, 0.02]} />
          <meshStandardMaterial color="#ffd9a8" emissive="#ffd9a8" emissiveIntensity={1} toneMapped={false} />
        </mesh>
        {portfolio.experience.map((exp, i) => (
          <group key={exp.title} position={[-2.2 + i * 2.4, 1, 0]}>
            <mesh>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#ffd9a8" emissive="#ffd9a8" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
            <Html center distanceFactor={8} position={[0, -0.75, 0]} occlude={false}>
              <div className="w-[220px] text-center text-white/85">
                <div className="font-display text-[13px] font-semibold">{exp.title}</div>
                <div className="text-[11px] text-[#ffd9a8]">{exp.org} · {exp.period}</div>
                <div className="mt-1 text-[11px] leading-snug text-white/70">{exp.description}</div>
              </div>
            </Html>
          </group>
        ))}
        <Html center distanceFactor={8} position={[0, -2.3, 0]} occlude={false}>
          <div className="w-[420px] text-center text-white/70 text-[12px] leading-relaxed">
            <span className="text-[#ffd9a8] font-semibold">Education — </span>
            {portfolio.education}
          </div>
        </Html>
      </group>
    </group>
  )
}
