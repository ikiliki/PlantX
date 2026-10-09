import { createGlobalStyle } from 'styled-components'
import { paletteCss, theme } from './tokens'

export const GlobalStyle = createGlobalStyle`
  /* Sunny garden by default; night garden when chosen, or when the device is dark and nothing was chosen. */
  :root {
    color-scheme: light;
    ${paletteCss('day')}
  }
  :root[data-theme='night'] {
    color-scheme: dark;
    ${paletteCss('night')}
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='day']) {
      color-scheme: dark;
      ${paletteCss('night')}
    }
  }

  /* Switching gardens: the new one spreads out from the toggle (see themeMode.ts). */
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }

  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  html {
    scroll-behavior: smooth;
    /* Always show the bar so a popup's scroll lock cannot widen the page into the gap it leaves. */
    overflow-y: scroll;
    scrollbar-gutter: stable;
    scrollbar-color: color-mix(in srgb, ${theme.colors.forest} 28%, transparent) transparent;
    -webkit-text-size-adjust: 100%;
  }
  body {
    margin: 0;
    font-family: ${theme.fonts.body};
    background: ${theme.colors.cream};
    color: ${theme.colors.ink};
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
    text-rendering: optimizeLegibility;
    overflow-wrap: break-word;
    overflow-x: clip;
  }
  button, input, select, textarea {
    font: inherit;
  }
  button, a, [role='tab'], summary {
    touch-action: manipulation;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }
  h1, h2, h3, h4 {
    font-family: ${theme.fonts.display};
    font-weight: ${theme.fonts.displayWeight};
    letter-spacing: ${theme.fonts.displayTracking};
    text-wrap: balance;
    margin: 0;
  }
  p { margin: 0; text-wrap: pretty; }
  table, time { font-variant-numeric: tabular-nums; }
  ::selection {
    background: ${theme.colors.growth};
    color: ${theme.colors.forest};
  }
  :focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, ${theme.colors.forest} 22%, transparent);
    border: 3px solid transparent;
    border-radius: ${theme.radii.pill};
    background-clip: padding-box;
  }
  ::-webkit-scrollbar-thumb:hover { background-color: color-mix(in srgb, ${theme.colors.forest} 38%, transparent); }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: 1ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 1ms !important;
    }
  }
`
