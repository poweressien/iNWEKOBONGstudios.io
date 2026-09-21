import type { PanelName } from '@/store/appStore'

export interface Level {
  id: string
  no: string
  label: string
  title: string
  blurb: string
  /** Caption shown during the guided tour. */
  tour: string
  panel: Exclude<PanelName, null | 'project' | 'concierge'>
  /** Vertical extent on the tower, in scene units. */
  y0: number
  y1: number
}

/** The five occupied levels of the tower, bottom to top. Each one opens a section of the site. */
export const levels: Level[] = [
  { id: 'studio', no: '01', label: 'STUDIO', title: 'The Studio', blurb: 'Who builds this',
    tour: 'An independent engineering studio in Nigeria — one engineer taking products from the first commit to a live deployment.', panel: 'studio', y0: 150, y1: 310 },
  { id: 'work', no: '02', label: 'WORK', title: 'Selected Work', blurb: 'Products shipped',
    tour: 'Products across web, mobile and games — from a quiz platform that pays out real cash to an offline-first inventory app.', panel: 'work', y0: 360, y1: 620 },
  { id: 'stack', no: '03', label: 'STACK', title: 'Technology', blurb: 'What it is built with',
    tour: 'Python and Django on the backend, React and TypeScript up front, Flutter and Kotlin on mobile, Three.js and Babylon.js for games.', panel: 'stack', y0: 670, y1: 890 },
  { id: 'labs', no: '04', label: 'LABS', title: 'Open Source', blurb: 'Live from GitHub',
    tour: 'Public code and activity, pulled live from GitHub — the raw material behind the products.', panel: 'labs', y0: 970, y1: 1220 },
  { id: 'signal', no: '05', label: 'SIGNAL', title: 'Contact', blurb: 'Start a conversation',
    tour: 'Have a product in mind? This is where a conversation starts — WhatsApp, email, Telegram or a short brief.', panel: 'signal', y0: 1290, y1: 1410 },
]
