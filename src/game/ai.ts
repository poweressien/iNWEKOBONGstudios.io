import { portfolio, hasEmail, hasWhatsApp } from '@/data/portfolio'
import { projects } from '@/data/projects'
import type { ProjectData } from '@/types'

/**
 * OBI runs entirely in the browser — no API key, no network, no latency.
 * It matches what a visitor types against the portfolio data itself, so the
 * answers are always in sync with src/data/*.
 */

export interface Reply {
  text: string
  chips: string[]
  open?: { label: string; panel: 'about' | 'projects' | 'contact' | 'github' | 'project'; id?: string }
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
  psql: 'postgresql',
  three: 'three.js',
  threejs: 'three.js',
  babylon: 'babylon.js',
  babylonjs: 'babylon.js',
  rn: 'react native',
  dart: 'flutter',
  drf: 'drf',
  websockets: 'socket.io',
  websocket: 'socket.io',
  webrtc: 'webrtc',
  pwa: 'pwa',
  android: 'capacitor',
  tailwindcss: 'tailwind',
  db: 'postgresql',
  database: 'postgresql',
}

const techTerms: string[] = (() => {
  const set = new Set<string>()
  const add = (raw: string) =>
    raw
      .split('/')
      .map((p) => p.toLowerCase().replace(/\(.*?\)/g, '').trim())
      .filter((p) => p.length > 1)
      .forEach((p) => set.add(p))
  projects.forEach((p) => p.tech.forEach(add))
  portfolio.skills.forEach((s) => add(s.name))
  return [...set]
})()

function findTech(q: string): string[] {
  const words = q.split(' ').map((w) => ALIASES[w] ?? w)
  const joined = ` ${words.join(' ')} `
  return techTerms.filter((t) => t.length >= 3 && (joined.includes(` ${t} `) || (t.length >= 4 && joined.includes(` ${t}`))))
}

