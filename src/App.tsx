import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence } from 'framer-motion'
import { World } from '@/components/3d/World'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { IntroOverlay } from '@/components/ui/IntroOverlay'
import { HUD } from '@/components/ui/HUD'
import { MobileControls } from '@/components/ui/MobileControls'
import { AboutPanel } from '@/components/ui/AboutPanel'
import { ProjectPanel } from '@/components/ui/ProjectPanel'
import { ProjectsListPanel } from '@/components/ui/ProjectsListPanel'
import { ContactPanel } from '@/components/ui/ContactPanel'
import { GithubPanel } from '@/components/ui/GithubPanel'
import { SettingsPanel } from '@/components/ui/SettingsPanel'
import { AIPanel } from '@/components/ui/AIPanel'
import { Toast } from '@/components/ui/Toast'
import { WarpFlash } from '@/components/ui/WarpFlash'
import { FallbackPortfolio } from '@/components/FallbackPortfolio'
import { useResponsive } from '@/hooks/useResponsive'
import { usePlayerControls } from '@/hooks/usePlayerControls'
import { useGameStore } from '@/store/gameStore'
import { audioManager } from '@/lib/audio'
import { isWebGLAvailable } from '@/lib/webgl'

function Experience() {
  useResponsive()
  usePlayerControls()

  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const phase = useGameStore((s) => s.phase)

  useEffect(() => {
    audioManager.setEnabled(soundEnabled)
    audioManager.setAmbient(soundEnabled && phase === 'playing')
  }, [soundEnabled, phase])

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 68, near: 0.1, far: 320 }}
      >
        <World />
      </Canvas>

      <AnimatePresence>{phase === 'loading' && <LoadingScreen key="loading" />}</AnimatePresence>
      <AnimatePresence>{phase === 'intro' && <IntroOverlay key="intro" />}</AnimatePresence>

      <HUD />
      <MobileControls />
      <Toast />
      <WarpFlash />

      <AboutPanel />
      <ProjectsListPanel />
      <ProjectPanel />
      <ContactPanel />
      <GithubPanel />
      <SettingsPanel />
      <AIPanel />
    </div>
  )
}

export default function App() {
  const [webglOk, setWebglOk] = useState<boolean | null>(null)

  useEffect(() => {
    setWebglOk(isWebGLAvailable())
  }, [])

  if (webglOk === null) return null
  if (!webglOk) return <FallbackPortfolio />

  return <Experience />
}
