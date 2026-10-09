/**
 * Two gardens, one set of names. Every colour, surface and shadow is a CSS variable (`theme.colors.forest` is
 * `var(--c-forest)`), so styled-components follow the mode without re-rendering. `GlobalStyle` writes the raw
 * values below for each mode; `themeMode.ts` picks the mode.
 */

/** Sunny garden: production's cream and lime, with a lighter leaf green. */
const day = {
  colors: {
    /** Leaf green: primary actions and active text. */
    forest: '#1F5135',
    forestMid: '#2A6643',
    forestSoft: '#347A50',
    moss: '#5B8C3E',
    /** Fresh lime: the one bright accent, for active states and the growth action. */
    growth: '#CFEA78',
    /** Soft peach. */
    warmth: '#F2C8A7',
    lime: '#CFEA78',
    green: '#5B8C3E',
    greenDark: '#2A6643',
    /** A leaf-green surface that stays deep in both gardens (dock, level badge). */
    deep: '#1F5135',
    onDeep: '#F4F1E8',
    /** Text and icons on the lime accent: dark in both gardens. */
    onGrowth: '#173A26',
    cream: '#F4F1E8',
    creamCard: '#FFFFFF',
    ink: '#20302A',
    /** Secondary text; 6:1 on the warm page. */
    muted: '#56625C',
    border: '#DCE1D8',
    /** Stronger edge for controls (inputs, segmented rows). */
    borderStrong: '#C9D0C4',
    chipGreen: '#E4EBD8',
    chipWarm: '#FFF0D8',
    chipNeutral: '#EEF0E6',
    chipDanger: '#FCE1D6',
    chipInfo: '#E3F0FA',
    chipAi: '#E3EEFB',
    track: '#E7E3D6',
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
  surface: {
    /** Production's cream with a fresh lime glow from the top start corner. */
    page: 'radial-gradient(1100px 480px at 0% -10%, rgba(207, 234, 120, 0.3), transparent 60%), #F4F1E8',
    bar: '#F4F1E8',
    barScrolled: '#F4F1E8',
    barInk: '#1F5135',
    barMuted: '#56625C',
    barActive: '#CFEA78',
    nav: '#1F5135',
    barBorder: 'transparent',
    /** The floating dock that carries the main navigation. */
    dock: '#1F5135',
    dockInk: '#F4F1E8',
    dockMuted: 'rgba(244, 241, 232, 0.72)',
    dockActive: '#CFEA78',
    dockEdge: 'transparent',
  },
  shadow: {
    /** Clay: a soft drop under the object plus a faint lower lip, as if it were moulded. */
    card: '0 2px 0 rgba(31, 81, 53, 0.05), 0 16px 32px -10px rgba(31, 81, 53, 0.22)',
    soft: '0 1px 0 rgba(31, 81, 53, 0.06), 0 6px 14px -6px rgba(31, 81, 53, 0.18)',
    lift: '0 3px 0 rgba(31, 81, 53, 0.05), 0 26px 44px -14px rgba(31, 81, 53, 0.32)',
    dialog: '0 30px 70px -10px rgba(31, 81, 53, 0.35)',
    focus: '0 0 0 3px #F4F1E8, 0 0 0 6px #CFEA78',
  },
}

/** Night garden: the same bench at dusk. A muted green-grey, moonlit leaves, the same lime accent. */
const night: typeof day = {
  colors: {
    forest: '#C4EAAE',
    forestMid: '#B2DF98',
    forestSoft: '#9DD283',
    moss: '#9ACB7C',
    growth: '#CFEA78',
    warmth: '#F2C8A7',
    lime: '#CFEA78',
    green: '#9ACB7C',
    greenDark: '#B2DF98',
    /** Still deeper than the page, so the dock and the level badge anchor it. */
    deep: '#1A2B22',
    onDeep: '#F0F5EC',
    onGrowth: '#173A26',
    cream: '#24332B',
    creamCard: '#2F4137',
    ink: '#F0F5EC',
    /** 7:1 on the page. */
    muted: '#B9C8BE',
    border: '#3C5046',
    borderStrong: '#4B6155',
    chipGreen: '#36513F',
    chipWarm: '#4B402A',
    chipNeutral: '#2B3B32',
    chipDanger: '#4E352C',
    chipInfo: '#2E4253',
    chipAi: '#2F4058',
    track: '#3A4C42',
    danger: '#F49A80',
    warn: '#ECBA5E',
    info: '#8CC0EC',
    aiBlue: '#8AB8F2',
    water: '#82BCF2',
    metal: '#A7AFB6',
    up: '#9EDB8A',
    down: '#F49A80',
    overlay: 'rgba(12, 18, 15, 0.55)',
  },
  surface: {
    /** Dusk: a muted green-grey page with a faint lime glow from the top end corner. */
    page: 'radial-gradient(900px 420px at 100% -10%, rgba(207, 234, 120, 0.1), transparent 60%), #24332B',
    bar: '#24332B',
    barScrolled: '#24332B',
    barInk: '#C4EAAE',
    barMuted: '#B9C8BE',
    barActive: '#CFEA78',
    nav: '#1A2B22',
    barBorder: 'transparent',
    dock: '#1A2B22',
    dockInk: '#F0F5EC',
    dockMuted: 'rgba(240, 245, 236, 0.72)',
    dockActive: '#CFEA78',
    dockEdge: 'rgba(196, 234, 174, 0.16)',
  },
  shadow: {
    card: '0 2px 0 rgba(10, 18, 14, 0.18), 0 16px 32px -10px rgba(10, 18, 14, 0.45)',
    soft: '0 1px 0 rgba(10, 18, 14, 0.18), 0 6px 14px -6px rgba(10, 18, 14, 0.38)',
    lift: '0 3px 0 rgba(10, 18, 14, 0.18), 0 26px 44px -14px rgba(10, 18, 14, 0.55)',
    dialog: '0 30px 70px -10px rgba(10, 18, 14, 0.6)',
    focus: '0 0 0 3px #24332B, 0 0 0 6px #CFEA78',
  },
}

export const palettes = { day, night }
export type GardenMode = keyof typeof palettes

type Palette = typeof day
const PREFIX = { colors: 'c', surface: 's', shadow: 'sh' } as const

/** `{ forest: '#1F5135' }` → `{ forest: 'var(--c-forest)' }`. */
function asVars<G extends keyof typeof PREFIX>(group: G): { [K in keyof Palette[G]]: string } {
  const out = {} as Record<string, string>
  for (const key of Object.keys(day[group])) out[key] = `var(--${PREFIX[group]}-${key})`
  return out as { [K in keyof Palette[G]]: string }
}

/** The custom-property declarations for one garden. */
export function paletteCss(mode: GardenMode): string {
  const palette = palettes[mode]
  return (Object.keys(PREFIX) as (keyof typeof PREFIX)[])
    .flatMap((group) =>
      Object.entries(palette[group]).map(([key, value]) => `--${PREFIX[group]}-${key}: ${value};`),
    )
    .join('\n')
}

export const theme = {
  colors: asVars('colors'),
  surface: asVars('surface'),
  shadow: asVars('shadow'),
  radii: {
    sm: '12px',
    md: '18px',
    lg: '26px',
    pill: '999px',
    /** Buttons, chips and segmented items: soft pebbles. */
    control: '999px',
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
