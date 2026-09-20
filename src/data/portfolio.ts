import type { PortfolioConfig } from '@/types'

/**
 * Everything on the site that isn't game art lives here.
 * Edit this file to make the portfolio yours — nothing else needs to change.
 */
export const portfolio: PortfolioConfig = {
  name: 'iNWEKOBONG',
  role: 'Full-Stack Developer',
  headline: 'Full-Stack Developer · Game Builder',
  tagline: 'I build stuff. A lot of stuff. Some of it even works on the first try.',
  location: 'Nigeria',
  bio: "I'm iNWEKOBONG — self-taught, Nigeria-based, and allegedly incapable of having an idea without shipping it. Racing games, a quiz app that pays real cash, a social platform, offline business tools, a project to bond two SIM cards together because why not — if it's a slightly unhinged idea at 2am, there's a decent chance it's already live somewhere. Core stack is Python/Django on the backend, React/Flutter/vanilla JS on the front, usually shipped to Android via Capacitor before anyone asks me to.",
  studio: 'iNWEKOBONG Studios',
  education:
    'Self-taught — no formal CS degree. Learned by shipping real products for real clients and real users, then shipping the next one before the last one finished deploying.',
  experience: [
    {
      title: 'Founder & Developer',
      org: 'iNWEKOBONG Studios',
      period: 'Ongoing',
      description:
        'Independent studio building web apps, mobile games and backend services for Nigerian and African users — from client e-commerce platforms to original games.',
    },
    {
      title: 'Freelance Full-Stack Developer',
      org: 'Independent clients',
      period: 'Ongoing',
      description:
        'Custom Django and React builds for Nigerian businesses, including e-commerce, gamified platforms with real cash payouts, and offline-first mobile tools.',
    },
  ],
  interests: [
    'Game development',
    'Offline-first mobile apps',
    'Connectivity tools for emerging markets',
    'African-market fintech & commerce',
    'Flooding the internet with side projects',
  ],
  skills: [
    { name: 'Python', color: '#ffd43b' },
    { name: 'Django', color: '#3fae4e' },
    { name: 'React', color: '#61dafb' },
    { name: 'TypeScript', color: '#3d8bff' },
    { name: 'JavaScript', color: '#f7df1e' },
    { name: 'Flutter / Dart', color: '#3fb6ff' },
    { name: 'React Native', color: '#7be3ff' },
    { name: 'Node.js', color: '#7bc96f' },
    { name: 'Three.js / Babylon.js', color: '#ffffff' },
    { name: 'PostgreSQL / MySQL', color: '#5c8bd6' },
    { name: 'Kotlin (native)', color: '#a97bff' },
    { name: 'Paystack API', color: '#00c3f7' },
    { name: 'Docker / CI', color: '#3aa0ff' },
    { name: 'Git / GitHub', color: '#ff7a59' },
  ],

  // ── Contact ───────────────────────────────────────────────────────────
  // Fill these in and the buttons appear automatically. Anything left blank
  // (or still the placeholder) is simply hidden — never a dead link.
  email: 'ADD_YOUR_EMAIL@example.com',
  githubUsername: 'poweressien',
  githubUrl: 'https://github.com/poweressien',
  linkedinUrl: '',
  whatsappNumber: '',
  contactFormEndpoint: '',

  externalSiteUrl: 'https://github.com/poweressien',

  planetGithub: {
    name: "POWERESSIEN'S PLANET",
    tagline: 'The GitHub side of the operation',
    blurb:
      'This planet is made entirely of commits. Population: one developer and an alarming number of repositories. Local time is measured in deploys.',
    color: '#5aa9ff',
  },
  planetHome: {
    name: 'iNWEKOBONG',
    tagline: 'The origin planet',
    blurb:
      "Home planet. Native lifeforms build things they didn't need to build, then build three more. Exports: web apps, mobile games, and an unreasonable number of side projects.",
    color: '#9b7bff',
  },

  ai: {
    name: 'OBI',
    tagline: 'Obviously Better Intelligence',
    lines: [
      "Systems nominal. Founder's coffee levels: critical.",
      'I run this universe. iNWEKOBONG just thinks he does.',
      'Fun fact: I was built in a weekend. So was everything else here.',
      'Current project count: too many. Recommend an intervention.',
      'Psst — the glowing orbs are skills. Collect them all.',
      'Ask me anything. I have read the whole codebase.',
      'Threat assessment: none. Deadline assessment: dire, as always.',
    ],
  },

  pads: [
    {
      label: 'DO NOT PRESS',
      response: 'You pressed it. Obviously. Internet flooding levels: +1.',
      color: '#ff4d6d',
    },
    {
      label: 'SELF DESTRUCT',
      response: 'Self destruct in 3… 2… 1… just kidding. The code is more stable than that. Usually.',
      color: '#ffb15e',
    },
    {
      label: 'HIRE ME',
      response: 'Excellent choice. Opening the comms channel…',
      color: '#2ee6a6',
    },
    {
      label: "DON'T HIRE ME",
      response: 'Bold strategy. Respectfully declining your decline. Try the green one.',
      color: '#9b7bff',
    },
  ],
}

export const hasEmail = () => /@/.test(portfolio.email) && !portfolio.email.includes('ADD_YOUR_EMAIL')
export const hasWhatsApp = () => portfolio.whatsappNumber.replace(/\D/g, '').length >= 8
