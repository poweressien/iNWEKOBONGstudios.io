import { portfolio, hasEmail, hasWhatsApp } from '@/data/portfolio'
import { projects } from '@/data/projects'
import type { ProjectData } from '@/types'

/**
 * The concierge runs entirely in the browser — no API key, no network round-trip.
 * It matches what a visitor types against the site's own data, so its answers
 * never drift from src/data/*.
 */

export interface Reply {
  text: string
  chips: string[]
  open?: { label: string; panel: 'studio' | 'work' | 'stack' | 'labs' | 'signal' | 'project'; id?: string }
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const has = (q: string, ...words: string[]) => words.some((w) => new RegExp(`(^|\\s)${w.replace(/[.+]/g, '\\$&')}(\\s|$)`).test(q))
const hasAny = (q: string, ...frags: string[]) => frags.some((f) => q.includes(f))

const ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  node: 'node.js',
  nodejs: 'node.js',
  postgres: 'postgresql',
  three: 'three.js',
  threejs: 'three.js',
  babylon: 'babylon.js',
  rn: 'react native',
  dart: 'flutter',
  websocket: 'socket.io',
  websockets: 'socket.io',
  android: 'capacitor',
}

/** Tokens for a skill label such as "PostgreSQL / MySQL" → ["postgresql", "mysql"]. */
const skillTokens = (name: string) =>
  name
    .split('/')
    .map((p) => p.toLowerCase().replace(/\(.*?\)/g, '').trim())
    .filter((p) => p.length > 1)

const techTerms: string[] = (() => {
  const set = new Set<string>()
  projects.forEach((p) => p.tech.forEach((t) => skillTokens(t).forEach((x) => set.add(x))))
  portfolio.skills.forEach((s) => skillTokens(s.name).forEach((x) => set.add(x)))
  return [...set]
})()

const matchesTerm = (text: string, term: string) => {
  const t = text.toLowerCase()
  if (term.length < 4) return new RegExp(`(^|[^a-z0-9])${term}([^a-z0-9]|$)`).test(t)
  return t.includes(term)
}

/** Projects that use a given skill (by its display name). */
export function projectsForSkill(skill: string): ProjectData[] {
  const toks = skillTokens(skill)
  return projects.filter((p) => toks.some((tk) => p.tech.some((t) => matchesTerm(t, tk)) || matchesTerm(p.description, tk)))
}

function findTech(q: string): string[] {
  const joined = ` ${q
    .split(' ')
    .map((w) => ALIASES[w] ?? w)
    .join(' ')} `
  return techTerms.filter((t) => t.length >= 3 && (joined.includes(` ${t} `) || (t.length >= 4 && joined.includes(` ${t}`))))
}

function findProject(q: string): ProjectData | null {
  for (const p of projects) {
    const title = norm(p.title)
    const short = norm(p.short)
    if (q.includes(title) || q.includes(short) || q.includes(p.id.replace(/-/g, ' '))) return p
  }
  for (const p of projects) {
    const first = norm(p.title).split(' ')[0]
    if (first.length >= 4 && has(q, first)) return p
  }
  const loose: [string, string][] = [
    ['drift', 'uyo-drift'],
    ['racer', 'naija-racer'],
    ['racing', 'naija-racer'],
    ['rehoboth', 'rehoboth-store'],
    ['gadget', 'rehoboth-store'],
    ['fashion', 'fashion-plus'],
    ['boutique', 'fashion-plus'],
    ['ussd', 'ussd-ui'],
    ['inventory', 'stock-and-sales'],
    ['stock', 'stock-and-sales'],
    ['quiz', 'toppers'],
  ]
  for (const [k, id] of loose) if (has(q, k)) return projects.find((p) => p.id === id) ?? null
  return null
}

const firstSentence = (s: string) => (s.match(/^.*?[.!?](\s|$)/)?.[0] ?? s).trim()
const names = (list: ProjectData[]) => list.map((p) => p.title).join(', ')

const MAIN_CHIPS = ['What do you build?', 'What is the tech stack?', 'How can I get in touch?']

export const greeting: Reply = {
  text: `Welcome to ${portfolio.studio}. I'm the concierge — I can walk you through the work, the technology, or how to start a project. What would you like to know?`,
  chips: MAIN_CHIPS,
}

