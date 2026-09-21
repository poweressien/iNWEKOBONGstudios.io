import { useEffect, useRef } from 'react'
import { Scene } from '@/scene/scene'
import { useApp } from '@/store/appStore'
import { setScene } from '@/scene/registry'

export function SceneCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const scene = new Scene(canvas)
    setScene(scene)
    scene.start()
    if (import.meta.env.DEV) {
      const w = window as unknown as { __scene: Scene; __app: typeof useApp }
      w.__scene = scene
      w.__app = useApp
    }
    return () => {
      setScene(null)
      scene.destroy()
    }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-label="Interactive 3D scene: a single tower in space. Select a level to open a section." role="img" />
}
