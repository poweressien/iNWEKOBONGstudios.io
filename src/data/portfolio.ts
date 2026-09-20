import type { PortfolioConfig } from '@/types'

/**
 * Everything on the site that isn't scene art lives here.
 * Edit this file to change the copy, contact details or skills — nothing else needs to change.
 */
export const portfolio: PortfolioConfig = {
  name: 'iNWEKOBONG',
  domain: 'technologies.io',
  role: 'Full-Stack Engineer',
  headline: 'Web platforms, mobile apps and games — engineered in Nigeria.',
  tagline: 'Software for real users on real networks: fast, offline-tolerant and built to last.',
  location: 'Nigeria',
  studio: 'iNWEKOBONG Technologies',
  bio: [
    'iNWEKOBONG Technologies is an independent engineering studio building web platforms, mobile applications and games for Nigerian and African users.',
    'The work spans gamified platforms that pay out real cash, social products, offline-first business tools, e-commerce systems for local retailers, and original racing and quiz games — usually taken from first commit to a live deployment by one engineer.',
    'The core stack is Python and Django on the backend, with React, TypeScript and Flutter on the front, shipped to Android through Capacitor and React Native when a product needs to live on a phone.',
  ],
  education:
    'Self-taught. No formal computer-science degree — the training has been shipping real products to real users, and learning whatever the next product demanded.',
  experience: [
    {
      title: 'Founder & Lead Engineer',
      org: 'iNWEKOBONG Technologies',
      period: 'Ongoing',
      description:
        'Independent studio building web apps, mobile apps and games — from client e-commerce platforms to original titles — with an emphasis on offline-first design and low-data performance.',
    },
    {
      title: 'Freelance Full-Stack Developer',
      org: 'Independent clients',
      period: 'Ongoing',
      description:
        'Custom Django and React builds for Nigerian businesses: retail management systems, gamified reward platforms with real payouts, and mobile tools that keep working without a connection.',
    },
  ],
  focus: [
    'Offline-first mobile apps',
    'Payments & fintech for African markets',
    'Real-time multiplayer and quiz platforms',
    'Game development for web and Android',
    'Connectivity tooling for emerging markets',
  ],
  skills: [
    { name: 'Python', group: 'Backend' },
    { name: 'Django', group: 'Backend' },
    { name: 'Node.js', group: 'Backend' },
    { name: 'PostgreSQL / MySQL', group: 'Backend' },
    { name: 'Paystack API', group: 'Backend' },
    { name: 'Docker / CI', group: 'Backend' },
    { name: 'React', group: 'Frontend & Mobile' },
    { name: 'TypeScript', group: 'Frontend & Mobile' },
    { name: 'JavaScript', group: 'Frontend & Mobile' },
    { name: 'Flutter / Dart', group: 'Frontend & Mobile' },
    { name: 'React Native', group: 'Frontend & Mobile' },
    { name: 'Kotlin (native)', group: 'Frontend & Mobile' },
    { name: 'Three.js / Babylon.js', group: 'Graphics & Tooling' },
    { name: 'Git / GitHub', group: 'Graphics & Tooling' },
  ],

  // ── Contact ─────────────────────────────────────────────────────────────
  email: 'essiengodspower447@gmail.com',
  phone: '09037086084',
  whatsappNumber: '2349037086084',
  githubUsername: 'poweressien',
  githubUrl: 'https://github.com/poweressien',
  contactFormEndpoint: '',
  channels: [
    { id: 'telegram', label: 'Telegram', handle: '@Inwekobong', url: 'https://t.me/Inwekobong' },
    { id: 'x', label: 'X', handle: '@INWEKOBONG', url: 'https://x.com/INWEKOBONG' },
    { id: 'instagram', label: 'Instagram', handle: '@poweressiien', url: 'https://www.instagram.com/poweressiien' },
    { id: 'tiktok', label: 'TikTok', handle: '@poweressien', url: 'https://www.tiktok.com/@poweressien' },
    { id: 'facebook', label: 'Facebook', handle: 'poweressiien', url: 'https://www.facebook.com/poweressiien' },
    { id: 'pinterest', label: 'Pinterest', handle: 'poweressien', url: 'https://pin.it/vzupxamLX' },
  ],

  concierge: { name: 'Concierge', tagline: 'Ask anything about the work' },
}

export const hasEmail = () => /@/.test(portfolio.email)
export const hasWhatsApp = () => portfolio.whatsappNumber.replace(/\D/g, '').length >= 8
