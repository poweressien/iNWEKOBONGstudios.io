import type { Scene } from './scene'

let current: Scene | null = null
export const setScene = (s: Scene | null) => {
  current = s
}
export const getScene = () => current
