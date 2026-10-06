export const theme = {
  colors: {
    forest: '#123C2D',
    forestMid: '#1B4A38',
    forestSoft: '#24543F',
    moss: '#5D7C4E',
    growth: '#CFEA78',
    warmth: '#F2C8A7',
    /** Legacy aliases kept so existing pages pick up the new palette. */
    lime: '#CFEA78',
    green: '#5D7C4E',
    greenDark: '#2F6B4A',
    cream: '#F4F1E8',
    creamCard: '#FFFEFA',
    ink: '#173128',
    muted: '#66756D',
    border: '#DCE1D8',
    /** Stronger hairline for controls (inputs, segmented rows). */
    borderStrong: '#C9D0C4',
    chipGreen: '#E4EBD8',
    chipWarm: '#FFF0D8',
    chipNeutral: '#F4F1E8',
    chipDanger: '#F6DED4',
    chipInfo: '#E8F1F7',
    chipAi: '#E8F1FB',
    track: '#E7E3D6',
    danger: '#B4553D',
    warn: '#9A6B1F',
    info: '#3C6B8F',
    /** AI provenance: the ✦ stamp and the AI chip. */
    aiBlue: '#3B7CC9',
    /** Watering care tone (todo icons, calendar). */
    water: '#3B7CC9',
    /** Neutral metal for photo-only marks. */
    metal: '#8B929A',
    /** Market direction tones, kept inside the botanical palette. */
    up: '#2F6B4A',
    down: '#B4553D',
    overlay: 'rgba(23, 28, 26, 0.46)',
  },
  radii: {
    sm: '10px',
    md: '14px',
    lg: '22px',
    pill: '999px',
    /** Buttons, chips and segmented items. */
    control: '999px',
  },
  /** Page and chrome backgrounds (CSS background values). */
  surface: {
    page: `radial-gradient(1200px 500px at 10% -10%, rgba(207, 234, 120, 0.28), transparent 55%),
    radial-gradient(900px 400px at 100% 0%, rgba(242, 200, 167, 0.30), transparent 50%),
    #F4F1E8`,
    bar: '#FFFEFA',
    barScrolled: 'rgba(255, 254, 250, 0.86)',
    barInk: '#123C2D',
    barMuted: '#66756D',
    barActive: '#E4EBD8',
    nav: 'rgba(255, 254, 250, 0.94)',
    barBorder: '#DCE1D8',
  },
  shadow: {
    card: '0 14px 34px rgba(23, 49, 40, 0.10)',
    soft: '0 2px 10px rgba(23, 49, 40, 0.06)',
    lift: '0 18px 44px rgba(23, 49, 40, 0.14)',
    dialog: '0 24px 64px rgba(12, 32, 24, 0.24)',
    focus: '0 0 0 3px rgba(207, 234, 120, 0.9), 0 0 0 5px rgba(18, 60, 45, 0.55)',
  },
  motion: {
    fast: '140ms',
    base: '220ms',
    slow: '360ms',
    ease: 'cubic-bezier(0.2, 0, 0, 1)',
    spring: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  z: {
    bottomNav: 40,
    topBar: 45,
    demoBar: 50,
    menu: 55,
    dialog: 60,
    dialogTop: 70,
    floating: 35,
  },
  breakpoints: {
    sm: '640px',
    md: '900px',
    lg: '1280px',
  },
  fonts: {
    // Inter has no Hebrew glyphs, so Rubik picks up body text in RTL.
    body: "'Inter', 'Rubik', system-ui, sans-serif",
    // DM Serif Display carries no Hebrew glyphs, so Frank Ruhl Libre picks up RTL text.
    display: "'DM Serif Display', 'Frank Ruhl Libre', Georgia, serif",
    /** DM Serif Display ships a single regular weight; bolding it would synthesise strokes. */
    displayWeight: 400,
    displayTracking: '-0.01em',
  },
  /** Type scale. Shared components pick from it instead of one-off sizes. */
  text: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    xxl: '32px',
    display: 'clamp(30px, 4vw, 42px)',
  },
  /** Control heights: compact and touch. */
  control: {
    sm: '36px',
    md: '44px',
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
    max: '1440px',
    /** Home uses a wider shell so the feed can grow without stretching other pages. */
    homeMax: '1680px',
    demoBar: '44px',
    topBar: '80px',
    bottomNav: '72px',
    sideNav: '240px',
  },
} as const

export type AppTheme = typeof theme
