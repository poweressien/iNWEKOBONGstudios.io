import { useMemo } from 'react'
import { Html, Text, RoundedBox } from '@react-three/drei'
import { Floor, WallSegment } from './Primitives'
import { InteractiveObject } from './InteractiveObject'
import { CONTACT_BOUNDS } from '@/data/worldColliders'
import { portfolio } from '@/data/portfolio'
import { useGameStore } from '@/store/gameStore'
import { createCodeScreenTexture } from '@/lib/canvasTextures'

function Laptop({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.75, z]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.4, 0.02, 0.28]} />
        <meshStandardMaterial color="#181822" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.14, -0.13]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.4, 0.28, 0.015]} />
        <meshStandardMaterial color="#101018" emissive="#6ea8ff" emissiveIntensity={0.4} metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Phone({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.755, z]} rotation={[-Math.PI / 2, 0, 0.3]} castShadow>
      <boxGeometry args={[0.08, 0.16, 0.01]} />
      <meshStandardMaterial color="#0d0d14" emissive="#5ee6b0" emissiveIntensity={0.5} metalness={0.6} roughness={0.3} />
    </mesh>
  )
}

export function ContactRoom() {
  const openPanel = useGameStore((s) => s.openPanel)
  const screenTex = useMemo(() => createCodeScreenTexture('#6ea8ff'), [])
  const centerX = (CONTACT_BOUNDS.minX + CONTACT_BOUNDS.maxX) / 2

  const links = [
    { label: 'Email', value: portfolio.email, href: `mailto:${portfolio.email}` },
    { label: 'GitHub', value: `@${portfolio.githubUsername}`, href: portfolio.githubUrl },
    portfolio.linkedinUrl ? { label: 'LinkedIn', value: 'Profile', href: portfolio.linkedinUrl } : null,
    portfolio.whatsappNumber ? { label: 'WhatsApp', value: portfolio.whatsappNumber, href: `https://wa.me/${portfolio.whatsappNumber.replace(/\D/g, '')}` } : null,
  ].filter(Boolean) as { label: string; value: string; href: string }[]

  return (
    <group>
      <Floor center={[centerX, (CONTACT_BOUNDS.minZ + CONTACT_BOUNDS.maxZ) / 2]} size={[12.6, 10.6]} color="#0b0d14" />

      <WallSegment x={CONTACT_BOUNDS.maxX} z={(CONTACT_BOUNDS.minZ + CONTACT_BOUNDS.maxZ) / 2} lengthZ={CONTACT_BOUNDS.maxZ - CONTACT_BOUNDS.minZ + 0.6} color="#0f1420" />
      <WallSegment x={centerX} z={CONTACT_BOUNDS.minZ} lengthX={CONTACT_BOUNDS.maxX - CONTACT_BOUNDS.minX + 0.6} color="#0f1420" accentStrip={false} />
      <WallSegment x={centerX} z={CONTACT_BOUNDS.maxZ} lengthX={CONTACT_BOUNDS.maxX - CONTACT_BOUNDS.minX + 0.6} color="#0f1420" accentStrip={false} />

      {/* Communication terminal — the interactive prop that opens the form */}
      <InteractiveObject id="contact-terminal" label="OPEN CONTACT" position={[11, 0, -1]} radius={2.2} onInteract={() => openPanel('contact')}>
        <RoundedBox args={[1.2, 0.75, 0.7]} radius={0.03} position={[0, 0.375, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#141420" metalness={0.35} roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 1.15, -0.2]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.85, 0.55, 0.03]} />
          <meshStandardMaterial color="#101018" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.15, -0.18]} rotation={[-0.1, 0, 0]}>
          <planeGeometry args={[0.78, 0.48]} />
          <meshStandardMaterial map={screenTex} emissive="#6ea8ff" emissiveIntensity={0.4} emissiveMap={screenTex} toneMapped={false} />
        </mesh>
        <Laptop x={-0.9} z={0} />
        <Phone x={0.75} z={0.25} />
      </InteractiveObject>

      {/* Floating contact hologram, deeper in the room */}
      <group position={[17, 1.6, -1]}>
        <Html center distanceFactor={7} occlude={false} transform>
          <div className="w-[380px] rounded-2xl border border-white/10 bg-[#0d0d18]/70 backdrop-blur-md p-6 text-white shadow-[0_0_60px_rgba(110,168,255,0.15)]">
            <div className="font-display text-xl font-semibold text-glow-accent">Let's talk</div>
            <p className="mt-2 text-[13px] text-white/70">Reach out through any of these — or step up to the terminal to send a message directly.</p>
            <div className="mt-4 space-y-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[13px] transition hover:border-[#6ea8ff]/50 hover:bg-white/10"
                >
                  <span className="text-white/60">{link.label}</span>
                  <span className="font-mono text-[#6ea8ff]">{link.value}</span>
                </a>
              ))}
            </div>
          </div>
        </Html>
      </group>

      <Text position={[centerX, 3.6, CONTACT_BOUNDS.minZ + 0.05]} fontSize={0.24} color="#6ea8ff" anchorX="center" letterSpacing={0.12}>
        CONTACT
      </Text>
    </group>
  )
}
