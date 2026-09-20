export interface Skill {
  name: string
  group: 'Backend' | 'Frontend & Mobile' | 'Graphics & Tooling'
}

export interface ExperienceEntry {
  title: string
  org: string
  period: string
  description: string
}

export interface Channel {
  id: string
  label: string
  handle: string
  url: string
}

export interface PortfolioConfig {
  name: string
  domain: string
  role: string
  headline: string
  tagline: string
  location: string
  bio: string[]
  studio: string
  education: string
  experience: ExperienceEntry[]
  focus: string[]
  skills: Skill[]
  email: string
  phone: string
  whatsappNumber: string
  githubUsername: string
  githubUrl: string
  /** Optional Formspree-style endpoint. Blank = the form opens a pre-filled email instead. */
  contactFormEndpoint: string
  channels: Channel[]
  concierge: { name: string; tagline: string }
}

export type ProjectTag = 'game' | 'web' | 'mobile'

export interface ProjectData {
  id: string
  title: string
  short: string
  description: string
  tech: string[]
  tags: ProjectTag[]
  githubUrl?: string
  liveUrl?: string
  accent: string
}
