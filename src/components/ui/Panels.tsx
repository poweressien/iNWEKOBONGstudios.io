import { lazy, Suspense, useEffect } from 'react'
import { useApp } from '@/store/appStore'
import { ambience } from '@/lib/audio'

const Studio = lazy(() => import('./panels/StudioPanel'))
const Work = lazy(() => import('./panels/WorkPanel'))
const Project = lazy(() => import('./panels/ProjectPanel'))
const Stack = lazy(() => import('./panels/StackPanel'))
const Labs = lazy(() => import('./panels/LabsPanel'))
const Signal = lazy(() => import('./panels/SignalPanel'))
const Concierge = lazy(() => import('./panels/ConciergePanel'))

function prefetch() {
  void import('./panels/StudioPanel')
  void import('./panels/WorkPanel')
  void import('./panels/ProjectPanel')
  void import('./panels/StackPanel')
  void import('./panels/SignalPanel')
  void import('./panels/ConciergePanel')
  void import('./panels/LabsPanel')
}

export function Panels() {
  const panel = useApp((s) => s.panel)

  useEffect(() => {
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback
    if (idle) idle(prefetch)
    else setTimeout(prefetch, 1500)
  }, [])
  useEffect(() => {
    if (panel) ambience.tick()
  }, [panel])

  return (
    <Suspense fallback={null}>
      {panel === 'studio' && <Studio />}
      {panel === 'work' && <Work />}
      {panel === 'project' && <Project />}
      {panel === 'stack' && <Stack />}
      {panel === 'labs' && <Labs />}
      {panel === 'signal' && <Signal />}
      {panel === 'concierge' && <Concierge />}
    </Suspense>
  )
}
