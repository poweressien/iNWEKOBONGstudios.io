export type Vec3 = [number, number, number]

export type GamePhase = 'loading' | 'intro' | 'playing'

export type PanelType =
  | 'about'
  | 'projects-list'
  | 'project'
  | 'contact'
  | 'github'
  | 'settings'
  | 'accessibility'
  | 'ai'
  | null

export type Level = 'ground' | 'loft'

export interface Skill {
  name: string
  color: string
}

export interface ExperienceEntry {
  title: string
  org: string
  period: string
  description: string
}

export interface PlanetInfo {
  name: string
  tagline: string
  blurb: string
  color: string
}

export interface FunnyButton {
  label: string
  response: string
}

export interface AIAssistantConfig {
  name: string
  tagline: string
  lines: string[]
}

export interface PortfolioConfig {
  name: string
  role: string
  tagline: string
  location: string
  bio: string
  studio: string
  education: string
  experience: ExperienceEntry[]
  interests: string[]
  skills: Skill[]
  email: string
  githubUsername: string
  githubUrl: string
  linkedinUrl: string
  whatsappNumber: string
  /** Leave empty to fall back to a mailto: draft instead of a real network request. */
  contactFormEndpoint: string
  /** Where the floating PC in the Space Hub sends visitors. */
  externalSiteUrl: string
  planetPoweressien: PlanetInfo
  planetInwekobong: PlanetInfo
  aiAssistant: AIAssistantConfig
  funnyButtons: FunnyButton[]
}

export interface ProjectData {
  id: string
  title: string
  description: string
  tech: string[]
  /** Leave undefined rather than guessing — only set this once you have the real URL. */
  githubUrl?: string
  liveUrl?: string
  accent: string
}

export interface BoxCollider {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export interface InteractableEntry {
  id: string
  label: string
  /** World-space position, read live each frame (a ref-backed getter). */
  getPosition: () => Vec3
  radius: number
  onInteract: () => void
}
