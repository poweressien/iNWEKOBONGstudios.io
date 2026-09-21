import { useEffect, useRef } from 'react'
import { mulberry32, rgba } from '@/scene/sprites'

const seedOf = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

interface Node {
  x: number
  y: number
  r: number
  ph: number
  big: boolean
}

/** A generative emblem, unique to each project: a small constellation seeded from its id. */
export function ProjectMark({ id, accent, width, height, animate = false }: { id: string; accent: string; width: number; height: number; animate?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = width * dpr
    c.height = height * dpr
    const ctx = c.getContext('2d')
    if (!ctx) return
    const rnd = mulberry32(seedOf(id))
    const n = width > 100 ? 22 : 11
    const nodes: Node[] = []
    for (let i = 0; i < n; i++) nodes.push({ x: 0.08 + rnd() * 0.84, y: 0.12 + rnd() * 0.76, r: 1 + rnd() * 1.6, ph: rnd() * 6.28, big: rnd() < 0.18 })
    const edges: [number, number][] = []
    nodes.forEach((a, i) => {
      const near = nodes
        .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
        .filter((o) => o.j !== i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2)
      near.forEach((o) => {
        if (!edges.some(([p, q]) => (p === i && q === o.j) || (p === o.j && q === i))) edges.push([i, o.j])
      })
    })

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      const bg = ctx.createLinearGradient(0, 0, width, height)
      bg.addColorStop(0, 'rgba(255,255,255,0.04)')
      bg.addColorStop(1, rgba(accent, 0.07))
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, width, height)
      const pos = nodes.map((nd) => ({ x: (nd.x + Math.sin(t * 0.4 + nd.ph) * 0.012) * width, y: (nd.y + Math.cos(t * 0.33 + nd.ph) * 0.02) * height }))
      ctx.lineWidth = 1
      ctx.strokeStyle = rgba(accent, 0.34)
      ctx.beginPath()
      edges.forEach(([a, b]) => {
        ctx.moveTo(pos[a].x, pos[a].y)
        ctx.lineTo(pos[b].x, pos[b].y)
      })
      ctx.stroke()
      nodes.forEach((nd, i) => {
        ctx.fillStyle = 'rgba(240,245,255,0.92)'
        ctx.beginPath()
        ctx.arc(pos[i].x, pos[i].y, nd.r * (width > 100 ? 1 : 0.8), 0, 6.283)
        ctx.fill()
        if (nd.big) {
          ctx.strokeStyle = rgba(accent, 0.7)
          ctx.beginPath()
          ctx.arc(pos[i].x, pos[i].y, 5 + Math.sin(t * 1.2 + nd.ph) * 1.2, 0, 6.283)
          ctx.stroke()
        }
      })
    }

    draw(0)
    if (!animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const t0 = performance.now()
    const loop = (now: number) => {
      draw((now - t0) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [id, accent, width, height, animate])

  return <canvas ref={ref} style={{ width: '100%', maxWidth: width, aspectRatio: `${width} / ${height}` }} className="rounded-xl border border-white/10" aria-hidden="true" />
}