export function conciergeReply(raw: string): Reply {
  const q = norm(raw)
  if (!q) return { text: 'Ask me about the projects, the stack, or how to work together.', chips: MAIN_CHIPS }

  if (has(q, 'thanks', 'thank', 'thx', 'cheers')) {
    return { text: pick(['You are welcome.', 'Happy to help. Anything else you would like to know?']), chips: ['How can I get in touch?', 'Show me the work'] }
  }
  if (has(q, 'bye', 'goodbye', 'later')) return { text: 'Thank you for visiting. Reach out any time.', chips: [] }
  if (q.split(' ').length <= 3 && has(q, 'hi', 'hello', 'hey', 'yo', 'sup', 'hola', 'good morning', 'good evening')) {
    return { text: `Hello. What would you like to know about ${portfolio.studio}?`, chips: MAIN_CHIPS }
  }
  if (hasAny(q, 'who are you', 'what are you', 'are you a bot', 'are you ai', 'are you real') || has(q, 'concierge')) {
    return { text: `I'm the site's concierge — a small assistant that answers from this portfolio's own content, so it only says what is actually true about the studio and its work.`, chips: ['Who is behind the studio?', 'What do you build?'] }
  }

  const proj = findProject(q)
  if (proj && !hasAny(q, 'all projects', 'list')) {
    return {
      text: `${proj.title}: ${firstSentence(proj.description)} Built with ${proj.tech.join(', ')}.`,
      chips: ['Show all work', 'How can I get in touch?'],
      open: { label: `Open ${proj.title}`, panel: 'project', id: proj.id },
    }
  }

  if (hasAny(q, 'hire', 'freelance', 'work with', 'work together', 'build me', 'need a developer', 'collaborat', 'get in touch') || has(q, 'quote', 'price', 'pricing', 'rate', 'rates', 'cost', 'budget', 'contract', 'commission', 'contact', 'email', 'whatsapp', 'reach', 'message', 'phone', 'call', 'available', 'telegram')) {
    const channels: string[] = []
    if (hasWhatsApp()) channels.push('WhatsApp')
    if (hasEmail()) channels.push('email')
    channels.push('Telegram')
    return {
      text: `${portfolio.studio} takes on custom web platforms, mobile apps and games. The quickest routes are ${channels.join(', ')} — send a short brief of what you are building and you will get an honest view on scope and timeline.`,
      chips: ['What do you build?', 'What is the tech stack?'],
      open: { label: 'Open contact', panel: 'signal' },
    }
  }

  const techHits = findTech(q)
  if (techHits.length) {
    const term = techHits.sort((a, b) => b.length - a.length)[0]
    const list = projects.filter((p) => p.tech.some((t) => matchesTerm(t, term)) || matchesTerm(p.description, term))
    const pretty = portfolio.skills.find((s) => skillTokens(s.name).includes(term))?.name ?? term
    if (list.length) {
      return {
        text: `${pretty} is used in ${list.length} project${list.length > 1 ? 's' : ''}: ${names(list)}.`,
        chips: list.slice(0, 2).map((p) => `Tell me about ${p.title}`).concat(['What is the tech stack?']),
        open: { label: 'Open the work', panel: 'work' },
      }
    }
    return { text: `${pretty} is part of the toolkit. The Stack level shows everything in use and where.`, chips: ['What is the tech stack?'], open: { label: 'Open the stack', panel: 'stack' } }
  }

  if (hasAny(q, 'stack', 'skill', 'technolog', 'language', 'framework', 'tools', 'good at', 'expert') || has(q, 'tech')) {
    return {
      text: 'Backend in Python/Django and Node/Express with Postgres or MySQL; front end in React and TypeScript; mobile in Flutter, React Native and Kotlin, with Capacitor to ship web apps to Android; games in Three.js and Babylon.js; Paystack for payments.',
      chips: ['Which projects use Django?', 'Which projects use React?', 'What do you build?'],
      open: { label: 'Open the stack', panel: 'stack' },
    }
  }

  if (has(q, 'game', 'games', 'gaming')) {
    const g = projects.filter((p) => p.tags.includes('game'))
    return { text: `Games are a core line of work: ${names(g)} — racing, quiz battles and peer-to-peer multiplayer without a game server.`, chips: g.slice(0, 2).map((p) => `Tell me about ${p.title}`), open: { label: 'Open the work', panel: 'work' } }
  }
  if (hasAny(q, 'mobile', 'android', 'app store', 'play store', 'offline') || has(q, 'ios', 'apk', 'capacitor')) {
    const m = projects.filter((p) => p.tags.includes('mobile'))
    return { text: `Mobile is central: ${names(m)}. A lot of the design work is offline-first, because real networks are not always kind.`, chips: ['Tell me about Stock & Sales', 'Tell me about USSD-UI'], open: { label: 'Open the work', panel: 'work' } }
  }
  if (hasAny(q, 'payment', 'paystack', 'fintech', 'payout') || has(q, 'money', 'cash', 'bank')) {
    return { text: 'Payments and payouts are familiar territory: TOPPERS pays real cash to Nigerian bank accounts with fraud-aware withdrawal rules, and Paystack is part of the toolkit.', chips: ['Tell me about TOPPERS'], open: { label: 'Open TOPPERS', panel: 'project', id: 'toppers' } }
  }
  if (hasAny(q, 'project', 'portfolio', 'showcase') || has(q, 'work', 'built', 'build', 'builds', 'shipped', 'demo', 'examples', 'make')) {
    return {
      text: `${projects.length} products are on show — ${names(projects.slice(0, 5))} and more: web platforms, mobile apps, offline-first tools and games. Open the Work level for the full list.`,
      chips: ['Which ones are games?', 'Which ones are mobile?', 'How can I get in touch?'],
      open: { label: 'Open the work', panel: 'work' },
    }
  }

  if (hasAny(q, 'who is', 'about', 'tell me about', 'yourself', 'background', 'story', 'introduce', 'who is behind') || has(q, 'founder')) {
    return {
      text: `${portfolio.studio} is an independent engineering studio in ${portfolio.location}. ${portfolio.bio[1]}`,
      chips: ['What is the tech stack?', 'How can I get in touch?'],
      open: { label: 'Open the studio', panel: 'studio' },
    }
  }
  if (has(q, 'where', 'location', 'based', 'country', 'city', 'from', 'nigeria', 'uyo', 'lagos', 'africa', 'nigerian')) {
    return { text: `The studio is based in ${portfolio.location} and builds mainly for Nigerian and African users — which is why offline-first and low-data design show up throughout the work.`, chips: ['What do you build?', 'How can I get in touch?'] }
  }
  if (hasAny(q, 'school', 'degree', 'education', 'university', 'study', 'self taught', 'self-taught', 'certificate', 'qualif')) {
    return { text: portfolio.education, chips: ['What do you build?', 'What is the tech stack?'] }
  }
  if (hasAny(q, 'experience', 'career', 'employ', 'resume') || has(q, 'years', 'job', 'cv', 'history')) {
    return { text: portfolio.experience.map((x) => `${x.title}, ${x.org}`).join(' · ') + '. Most of the résumé is the shipped products themselves.', chips: ['Show all work', 'How can I get in touch?'], open: { label: 'Open the studio', panel: 'studio' } }
  }
  if (hasAny(q, 'github', 'open source') || has(q, 'repo', 'repos', 'source', 'code', 'commit', 'commits')) {
    return { text: `Public code lives at github.com/${portfolio.githubUsername}. The Labs level pulls the live profile and top repositories.`, chips: ['Show all work'], open: { label: 'Open Labs', panel: 'labs' } }
  }
  if (has(q, 'studio', 'company', 'business', 'team', 'agency')) {
    return { text: `${portfolio.studio} is a one-engineer studio — small on purpose. It designs, builds and ships products end to end, from database to Android build.`, chips: ['What do you build?', 'How can I get in touch?'] }
  }
  if (hasAny(q, 'what can you do') || has(q, 'help', 'options', 'menu')) {
    return { text: 'Ask about the projects ("what is TOPPERS?"), the technology ("which projects use Django?"), the studio, or how to start a project together.', chips: MAIN_CHIPS }
  }

  return {
    text: pick([
      'That one is outside what I know — I can speak to the projects, the technology, the studio and how to start a project.',
      'I only answer from this portfolio, so I would rather point you somewhere useful: try the work, the stack or the contact level.',
    ]),
    chips: MAIN_CHIPS,
  }
}
