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

export interface PadInfo {
  label: string
  response: string
  color: string
}

export interface AIConfig {
  name: string
  tagline: string
  lines: string[]
}

export interface PortfolioConfig {
  name: string
  role: string
  headline: string
  tagline: string
  location: string
  bio: string
  studio: string
  education: string
  experience: ExperienceEntry[]
  interests: string[]
  skills: Skill[]
  /** Leave as the placeholder (or empty) and the site simply hides the email button. */
  email: string
  githubUsername: string
  githubUrl: string
  linkedinUrl: string
  /** Digits only, with country code — e.g. 2348012345678. Blank hides the WhatsApp button. */
  whatsappNumber: string
  /** Optional Formspree-style endpoint. When blank the form opens a pre-filled email instead. */
  contactFormEndpoint: string
  /** Where the floating PC on the GitHub planet sends visitors. */
  externalSiteUrl: string
  planetGithub: PlanetInfo
  planetHome: PlanetInfo
  ai: AIConfig
  pads: PadInfo[]
}

export type ProjectTag = 'game' | 'web' | 'mobile'

export interface ProjectData {
  id: string
  title: string
  /** Short arcade-marquee name (max ~9 chars looks best). */
  short: string
  description: string
  tech: string[]
  tags: ProjectTag[]
  githubUrl?: string
  liveUrl?: string
  accent: string
}
