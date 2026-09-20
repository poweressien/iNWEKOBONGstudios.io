import { useEffect } from 'react'
import { SceneCanvas } from '@/components/SceneCanvas'
import { Hud } from '@/components/ui/TopBar'
import { Dock } from '@/components/ui/Dock'
import { Intro } from '@/components/ui/Intro'
import { Panels } from '@/components/ui/Panels'
import { useApp } from '@/store/appStore'

export default function App() {
  const reduced = useApp((s) => s.reducedMotion)
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduced)
  }, [reduced])

  return (
    <div className="fixed inset-0 overflow-hidden bg-void">
      <SceneCanvas />
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(2,3,8,0.6) 100%)' }} />
      <Intro />
      <Hud />
      <Dock />
      <Panels />
    </div>
  )
}
