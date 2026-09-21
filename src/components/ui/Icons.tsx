import type { ReactNode } from 'react'

interface P {
  size?: number
  className?: string
}
const svg = (size: number, children: ReactNode, className?: string, sw = 1.8) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
)

export const IconClose = ({ size = 18, className }: P) => svg(size, <path d="M6 6l12 12M18 6 6 18" />, className)
export const IconArrow = ({ size = 16, className }: P) => svg(size, <path d="M5 12h14M13 6l6 6-6 6" />, className)
export const IconArrowUR = ({ size = 15, className }: P) => svg(size, <path d="M7 17 17 7M8 7h9v9" />, className)
export const IconBack = ({ size = 16, className }: P) => svg(size, <path d="M19 12H5M11 6l-6 6 6 6" />, className)
export const IconChat = ({ size = 18, className }: P) => svg(size, <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.6A8 8 0 1 1 21 12z" />, className)
export const IconSoundOn = ({ size = 18, className }: P) =>
  svg(size, <><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></>, className)
export const IconSoundOff = ({ size = 18, className }: P) => svg(size, <><path d="M4 9v6h4l5 4V5L8 9z" /><path d="m17 9 5 6M22 9l-5 6" /></>, className)
export const IconSend = ({ size = 17, className }: P) => svg(size, <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />, className)
export const IconMail = ({ size = 18, className }: P) => svg(size, <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>, className)
export const IconPhone = ({ size = 18, className }: P) => svg(size, <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />, className)
export const IconWhatsApp = ({ size = 18, className }: P) =>
  svg(size, <><path d="M21 12a9 9 0 0 1-13.3 7.9L3 21l1.2-4.5A9 9 0 1 1 21 12z" /><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z" /></>, className)
export const IconTelegram = ({ size = 18, className }: P) => svg(size, <path d="M21 4 3 11l6 2 2 6 3-4 5 3zM9 13l9-6" />, className)
export const IconX = ({ size = 18, className }: P) => svg(size, <path d="M4 4l16 16M20 4 4 20" />, className, 2)
export const IconInstagram = ({ size = 18, className }: P) =>
  svg(size, <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r="0.6" fill="currentColor" /></>, className)
export const IconTikTok = ({ size = 18, className }: P) => svg(size, <path d="M14 4v10.5a3.5 3.5 0 1 1-3-3.46M14 4c.4 2.3 2.1 3.9 4.6 4.1" />, className)
export const IconFacebook = ({ size = 18, className }: P) => svg(size, <path d="M14 8.5V7a1 1 0 0 1 1-1h2.5V2.5H15a4 4 0 0 0-4 4V8.5H8V12h3v9.5h3.5V12h2.7l.6-3.5z" />, className)
export const IconPinterest = ({ size = 18, className }: P) =>
  svg(size, <><circle cx="12" cy="12" r="9" /><path d="M11 8.5c2.6-.8 4.6.6 4 3.2-.5 2-2 2.8-3.3 2.2L11.5 18M11 11.5 10 16" /></>, className)
export const IconGithub = ({ size = 18, className }: P) =>
  svg(
    size,
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />,
    className,
  )
export const IconPlay = ({ size = 16, className }: P) => svg(size, <path d="M7 4.5v15l12-7.5z" fill="currentColor" />, className, 1.4)
export const IconPause = ({ size = 16, className }: P) => svg(size, <path d="M8 5v14M16 5v14" />, className, 2.4)
export const IconSearch = ({ size = 16, className }: P) => svg(size, <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>, className)
export const IconSun = ({ size = 17, className }: P) =>
  svg(size, <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.2 5.2 7 7M17 17l1.8 1.8M18.8 5.2 17 7M7 17l-1.8 1.8" /></>, className)
export const IconStar = ({ size = 13, className }: P) => svg(size, <path d="m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z" />, className)

export const Monolith = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="8" y="2" width="8" height="20" rx="0.5" fill="none" stroke="#eef2ff" strokeWidth="1.4" />
    <path d="M12 5v14" stroke="#e9b872" strokeWidth="1.4" />
  </svg>
)

export const channelIcon: Record<string, (p: P) => ReactNode> = {
  telegram: IconTelegram,
  x: IconX,
  instagram: IconInstagram,
  tiktok: IconTikTok,
  facebook: IconFacebook,
  pinterest: IconPinterest,
}
