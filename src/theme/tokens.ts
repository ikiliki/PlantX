export const theme = {
  colors: {
    /** Editorial ink: a green so deep it reads as black type. */
    forest: '#1C2721',
    forestMid: '#2A3730',
    forestSoft: '#34433A',
    moss: '#5F6F55',
    /** Sage, not lime: the accent is a quiet highlight, like a marker on paper. */
    growth: '#D7E2B0',
    warmth: '#F2C8A7',
    /** Legacy aliases kept so existing pages pick up the new palette. */
    lime: '#D7E2B0',
    green: '#5D7C4E',
    greenDark: '#2F6B4A',
    cream: '#F7F4EC',
    creamCard: '#FFFDF8',
    ink: '#1A201C',
    muted: '#59615B',
    border: '#E3DED2',
    /** Stronger hairline for controls (inputs, segmented rows). */
    borderStrong: '#CFC8B8',
    chipGreen: '#ECEFE0',
    chipWarm: '#F6EBDD',
    chipNeutral: '#F1EDE3',
    chipDanger: '#F6DED4',
    chipInfo: '#E8F1F7',
    chipAi: '#E8F1FB',
    track: '#E8E3D6',
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
    sm: '3px',
    md: '4px',
    lg: '6px',
    pill: '999px',
    /** Buttons, chips and segmented items: square-cut, like set type. */
    control: '3px',
  },
  /** Page and chrome backgrounds (CSS background values). */
  surface: {
    /** One paper from masthead to footer; an ink rule separates the chrome. */
    page: '#F7F4EC',
    bar: '#F7F4EC',
    barScrolled: 'rgba(247, 244, 236, 0.94)',
    barInk: '#1A201C',
    barMuted: '#59615B',
    barActive: '#ECEFE0',
    nav: 'rgba(247, 244, 236, 0.97)',
    barBorder: '#1A201C',
  },
  shadow: {
    card: '0 1px 0 rgba(26, 32, 28, 0.06), 0 12px 32px rgba(26, 32, 28, 0.08)',
    soft: '0 1px 0 rgba(26, 32, 28, 0.08)',
    lift: '0 10px 30px rgba(26, 32, 28, 0.10)',
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
    // Public Sans has no Hebrew glyphs, so Rubik picks up body text in RTL.
    body: "'Public Sans', 'Rubik', system-ui, sans-serif",
    // Libre Bodoni carries no Hebrew glyphs, so Frank Ruhl Libre picks up RTL text.
    display: "'Libre Bodoni', 'Frank Ruhl Libre', Georgia, serif",
    displayWeight: 500,
    displayTracking: '-0.015em',
  },
  /** Type scale. Shared components pick from it instead of one-off sizes. */
  text: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    xxl: '36px',
    display: 'clamp(36px, 5vw, 60px)',
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
