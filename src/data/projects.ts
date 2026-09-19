import type { ProjectData } from '@/types'

/**
 * One entry per project station on the Project Floor.
 * Add or remove entries freely — the floor lays itself out to fit however many you list.
 * githubUrl / liveUrl are left unset where the real link isn't confirmed yet —
 * fill them in rather than leaving a guess, the panel handles "not available yet" gracefully.
 */
export const projects: ProjectData[] = [
  {
    id: 'toppers',
    title: 'TOPPERS',
    description:
      'A gamified quiz-and-rewards platform that pays real cash to Nigerian bank accounts. Built on Django 5 with DRF, JWT auth, Google OAuth, and live channels for real-time play — 300+ questions across 13 categories, with withdrawal rules and fraud-aware limits baked in rather than bolted on.',
    tech: ['Django', 'DRF', 'Django Channels', 'PostgreSQL / MySQL', 'SimpleJWT'],
    accent: '#6ea8ff',
  },
  {
    id: 'gist',
    title: 'GIST',
    description:
      'A Django social app built around Nigerian cultural identity, with a "Heat Score" mechanic driving its discover and following feeds. Shipped as a PWA and wrapped for Android with Capacitor and a GitHub Actions build pipeline.',
    tech: ['Django', 'AJAX', 'PWA', 'Capacitor'],
    accent: '#e6a4ff',
  },
  {
    id: 'uyo-drift',
    title: 'Uyo Drift',
    description:
      'A low-poly street-racing game set in Uyo, built with Babylon.js on an entity-component architecture. Six modes including drift and elimination, WebRTC peer-to-peer multiplayer with no game server, and fully offline local player profiles.',
    tech: ['Babylon.js', 'JavaScript', 'WebRTC / PeerJS', 'Capacitor'],
    accent: '#b088ff',
  },
  {
    id: 'naija-racer',
    title: 'Naija Racer',
    description:
      'A Nigerian-themed racing game in Three.js with a hand-built procedural pipeline for generating streetscape props, packaged for Android with Capacitor.',
    tech: ['Three.js', 'JavaScript', 'Python', 'Capacitor'],
    accent: '#5ee6b0',
  },
  {
    id: 'spakk',
    title: 'SPAKK',
    description:
      'An educational gaming platform with adaptive-difficulty quizzes, XP and achievements, and real-time quiz battles over Socket.io — plus daily missions, a coins shop, and Nigerian-only leaderboards.',
    tech: ['React', 'Node.js / Express', 'Socket.io', 'PostgreSQL'],
    accent: '#ffb15e',
  },
  {
    id: 'stock-and-sales',
    title: 'Stock & Sales',
    description:
      'An offline-first sales and inventory app for small businesses — no backend, no internet required. Started as a provision-shop tool and generalized to any business type, with a customer credit ledger and a PIN lock, packaged as an Android app via Capacitor.',
    tech: ['Capacitor', 'IndexedDB', 'JavaScript'],
    accent: '#ff6e8c',
  },
  {
    id: 'ussd-ui',
    title: 'USSD-UI',
    description:
      "A native Android app that turns carrier USSD menus into buttons and forms instead of raw dial codes — a React Native UI over a Kotlin telephony bridge, with a mock transport so it's fully testable without a live SIM.",
    tech: ['React Native', 'TypeScript', 'Kotlin'],
    accent: '#8ec5ff',
  },
  {
    id: 'rehoboth-store',
    title: 'Rehoboth Mobile & Gadget Store',
    description:
      'An enterprise store-management system for a Nigerian mobile devices and appliances retailer — a monorepo with a React/Vite frontend, a Node/Express + Sequelize backend, JWT/RBAC auth, and audit logging, migrated live from PostgreSQL to MariaDB for shared hosting.',
    tech: ['React', 'Node.js / Express', 'Sequelize', 'MariaDB'],
    githubUrl: 'https://github.com/poweressien/REHOBOTH-MOBILE-GADGETS-STORE',
    accent: '#ffd166',
  },
  {
    id: 'fashion-plus',
    title: 'Fashion Plus',
    description:
      'A single-file storefront for a Uyo, Nigeria fashion boutique — no backend, no build step, just Tailwind and vanilla JS, with a WhatsApp-based ordering flow.',
    tech: ['HTML', 'Tailwind CSS', 'JavaScript'],
    accent: '#7fe0d6',
  },
]
