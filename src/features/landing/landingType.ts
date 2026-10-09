import { css, keyframes } from 'styled-components'
import { theme } from '../../theme/tokens'

/** Shared voice for the landing's section heads, so every section reads as one page. */
export const sectionTitle = css`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: clamp(34px, 5.6cqi, 58px);
  line-height: 1.02;
  letter-spacing: -0.02em;
  text-wrap: balance;
  color: ${theme.colors.forest};
`

export const sectionLead = css`
  margin: 0;
  max-width: 56ch;
  color: ${theme.colors.muted};
  font-size: 18px;
  line-height: 1.6;
  text-wrap: pretty;
`

/** Section labels stay for screen readers; the heading carries the section on screen. */
export const srOnly = css`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
`

const rise = keyframes`
  from { opacity: 0; transform: translateY(28px) scale(0.98); }
  to { opacity: 1; transform: none; }
`

/** Rises in as it scrolls into view (scroll-driven where supported; simply shown elsewhere). */
export const scrollReveal = css`
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      animation: ${rise} linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 60%;
    }
  }
`
