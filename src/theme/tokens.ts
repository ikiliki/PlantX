export const theme = {
  colors: {
    forest: '#0F2A1E',
    forestMid: '#163626',
    forestSoft: '#1E4231',
    moss: '#5D7C4E',
    /** Electric lime: the one loud colour, for active states and the growth action. */
    growth: '#B8F04A',
    warmth: '#F2C8A7',
    /** Legacy aliases kept so existing pages pick up the new palette. */
    lime: '#B8F04A',
    green: '#5D7C4E',
    greenDark: '#2F6B4A',
    cream: '#F2F4F0',
    creamCard: '#FFFFFF',
    ink: '#0F1A14',
    muted: '#515E57',
    border: '#E1E5DF',
    /** Stronger hairline for controls (inputs, segmented rows). */
    borderStrong: '#C8CFC9',
    chipGreen: '#E6F5CF',
    chipWarm: '#FFF0D8',
    chipNeutral: '#EEF1EC',
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
    sm: '8px',
    md: '12px',
    lg: '18px',
    pill: '999px',
    /** Buttons, chips and segmented items: soft squares, not pills. */
    control: '12px',
  },
  /** Page and chrome backgrounds (CSS background values). */
  surface: {
    /** Dark night-greenhouse chrome around a cool light page. */
    page: '#F2F4F0',
    bar: '#0C1712',
    barScrolled: 'rgba(12, 23, 18, 0.92)',
    barInk: '#F1F5EE',
    barMuted: '#A3B3AA',
    barActive: 'rgba(184, 240, 74, 0.16)',
    nav: 'rgba(12, 23, 18, 0.96)',
    barBorder: 'rgba(255, 255, 255, 0.08)',
  },
  shadow: {
    card: '0 1px 2px rgba(15, 26, 20, 0.06), 0 8px 24px rgba(15, 26, 20, 0.08)',
    soft: '0 1px 2px rgba(15, 26, 20, 0.08)',
    lift: '0 2px 6px rgba(15, 26, 20, 0.06), 0 16px 36px rgba(15, 26, 20, 0.12)',
    dialog: '0 24px 64px rgba(12, 32, 24, 0.24)',
    focus: '0 0 0 3px rgba(184, 240, 74, 0.9), 0 0 0 5px rgba(15, 42, 30, 0.6)',
  },
  motion: {
    fast: '120ms',
    base: '200ms',
    slow: '320ms',
    /** Expo-out: quick to answer, long soft landing. */
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
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
    // DM Sans and Space Grotesk have no Hebrew glyphs, so Rubik picks up RTL text.
    body: "'DM Sans', 'Rubik', system-ui, sans-serif",
    display: "'Space Grotesk', 'Rubik', system-ui, sans-serif",
    displayWeight: 600,
    displayTracking: '-0.03em',
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
  /** Micro-label voice (chips, section labels, stamps). Modern sets them as tight capitals. */
  type: {
    labelCase: 'uppercase',
    labelTracking: '0.04em',
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
