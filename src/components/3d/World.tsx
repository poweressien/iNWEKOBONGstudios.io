import { Suspense } from 'react'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Lighting } from './Lighting'
import { Environment } from './Environment'
import { SpaceHub } from './SpaceHub'
import { TowerExterior } from './TowerExterior'
import { TowerInterior } from './TowerInterior'
import { ProjectFloor } from './ProjectFloor'
import { Player } from './Player'
import { useGameStore } from '@/store/gameStore'

export function World() {
  const isMobile = useGameStore((s) => s.isMobile)
  const reducedMotion = useGameStore((s) => s.reducedMotion)
  const enablePostFx = !isMobile

  return (
    <>
      <Lighting />
      <Environment />

      <Suspense fallback={null}>
        <SpaceHub />
        <TowerExterior />
        <TowerInterior />
        <ProjectFloor />
      </Suspense>

      <Player />

      {enablePostFx && !reducedMotion && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.6} luminanceThreshold={0.3} luminanceSmoothing={0.25} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={0.68} />
        </EffectComposer>
      )}
    </>
  )
}
