import { createGlobalStyle } from 'styled-components'
import { theme } from './tokens'

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  html {
    scroll-behavior: smooth;
    /* Always show the bar so a popup's scroll lock cannot widen the page into the gap it leaves. */
    overflow-y: scroll;
    scrollbar-gutter: stable;
    scrollbar-color: rgba(18, 60, 45, 0.28) transparent;
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
    /* DM Serif Display ships a single regular weight; bolding it would synthesise strokes. */
    font-weight: 400;
    letter-spacing: -0.01em;
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
    background: rgba(18, 60, 45, 0.22);
    border: 3px solid transparent;
    border-radius: ${theme.radii.pill};
    background-clip: padding-box;
  }
  ::-webkit-scrollbar-thumb:hover { background-color: rgba(18, 60, 45, 0.38); }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: 1ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 1ms !important;
    }
  }
`
