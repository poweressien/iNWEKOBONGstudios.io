import { useEffect, useRef } from 'react'
import { Game, setGame } from '@/game/engine'
import { useGame } from '@/store/gameStore'

export function GameCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const game = new Game(canvas)
    setGame(game)
    game.start()
    if (import.meta.env.DEV) {
      const w = window as unknown as { __game: Game; __store: typeof useGame }
      w.__game = game
      w.__store = useGame
    }
    return () => {
      game.destroy()
      setGame(null)
    }
  }, [])

  // Decide touch vs mouse from what the visitor actually uses.
  useEffect(() => {
    const { setTouch } = useGame.getState()
    setTouch(window.matchMedia?.('(pointer: coarse)').matches ?? false)
    const onTouch = () => setTouch(true)
    const onKey = (e: KeyboardEvent) => {
      if (/^(Key[WASD]|Arrow)/.test(e.code)) setTouch(false)
    }
    window.addEventListener('touchstart', onTouch, { passive: true, once: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-label="Interactive portfolio game world" role="img" />
}
