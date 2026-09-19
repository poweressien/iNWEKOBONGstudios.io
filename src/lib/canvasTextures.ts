import * as THREE from 'three'

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')
  return { canvas, ctx }
}

/** A believable "code editor" screen for desk monitors — pure procedural drawing. */
export function createCodeScreenTexture(accent = '#6ea8ff'): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 320)
  ctx.fillStyle = '#0a0a14'
  ctx.fillRect(0, 0, 512, 320)

  // gutter
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.fillRect(0, 0, 36, 320)

  const colors = ['#6ea8ff', '#a685ff', '#5ee6b0', '#ffb15e', '#e6a4ff', '#9aa0ae']
  let y = 18
  let indent = 0
  const rand = (seed: number) => {
    const v = Math.sin(seed * 999) * 10000
    return v - Math.floor(v)
  }
  for (let line = 0; line < 22; line++) {
    const r = rand(line + 1)
    if (r > 0.85) indent = Math.min(indent + 1, 3)
    else if (r < 0.15) indent = Math.max(indent - 1, 0)

    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.font = '10px monospace'
    ctx.fillText(String(line + 1).padStart(2, '0'), 8, y)

    let x = 48 + indent * 14
    const segments = 2 + Math.floor(rand(line + 50) * 3)
    for (let s = 0; s < segments; s++) {
      const width = 20 + rand(line * 10 + s) * 60
      ctx.fillStyle = colors[Math.floor(rand(line * 3 + s) * colors.length)]
      ctx.globalAlpha = 0.75
      ctx.fillRect(x, y - 8, width, 6)
      x += width + 8
    }
    ctx.globalAlpha = 1
    y += 13
  }

  // soft accent glow at top
  const grad = ctx.createLinearGradient(0, 0, 0, 60)
  grad.addColorStop(0, accent + '33')
  grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 60)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** A stylized placeholder "screenshot" for a project station — title + accent gradient. */
export function createProjectPreviewTexture(title: string, accent: string): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 320)

  const grad = ctx.createLinearGradient(0, 0, 512, 320)
  grad.addColorStop(0, '#0a0a14')
  grad.addColorStop(1, accent + '22')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 320)

  ctx.strokeStyle = accent + '55'
  ctx.lineWidth = 2
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.arc(420, 90, 30 + i * 22, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = '600 30px "Space Grotesk", sans-serif'
  wrapText(ctx, title, 28, 250, 300, 34)

  ctx.fillStyle = accent
  ctx.fillRect(28, 264, 60, 4)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ')
  let line = ''
  let curY = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY)
      line = word
      curY += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line, x, curY)
}

/** A GitHub-ish avatar placeholder: initials over a generated gradient. */
export function createAvatarTexture(name: string): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 256)
  const grad = ctx.createLinearGradient(0, 0, 256, 256)
  grad.addColorStop(0, '#6ea8ff')
  grad.addColorStop(1, '#a685ff')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = '700 96px "Space Grotesk", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(name.slice(0, 2).toUpperCase(), 128, 138)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
