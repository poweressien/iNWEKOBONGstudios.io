import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'

function detectMobile(): boolean {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const narrow = window.innerWidth < 900
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false
  return hasTouch && (narrow || coarsePointer)
}

export function useResponsive() {
  const setIsMobile = useGameStore((s) => s.setIsMobile)

  useEffect(() => {
    setIsMobile(detectMobile())
    const onResize = () => setIsMobile(detectMobile())
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [setIsMobile])
}
