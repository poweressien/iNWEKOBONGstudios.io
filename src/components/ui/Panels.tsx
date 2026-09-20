import { lazy, Suspense, useEffect } from 'react'
import { useGame } from '@/store/gameStore'

const About = lazy(() => import('./panels/AboutPanel'))
const Projects = lazy(() => import('./panels/ProjectsPanel'))
const Project = lazy(() => import('./panels/ProjectPanel'))
const Contact = lazy(() => import('./panels/ContactPanel'))
const Github = lazy(() => import('./panels/GithubPanel'))
const Chat = lazy(() => import('./panels/ChatPanel'))
const MapPanel = lazy(() => import('./panels/MapPanel'))
const Menu = lazy(() => import('./panels/MenuPanel'))

/** Warm the panel chunks while the visitor is still on the title screen. */
function prefetch() {
  void import('./panels/AboutPanel')
  void import('./panels/ProjectsPanel')
  void import('./panels/ProjectPanel')
  void import('./panels/ContactPanel')
  void import('./panels/ChatPanel')
  void import('./panels/MapPanel')
  void import('./panels/MenuPanel')
  void import('./panels/GithubPanel')
}

export function Panels() {
  const panel = useGame((s) => s.panel)

  useEffect(() => {
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback
    if (idle) idle(prefetch)
    else setTimeout(prefetch, 1500)
  }, [])

  return (
    <Suspense fallback={null}>
      {panel === 'about' && <About />}
      {panel === 'projects' && <Projects />}
      {panel === 'project' && <Project />}
      {panel === 'contact' && <Contact />}
      {panel === 'github' && <Github />}
      {panel === 'chat' && <Chat />}
      {panel === 'map' && <MapPanel />}
      {panel === 'menu' && <Menu />}
    </Suspense>
  )
}
