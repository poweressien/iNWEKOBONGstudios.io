import type { ReactNode } from 'react'

interface P {
  size?: number
  className?: string
}

const base = (size: number, children: ReactNode, className?: string, fill = 'none') => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
)

export const IconMap = ({ size = 20, className }: P) =>
  base(size, <><path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7z" /><path d="M9 4v13M15 7v13" /></>, className)
export const IconTrophy = ({ size = 20, className }: P) =>
  base(size, <><path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4" /><path d="M12 13v4M8 21h8M10 17h4" /></>, className)
export const IconSoundOn = ({ size = 20, className }: P) =>
  base(size, <><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></>, className)
export const IconSoundOff = ({ size = 20, className }: P) =>
  base(size, <><path d="M4 9v6h4l5 4V5L8 9z" /><path d="m17 9 5 6M22 9l-5 6" /></>, className)
export const IconFullscreen = ({ size = 20, className }: P) =>
  base(size, <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />, className)
export const IconMenu = ({ size = 20, className }: P) => base(size, <path d="M4 7h16M4 12h16M4 17h16" />, className)
export const IconClose = ({ size = 20, className }: P) => base(size, <path d="M6 6l12 12M18 6 6 18" />, className)
export const IconMail = ({ size = 20, className }: P) =>
  base(size, <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>, className)
export const IconGithub = ({ size = 20, className }: P) =>
  base(size, <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />, className)
export const IconWhatsApp = ({ size = 20, className }: P) =>
  base(size, <><path d="M21 12a9 9 0 0 1-13.3 7.9L3 21l1.2-4.5A9 9 0 1 1 21 12z" /><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z" /></>, className)
export const IconLinkedin = ({ size = 20, className }: P) =>
  base(size, <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></>, className)
export const IconExternal = ({ size = 18, className }: P) => base(size, <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />, className)
export const IconSend = ({ size = 18, className }: P) => base(size, <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />, className)
export const IconCheck = ({ size = 16, className }: P) => base(size, <path d="m4 12 5 5L20 6" />, className)
export const IconStar = ({ size = 14, className }: P) => base(size, <path d="m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z" />, className)
export const IconBolt = ({ size = 22, className }: P) => base(size, <path d="M13 2 4 14h7l-1 8 9-12h-7z" />, className, 'currentColor')
export const IconHand = ({ size = 22, className }: P) => base(size, <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /></>, className)
export const IconChevronLeft = ({ size = 18, className }: P) => base(size, <path d="m15 5-7 7 7 7" />, className)
export const IconChevronRight = ({ size = 18, className }: P) => base(size, <path d="m9 5 7 7-7 7" />, className)
export const IconHome = ({ size = 18, className }: P) => base(size, <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />, className)
export const IconWarp = ({ size = 18, className }: P) => base(size, <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></>, className)

export const LogoMark = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5aa9ff" />
        <stop offset="1" stopColor="#9b7bff" />
      </linearGradient>
    </defs>
    <path d="M32 6 54 19v26L32 58 10 45V19z" fill="rgba(90,169,255,0.12)" stroke="url(#lg)" strokeWidth="4" strokeLinejoin="round" />
    <circle cx="32" cy="32" r="7" fill="url(#lg)" />
  </svg>
)
