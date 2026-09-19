import type { PortfolioConfig } from '@/types'

/**
 * Everything on the site that isn't 3D geometry lives here.
 * Edit this file to make the portfolio yours — nothing else needs to change.
 */
export const portfolio: PortfolioConfig = {
  name: 'iNWEKOBONG',
  role: 'Full-Stack Developer',
  tagline: "I build stuff. A lot of stuff. Some of it even works on the first try.",
  location: 'Nigeria',
  bio: "I'm iNWEKOBONG — self-taught, Nigeria-based, and allegedly incapable of having an idea without shipping it. Racing games, a quiz app that pays real cash, a social platform, offline business tools, a project to bond two SIM cards together because why not — if it's a slightly unhinged idea at 2am, there's a decent chance it's already live somewhere. Core stack is Python/Django on the backend, React/Flutter/vanilla JS on the front, usually shipped to Android via Capacitor before anyone asks me to.",
  studio: 'iWEKOBONGstudios',
  education:
    'Self-taught — no formal CS degree. Learned by shipping real products for real clients and real users, then shipping the next one before the last one finished deploying.',
  experience: [
    {
      title: 'Founder & Developer',
      org: 'iWEKOBONGstudios',
      period: 'Ongoing',
      description:
        'Independent studio building web apps, mobile games, and backend services for Nigerian and African users — from client e-commerce platforms to original games.',
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
    { name: 'TypeScript', color: '#3178c6' },
    { name: 'JavaScript', color: '#f7df1e' },
    { name: 'Flutter / Dart', color: '#02569b' },
    { name: 'React Native', color: '#61dafb' },
    { name: 'Node.js', color: '#68a063' },
    { name: 'Three.js / Babylon.js', color: '#ffffff' },
    { name: 'PostgreSQL / MySQL', color: '#336791' },
    { name: 'Kotlin (native)', color: '#7f52ff' },
    { name: 'Paystack API', color: '#00c3f7' },
    { name: 'Docker / CI', color: '#2496ed' },
    { name: 'Git / GitHub', color: '#f05032' },
  ],
  email: 'ADD_YOUR_EMAIL@example.com',
  githubUsername: 'poweressien',
  githubUrl: 'https://github.com/poweressien',
  linkedinUrl: '',
  whatsappNumber: '',
  // Leave empty to use a mailto: draft instead. Point this at a real endpoint
  // (Formspree, your own API, etc.) once you have one — the contact form will
  // never pretend a message sent if this is blank.
  contactFormEndpoint: '',

  // Where the floating PC in the Space Hub sends people. Defaults to the
  // GitHub profile since that's always real — point it at a flagship
  // project, a blog, anywhere else you'd rather send a curious visitor.
  externalSiteUrl: 'https://github.com/poweressien',

  planetPoweressien: {
    name: "POWERESSIEN'S PLANET",
    tagline: 'The GitHub side of the operation',
    blurb:
      "This planet is made entirely of commits. Population: one developer and an alarming number of repositories. Local time is measured in deploys.",
    color: '#6ea8ff',
  },
  planetInwekobong: {
    name: 'iNWEKOBONG',
    tagline: 'The origin planet',
    blurb:
      "Home planet. Native lifeforms build things they didn't need to build, then build three more. Exports: web apps, mobile games, and an unreasonable number of side projects.",
    color: '#a685ff',
  },

  aiAssistant: {
    name: 'OBI',
    tagline: 'Resident tower intelligence (Obviously Better Intelligence)',
    lines: [
      "Systems nominal. Founder's coffee levels: critical.",
      "I run this tower. iNWEKOBONG just thinks he does.",
      "Fun fact: I was built in a weekend. So was everything else here.",
      "Current project count: too many. Recommend an intervention.",
      "I'd offer you a tour, but the last three floors are still `console.log`-driven.",
      "Yes, the tower name is a bit much. No, we're not changing it.",
      "Threat assessment: none. Deadline assessment: dire, as always.",
      "I've read the codebase. I have questions. I've decided not to ask them.",
    ],
  },

  funnyButtons: [
    {
      label: 'DO NOT PRESS',
      response: "You pressed it. Obviously. Internet flooding levels: +1.",
    },
    {
      label: 'SELF DESTRUCT',
      response: 'Initiating self destruct in 3... 2... 1... just kidding. The code is more stable than that. Usually.',
    },
    {
      label: 'HIRE ME',
      response: "Excellent choice. Redirecting you to the comms terminal in the tower — go on, walk over.",
    },
    {
      label: "DON'T HIRE ME",
      response: "Bold strategy. Respectfully declining your decline. Try the other button.",
    },
  ],
}
