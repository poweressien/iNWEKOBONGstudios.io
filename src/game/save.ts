export interface SaveData {
  xp: number
  orbs: string[]
  visited: string[]
  seenProjects: string[]
  trophies: string[]
  counters: Record<string, number>
  sound: boolean
  quality: 'auto' | 'high' | 'low'
  reducedMotion: boolean
}

const KEY = 'inwekobong-save-v2'

export const defaultSave = (): SaveData => ({
  xp: 0,
  orbs: [],
  visited: [],
  seenProjects: [],
  trophies: [],
  counters: {},
  sound: true,
  quality: 'auto',
  reducedMotion: false,
})

export function loadSave(): SaveData {
  const base = defaultSave()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<SaveData>
    return { ...base, ...parsed, counters: { ...base.counters, ...(parsed.counters ?? {}) } }
  } catch {
    return base
  }
}

let timer: ReturnType<typeof setTimeout> | null = null

export function writeSave(data: SaveData) {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* private mode / storage full — progress just won't persist */
    }
  }, 250)
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
