import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FloatingParticles } from './Primitives'
import { useGameStore } from '@/store/gameStore'

/** A big canvas-painted nebula gradient on the inside of a giant sphere — cheap, no external texture files. */
function createNebulaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#05030a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const blobs: { x: number; y: number; r: number; color: string; alpha: number }[] = [
    { x: 220, y: 160, r: 260, color: '#4a2f8f', alpha: 0.55 },
    { x: 760, y: 130, r: 300, color: '#2f5f9f', alpha: 0.45 },
    { x: 520, y: 340, r: 260, color: '#8f3f7f', alpha: 0.4 },
    { x: 900, y: 380, r: 200, color: '#3f2f6f', alpha: 0.45 },
    { x: 80, y: 400, r: 220, color: '#2f4f8f', alpha: 0.35 },
  ]
  for (const b of blobs) {
    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
    grad.addColorStop(0, b.color)
    grad.addColorStop(1, 'transparent')
    ctx.globalAlpha = b.alpha
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.globalAlpha = 1

  // scattered faint stars baked right into the sky texture too
  for (let i = 0; i < 700; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const s = Math.random() * 1.4
    ctx.globalAlpha = 0.3 + Math.random() * 0.6
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x, y, s, s)
  }
  ctx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  return tex
}

function NebulaSky({ center }: { center: [number, number, number] }) {
  const tex = useMemo(() => createNebulaTexture(), [])
  return (
    <mesh position={center}>
      <sphereGeometry args={[220, 24, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} toneMapped={false} />
    </mesh>
  )
}

/** Distant, twinkling starfield — a shell of bright points around the whole world. */
function Starfield({ count, center }: { count: number; center: [number, number, number] }) {
  const ref = useRef<THREE.Points>(null)
  const reducedMotion = useGameStore((s) => s.reducedMotion)

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // distribute on a big sphere shell so stars always read as "far away"
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 90 + Math.random() * 90
      positions[i * 3 + 0] = center[0] + r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = Math.abs(center[1] + r * Math.cos(phi)) * 0.6 + 4 // keep stars mostly overhead
      positions[i * 3 + 2] = center[2] + r * Math.sin(phi) * Math.sin(theta)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return
    const mat = ref.current.material as THREE.PointsMaterial
    mat.opacity = 0.65 + Math.sin(clock.elapsedTime * 0.6) * 0.15
  })

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial color="#e8f0ff" size={0.55} transparent opacity={0.75} sizeAttenuation depthWrite={false} fog={false} />
    </points>
  )
}

export function Environment() {
  const isMobile = useGameStore((s) => s.isMobile)
  const particleCount = isMobile ? 40 : 120

  return (
    <>
      <color attach="background" args={['#05030a']} />
      <fog attach="fog" args={['#05030a', 24, 140]} />

      <NebulaSky center={[0, 10, -20]} />
      <Starfield count={isMobile ? 500 : 1400} center={[0, 10, -20]} />

      {/* Space Hub dust */}
      <FloatingParticles count={particleCount} bounds={[26, 6, 20]} center={[0, 1, -3]} colorHex="#a685ff" />
      {/* Tower plaza + interior dust */}
      <FloatingParticles count={Math.round(particleCount * 0.7)} bounds={[18, 5, 14]} center={[0, 1, -38]} colorHex="#6ea8ff" />
      <FloatingParticles count={Math.round(particleCount * 0.5)} bounds={[10, 4, 10]} center={[5, 3.4, -55]} colorHex="#5ee6b0" />
    </>
  )
}
