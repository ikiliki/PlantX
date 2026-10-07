export const theme = {
  colors: {
    /** Leaf green: primary actions and active text. */
    forest: '#1F5135',
    forestMid: '#2A6643',
    forestSoft: '#347A50',
    moss: '#5B8C3E',
    /** Sunshine: the one bright accent, for active states and the growth action. */
    growth: '#FFC94A',
    /** Terracotta pot. */
    warmth: '#F08A5D',
    lime: '#FFC94A',
    green: '#5B8C3E',
    greenDark: '#2A6643',
    cream: '#FFF8EC',
    creamCard: '#FFFFFF',
    ink: '#20302A',
    /** Secondary text; 6:1 on the warm page. */
    muted: '#56625C',
    border: '#EFE4CF',
    /** Stronger edge for controls (inputs, segmented rows). */
    borderStrong: '#E0D2B6',
    chipGreen: '#E3F2D6',
    chipWarm: '#FFEFD0',
    chipNeutral: '#FBF3E3',
    chipDanger: '#FCE1D6',
    chipInfo: '#E3F0FA',
    chipAi: '#E3EEFB',
    track: '#F1E7D3',
    danger: '#C2492B',
    warn: '#9A6312',
    info: '#2F6B9A',
    /** AI provenance: the ✦ stamp and the AI chip. */
    aiBlue: '#3B7CC9',
    /** Watering care tone (todo icons, calendar). */
    water: '#3B8FD9',
    /** Neutral metal for photo-only marks. */
    metal: '#8B929A',
    /** Market direction tones. */
    up: '#2A6643',
    down: '#C2492B',
    overlay: 'rgba(32, 48, 42, 0.42)',
  },
  radii: {
    sm: '12px',
    md: '18px',
    lg: '26px',
    pill: '999px',
    /** Buttons, chips and segmented items: soft pebbles. */
    control: '999px',
  },
  /** Page and chrome backgrounds (CSS background values). */
  surface: {
    /** Warm paper with morning sun coming in from the top start corner. */
    page: `radial-gradient(900px 420px at 0% -10%, rgba(255, 201, 74, 0.22), transparent 60%),
    #FFF8EC`,
    bar: '#FFF8EC',
    barScrolled: '#FFF8EC',
    barInk: '#1F5135',
    barMuted: '#56625C',
    barActive: '#FFC94A',
    nav: '#1F5135',
    barBorder: 'transparent',
    /** The floating dock that carries the main navigation. */
    dock: '#1F5135',
    dockInk: '#FFF8EC',
    dockMuted: 'rgba(255, 248, 236, 0.72)',
    dockActive: '#FFC94A',
  },
  shadow: {
    /** Clay: a soft drop under the object plus a faint lower lip, as if it were moulded. */
    card: '0 2px 0 rgba(31, 81, 53, 0.05), 0 16px 32px -10px rgba(31, 81, 53, 0.22)',
    soft: '0 1px 0 rgba(31, 81, 53, 0.06), 0 6px 14px -6px rgba(31, 81, 53, 0.18)',
    lift: '0 3px 0 rgba(31, 81, 53, 0.05), 0 26px 44px -14px rgba(31, 81, 53, 0.32)',
    dialog: '0 30px 70px -10px rgba(31, 81, 53, 0.35)',
    focus: '0 0 0 3px #FFF8EC, 0 0 0 6px #FFC94A',
  },
  motion: {
    fast: '150ms',
    base: '260ms',
    slow: '420ms',
    /** Back-out: arrivals overshoot a touch and settle, like a bouncy seedling. */
    ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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
    // Nunito has no Hebrew glyphs, so Rubik picks up body text in RTL.
    body: "'Nunito', 'Rubik', system-ui, sans-serif",
    // Fredoka carries Hebrew glyphs, so RTL headings stay rounded too.
    display: "'Fredoka', 'Rubik', system-ui, sans-serif",
    displayWeight: 600,
    displayTracking: '-0.01em',
  },
  /** Type scale. Shared components pick from it instead of one-off sizes. */
  text: {
    xs: '12px',
    sm: '13px',
    base: '15px',
    md: '17px',
    lg: '21px',
    xl: '26px',
    xxl: '34px',
    display: 'clamp(34px, 4.5vw, 52px)',
  },
  /** Micro-label voice (chips, section labels, stamps). Garden speaks plainly, in sentence case. */
  type: {
    labelCase: 'none',
    labelTracking: '0',
  },
  /** Control heights: compact and touch. Chunky, thumb-friendly. */
  control: {
    sm: '38px',
    md: '48px',
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
    topBar: '72px',
    /** Height of the chrome above the page on desktop (the slim top bar; the nav floats at the bottom). */
    chromeTop: '72px',
    bottomNav: '84px',
    sideNav: '240px',
  },
} as const

export type AppTheme = typeof theme