function projectsUsing(term: string): ProjectData[] {
  return projects.filter(
    (p) => p.tech.some((t) => t.toLowerCase().includes(term)) || p.description.toLowerCase().includes(term),
  )
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

const firstSentence = (s: string) => {
  const m = s.match(/^.*?[.!?](\s|$)/)
  return (m ? m[0] : s).trim()
}

const names = (list: ProjectData[]) => list.map((p) => p.title).join(', ')

const MAIN_CHIPS = ['What do you build?', 'Show me the tech stack', 'Can I hire you?', 'Tell me a joke']

export const greeting: Reply = {
  text: `Hey — I'm ${portfolio.ai.name}, the resident AI of this universe. Ask me about ${portfolio.name}'s projects, skills, or how to work together. I run locally, so I'm fast and I never hallucinate a project that doesn't exist.`,
  chips: MAIN_CHIPS,
}

export function obiReply(raw: string): Reply {
  const q = norm(raw)
  if (!q) return { text: 'Say something! I can take it.', chips: MAIN_CHIPS }

  // — thanks / bye / greetings —
  if (has(q, 'thanks', 'thank', 'thx', 'cheers')) {
    return { text: pick(["Anytime. I'm literally always here.", 'You are welcome. Remember to collect the orbs.', 'My pleasure. Tell your friends.']), chips: ['Can I hire you?', 'Show me the projects'] }
  }
  if (has(q, 'bye', 'goodbye', 'later', 'cya')) {
    return { text: 'Safe travels. The universe will be here, still unfinished.', chips: [] }
  }
  if (q.split(' ').length <= 3 && has(q, 'hi', 'hello', 'hey', 'yo', 'sup', 'howdy', 'hola', 'good morning', 'good evening')) {
    return { text: pick([`Hello, traveller. What would you like to know about ${portfolio.name}?`, 'Hey! Ask away — projects, skills, hiring, jokes.']), chips: MAIN_CHIPS }
  }

  // — who are YOU (OBI) —
  if (hasAny(q, 'who are you', 'what are you', 'your name', 'are you real', 'are you ai', 'are you a bot') || has(q, 'obi')) {
    return {
      text: `I'm ${portfolio.ai.name} — ${portfolio.ai.tagline}. I live in this tower, I know everything on this site, and I have opinions about the coffee situation.`,
      chips: ['Who is iNWEKOBONG?', 'What do you build?'],
    }
  }

  // — a specific project —
  const proj = findProject(q)
  if (proj && !hasAny(q, 'all projects', 'list')) {
    return {
      text: `${proj.title}: ${firstSentence(proj.description)} Built with ${proj.tech.join(', ')}.`,
      chips: ['Show all projects', 'Can I hire you?'],
      open: { label: `Open ${proj.title}`, panel: 'project', id: proj.id },
    }
  }

  // — hiring / contact —
  if (hasAny(q, 'hire', 'freelance', 'work with', 'work together', 'build me', 'need a developer', 'collaborat') || has(q, 'available', 'quote', 'price', 'pricing', 'rate', 'rates', 'cost', 'budget', 'contract', 'commission', 'contact', 'email', 'whatsapp', 'reach', 'message', 'phone', 'call', 'linkedin')) {
    const channels: string[] = []
    if (hasEmail()) channels.push('email')
    if (hasWhatsApp()) channels.push('WhatsApp')
    if (portfolio.linkedinUrl) channels.push('LinkedIn')
    channels.push('GitHub')
    return {
      text: `Yes — ${portfolio.name} takes on custom Django, React and mobile builds for businesses, plus game projects. Reach out via ${channels.join(', ')}. Tell him what you're building and he'll tell you honestly how long it'll take.`,
      chips: ['What do you build?', 'Show me the tech stack'],
      open: { label: 'Open contact', panel: 'contact' },
    }
  }

  // — a technology —
  const techHits = findTech(q)
  if (techHits.length) {
    const term = techHits.sort((a, b) => b.length - a.length)[0]
    const list = projectsUsing(term)
    const pretty = portfolio.skills.find((s) => s.name.toLowerCase().includes(term))?.name ?? term
    if (list.length) {
      return {
        text: `${pretty} shows up in ${list.length} project${list.length > 1 ? 's' : ''}: ${names(list)}. ${list.length > 2 ? "It's basically a daily driver." : "Not the only tool in the box, but a trusted one."}`,
        chips: list.slice(0, 2).map((p) => `Tell me about ${p.title}`).concat(['Show me the tech stack']),
        open: { label: 'Open projects', panel: 'projects' },
      }
    }
    return {
      text: `${pretty} is part of the toolkit — collect its skill orb somewhere in the universe to prove you've earned it.`,
      chips: ['Show me the tech stack', 'What do you build?'],
    }
  }

  // — stack —
  if (hasAny(q, 'stack', 'skill', 'tech', 'technolog', 'language', 'framework', 'tools', 'good at', 'expert', 'know how')) {
    return {
      text: `Backend: Python/Django, Node/Express, Postgres/MySQL. Front: React, TypeScript, vanilla JS. Mobile: Flutter, React Native, Kotlin, and Capacitor for shipping web apps to Android. Games: Three.js and Babylon.js. Payments: Paystack.`,
      chips: ['Which projects use Django?', 'Which projects use React?', 'What do you build?'],
      open: { label: 'Open skills', panel: 'about' },
    }
  }

  // — categories —
  if (has(q, 'game', 'games', 'gaming', 'gamer')) {
    const g = projects.filter((p) => p.tags.includes('game'))
    return {
      text: `Games are the soft spot. ${names(g)} — racing, quiz battles, WebRTC multiplayer with no game server. You're standing inside one right now.`,
      chips: g.slice(0, 2).map((p) => `Tell me about ${p.title}`),
      open: { label: 'Open projects', panel: 'projects' },
    }
  }
  if (hasAny(q, 'mobile', 'android', 'app store', 'play store', 'offline') || has(q, 'ios', 'apk', 'capacitor')) {
    const m = projects.filter((p) => p.tags.includes('mobile'))
    return {
      text: `Mobile is a big part of it: ${names(m)}. Lots of offline-first thinking, because data and networks in the real world are not always kind.`,
      chips: ['Tell me about Stock & Sales', 'Tell me about USSD-UI'],
      open: { label: 'Open projects', panel: 'projects' },
    }
  }
  if (hasAny(q, 'payment', 'paystack', 'fintech', 'payout') || has(q, 'money', 'cash', 'bank')) {
    return {
      text: 'Money-moving apps are familiar territory: TOPPERS pays real cash to Nigerian bank accounts with fraud-aware withdrawal rules, and Paystack sits in the toolbox.',
      chips: ['Tell me about TOPPERS'],
      open: { label: 'Open TOPPERS', panel: 'project', id: 'toppers' },
    }
  }
  if (hasAny(q, 'project', 'portfolio', 'showcase') || has(q, 'work', 'built', 'build', 'builds', 'made', 'shipped', 'demo', 'examples', 'make')) {
    return {
      text: `${projects.length} projects live in the arcade to the north: ${names(projects.slice(0, 5))} and more. Web apps, games, offline-first mobile tools, even a USSD interface. Walk up to any cabinet to see the details.`,
      chips: ['Which ones are games?', 'Which ones are mobile?', 'Can I hire you?'],
      open: { label: 'Open projects', panel: 'projects' },
    }
  }

  // — the person —
  if (hasAny(q, 'who is', 'about', 'tell me about', 'yourself', 'biography', 'story', 'background', 'introduce')) {
    return {
      text: `${portfolio.name} is a self-taught, ${portfolio.location}-based full-stack developer and founder of ${portfolio.studio}. He ships web apps, mobile games and offline-first tools — usually faster than anyone asked.`,
      chips: ['What do you build?', 'Where is he based?', 'Can I hire you?'],
      open: { label: 'Open About', panel: 'about' },
    }
  }
  if (has(q, 'where', 'location', 'based', 'country', 'city', 'from', 'nigeria', 'uyo', 'lagos', 'africa', 'nigerian')) {
    return {
      text: `${portfolio.name} is based in ${portfolio.location} and builds mostly for Nigerian and African users — which is why offline-first and low-data design show up everywhere.`,
      chips: ['What do you build?', 'Can I hire you?'],
    }
  }
  if (hasAny(q, 'school', 'degree', 'education', 'university', 'study', 'learn', 'self taught', 'self-taught', 'certificate', 'qualif')) {
    return { text: portfolio.education, chips: ['What do you build?', 'Show me the tech stack'] }
  }
  if (hasAny(q, 'experience', 'career', 'employ', 'resume') || has(q, 'years', 'job', 'cv', 'history')) {
    const e = portfolio.experience.map((x) => `${x.title} at ${x.org}`).join(' and ')
    return { text: `${e}. Real clients, real users, real deploys — the résumé is mostly the projects.`, chips: ['Show all projects', 'Can I hire you?'], open: { label: 'Open About', panel: 'about' } }
  }
  if (hasAny(q, 'github', 'open source') || has(q, 'repo', 'repos', 'source', 'code', 'commit', 'commits')) {
    return {
      text: `Everything public lives at github.com/${portfolio.githubUsername}. The GitHub planet to the west pulls the live profile.`,
      chips: ['Show all projects'],
      open: { label: 'Open GitHub', panel: 'github' },
    }
  }
  if (has(q, 'studio', 'company', 'tower', 'business', 'team', 'agency')) {
    return {
      text: `${portfolio.studio} is a one-founder studio — building for Nigerian and African users, from client e-commerce to original games. Small team, large ambitions.`,
      chips: ['What do you build?', 'Can I hire you?'],
    }
  }

  // — fun —
  if (hasAny(q, 'joke', 'funny', 'laugh', 'humor', 'humour', 'bored', 'entertain')) {
    return {
      text: pick([
        'A developer walks into a bar, orders 1 beer, 0 beers, 99999 beers, -1 beers, and a lizard. The bar crashes.',
        "It works on my machine. Ship the machine. That's DevOps.",
        "There are 10 kinds of people: those who understand binary and those who don't.",
        'Why do programmers prefer dark mode? Light attracts bugs.',
        'I would tell you a UDP joke, but you might not get it.',
      ]),
      chips: ['Another one', 'What do you build?'],
    }
  }
  if (q === 'another one' || has(q, 'another', 'more')) {
    return obiReply('joke')
  }
  if (hasAny(q, 'what can you do') || has(q, 'help', 'commands', 'options', 'menu')) {
    return {
      text: 'Ask me about projects ("what is TOPPERS?"), tech ("which projects use Django?"), hiring, location, or just say hi. Try the chips below.',
      chips: MAIN_CHIPS,
    }
  }
  if (has(q, 'love', 'cool', 'awesome', 'nice', 'great', 'amazing', 'impressive', 'wow')) {
    return { text: pick(['I will pass that on. He will pretend to be humble.', 'Correct. I would add "unreasonably" before it.']), chips: ['Can I hire you?', 'Show me the tech stack'] }
  }
  if (hasAny(q, 'secret', 'easter', 'hidden', 'cheat')) {
    return { text: 'A yellow minibus is parked near the spawn point. Press E next to it. That is all I am legally allowed to say.', chips: [] }
  }

  return {
    text: pick([
      "I didn't quite catch that — my training data is this portfolio, so try asking about projects, the tech stack, or hiring.",
      'Hmm. That one is outside my jurisdiction. I am very good on projects, skills, and how to hire the boss, though.',
    ]),
    chips: MAIN_CHIPS,
  }
}
