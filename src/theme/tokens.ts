export const theme = {
  colors: {
    forest: '#0B1F14',
    forestMid: '#123524',
    forestSoft: '#1A4330',
    lime: '#7CFF6B',
    green: '#1FA85A',
    greenDark: '#157A42',
    cream: '#F7F4EE',
    creamCard: '#FFFFFF',
    ink: '#0F1A14',
    muted: '#5E6B63',
    border: 'rgba(15, 26, 20, 0.08)',
    danger: '#C44536',
    warn: '#D4A017',
    info: '#2B6CB0',
    overlay: 'rgba(11, 31, 20, 0.72)',
  },
  radii: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    pill: '999px',
  },
  shadow: {
    card: '0 8px 28px rgba(11, 31, 20, 0.12)',
    soft: '0 2px 10px rgba(11, 31, 20, 0.08)',
  },
  fonts: {
    body: "'Heebo', 'Rubik', system-ui, sans-serif",
    display: "'Rubik', 'Heebo', system-ui, sans-serif",
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  layout: {
    max: '1120px',
    demoBar: '44px',
    bottomNav: '64px',
    sideNav: '240px',
  },
} as const

export type AppTheme = typeof theme
