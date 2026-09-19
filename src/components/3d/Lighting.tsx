import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { PointLight } from 'three'
import { useGameStore } from '@/store/gameStore'

export function Lighting() {
  const isMobile = useGameStore((s) => s.isMobile)
  const reducedMotion = useGameStore((s) => s.reducedMotion)
  const shadows = !isMobile
  const coreRef = useRef<PointLight>(null)
  const portalRef = useRef<PointLight>(null)

  useFrame(({ clock }) => {
    if (reducedMotion) return
    if (coreRef.current) coreRef.current.intensity = 1.3 + Math.sin(clock.elapsedTime * 1.6) * 0.4
    if (portalRef.current) portalRef.current.intensity = 1.5 + Math.sin(clock.elapsedTime * 2.2) * 0.5
  })

  return (
    <>
      {/* Base fill so nothing is ever pure black — cool cosmic tone throughout */}
      <ambientLight intensity={0.2} color="#4a3f7a" />
      <directionalLight position={[10, 30, 10]} intensity={0.25} color="#8fa8ff" />

      {/* --- Space Hub: cosmic purples/blues, plus a hot spot at the portal --- */}
      <pointLight position={[-8, 3, 2]} intensity={0.7} color="#a685ff" distance={16} decay={2} />
      <pointLight position={[8, 3, 4]} intensity={0.7} color="#6ea8ff" distance={16} decay={2} />
      <pointLight position={[0, 4, -6]} intensity={0.5} color="#ff9de2" distance={14} decay={2} />
      <pointLight ref={portalRef} position={[0, 2.4, -13.5]} intensity={1.5} color="#6ea8ff" distance={9} decay={2} />

      {/* --- Tower plaza: dramatic uplight on the tower face --- */}
      <spotLight position={[0, 0.5, -34]} target-position={[0, 30, -46]} angle={0.5} penumbra={0.5} intensity={2.2} color="#6ea8ff" distance={60} castShadow={shadows} />
      <pointLight position={[0, 6, -32]} intensity={0.6} color="#a685ff" distance={20} decay={2} />

      {/* --- Tower interior: cinematic key light + warm desk-lamp counterpoint --- */}
      <pointLight position={[-3, 2.6, -57.5]} intensity={0.9} color="#ffb15e" distance={7} decay={2} />
      <pointLight position={[0, 3.6, -54]} intensity={0.6} color="#6ea8ff" distance={12} decay={2} />
      <spotLight position={[5, 4, -53]} angle={0.5} penumbra={0.6} intensity={0.7} color="#a685ff" distance={14} castShadow={shadows} />
      {/* the tower's glowing "core" — an original centerpiece, not a copy of anyone's reactor design */}
      <pointLight ref={coreRef} position={[0, 2.2, -56]} intensity={1.3} color="#5ee6b0" distance={8} decay={2} />

      {/* --- Project floor (loft): cooler, "lab" feeling --- */}
      <pointLight position={[5, 4.6, -57]} intensity={0.8} color="#6ea8ff" distance={10} decay={2} />
      <pointLight position={[5, 4.6, -53.5]} intensity={0.6} color="#a685ff" distance={9} decay={2} />
    </>
  )
}
