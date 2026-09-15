import { createGlobalStyle } from 'styled-components'
import { theme } from './tokens'

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    font-family: ${theme.fonts.body};
    background: ${theme.colors.cream};
    color: ${theme.colors.ink};
    -webkit-font-smoothing: antialiased;
  }
  button, input, select, textarea {
    font: inherit;
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }
  h1, h2, h3, h4 {
    font-family: ${theme.fonts.display};
    margin: 0;
  }
  p { margin: 0; }
  ::selection {
    background: ${theme.colors.lime};
    color: ${theme.colors.forest};
  }
`
