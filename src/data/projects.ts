import type { ProjectData } from '@/types'

/**
 * One arcade cabinet per entry, in the Project Arcade north of the hub.
 * Add, remove or reorder freely — the arcade lays itself out to fit.
 * Leave githubUrl / liveUrl unset until you have the real link; the panel
 * shows a friendly "link coming soon" state instead of a dead button.
 */
export const projects: ProjectData[] = [
  {
    id: 'toppers',
    title: 'TOPPERS',
    short: 'TOPPERS',
    description:
      'A gamified quiz-and-rewards platform that pays real cash to Nigerian bank accounts. Built on Django 5 with DRF, JWT auth, Google OAuth and live channels for real-time play — 300+ questions across 13 categories, with withdrawal rules and fraud-aware limits baked in rather than bolted on.',
    tech: ['Django', 'DRF', 'Django Channels', 'PostgreSQL / MySQL', 'SimpleJWT'],
    tags: ['web'],
    accent: '#5aa9ff',
  },
  {
    id: 'gist',
    title: 'GIST',
    short: 'GIST',
    description:
      'A Django social app built around Nigerian cultural identity, with a "Heat Score" mechanic driving its discover and following feeds. Shipped as a PWA and wrapped for Android with Capacitor and a GitHub Actions build pipeline.',
    tech: ['Django', 'AJAX', 'PWA', 'Capacitor'],
    tags: ['web', 'mobile'],
    accent: '#e58bff',
  },
  {
    id: 'uyo-drift',
    title: 'Uyo Drift',
    short: 'UYO DRIFT',
    description:
      'A low-poly street-racing game set in Uyo, built with Babylon.js on an entity-component architecture. Six modes including drift and elimination, WebRTC peer-to-peer multiplayer with no game server, and fully offline local player profiles.',
    tech: ['Babylon.js', 'JavaScript', 'WebRTC / PeerJS', 'Capacitor'],
    tags: ['game', 'mobile'],
    accent: '#9b7bff',
  },
  {
    id: 'naija-racer',
    title: 'Naija Racer',
    short: 'NAIJA RCR',
    description:
      'A Nigerian-themed racing game in Three.js with a hand-built procedural pipeline for generating streetscape props, packaged for Android with Capacitor.',
    tech: ['Three.js', 'JavaScript', 'Python', 'Capacitor'],
    tags: ['game', 'mobile'],
    accent: '#2ee6a6',
  },
  {
    id: 'spakk',
    title: 'SPAKK',
    short: 'SPAKK',
    description:
      'An educational gaming platform with adaptive-difficulty quizzes, XP and achievements, and real-time quiz battles over Socket.io — plus daily missions, a coins shop, and Nigerian-only leaderboards.',
    tech: ['React', 'Node.js / Express', 'Socket.io', 'PostgreSQL'],
    tags: ['web', 'game'],
    accent: '#ffb15e',
  },
  {
    id: 'stock-and-sales',
    title: 'Stock & Sales',
    short: 'STOCK+',
    description:
      'An offline-first sales and inventory app for small businesses — no backend, no internet required. Started as a provision-shop tool and generalised to any business type, with a customer credit ledger and a PIN lock, packaged as an Android app via Capacitor.',
    tech: ['Capacitor', 'IndexedDB', 'JavaScript'],
    tags: ['mobile'],
    accent: '#ff6e8c',
  },
  {
    id: 'ussd-ui',
    title: 'USSD-UI',
    short: 'USSD-UI',
    description:
      "A native Android app that turns carrier USSD menus into buttons and forms instead of raw dial codes — a React Native UI over a Kotlin telephony bridge, with a mock transport so it's fully testable without a live SIM.",
    tech: ['React Native', 'TypeScript', 'Kotlin'],
    tags: ['mobile'],
    accent: '#7fd0ff',
  },
  {
    id: 'rehoboth-store',
    title: 'Rehoboth Mobile & Gadget Store',
    short: 'REHOBOTH',
    description:
      'An enterprise store-management system for a Nigerian mobile devices and appliances retailer — a monorepo with a React/Vite frontend, a Node/Express + Sequelize backend, JWT/RBAC auth and audit logging, migrated live from PostgreSQL to MariaDB for shared hosting.',
    tech: ['React', 'Node.js / Express', 'Sequelize', 'MariaDB'],
    tags: ['web'],
    githubUrl: 'https://github.com/poweressien/REHOBOTH-MOBILE-GADGETS-STORE',
    accent: '#ffd166',
  },
  {
    id: 'fashion-plus',
    title: 'Fashion Plus',
    short: 'FASHION+',
    description:
      'A single-file storefront for a Uyo, Nigeria fashion boutique — no backend, no build step, just Tailwind and vanilla JS, with a WhatsApp-based ordering flow.',
    tech: ['HTML', 'Tailwind CSS', 'JavaScript'],
    tags: ['web'],
    accent: '#5ee6d6',
  },
]
