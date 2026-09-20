import type { PanelName } from '@/store/appStore'

export interface Level {
  id: string
  no: string
  label: string
  title: string
  blurb: string
  panel: Exclude<PanelName, null | 'project' | 'concierge'>
  /** Vertical extent on the tower, in scene units. */
  y0: number
  y1: number
}

/** The five occupied levels of the tower, bottom to top. Each one opens a section of the site. */
export const levels: Level[] = [
  { id: 'studio', no: '01', label: 'STUDIO', title: 'The Studio', blurb: 'Who builds this', panel: 'studio', y0: 150, y1: 310 },
  { id: 'work', no: '02', label: 'WORK', title: 'Selected Work', blurb: 'Products shipped', panel: 'work', y0: 360, y1: 620 },
  { id: 'stack', no: '03', label: 'STACK', title: 'Technology', blurb: 'What it is built with', panel: 'stack', y0: 670, y1: 890 },
  { id: 'labs', no: '04', label: 'LABS', title: 'Open Source', blurb: 'Live from GitHub', panel: 'labs', y0: 970, y1: 1220 },
  { id: 'signal', no: '05', label: 'SIGNAL', title: 'Contact', blurb: 'Start a conversation', panel: 'signal', y0: 1290, y1: 1410 },
]
