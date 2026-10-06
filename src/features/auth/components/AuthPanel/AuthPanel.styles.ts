import styled, { css } from 'styled-components'
import { popIn, pressable, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const onForest = (alpha: number) => `rgba(244, 241, 232, ${alpha})`

export const Shell = styled.div<{ $dialog?: boolean }>`
  display: grid;
  /* One column as wide as the card: an auto column grows to the Google button and consent line and clips them. */
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  min-width: 0;
  min-height: ${({ $dialog }) => ($dialog ? 'auto' : '100svh')};
  padding: ${({ $dialog }) => ($dialog ? '28px 22px 24px' : 'clamp(24px, 5vw, 48px) 20px')};
  overflow: auto;
  color: ${theme.colors.cream};
  font-family: ${theme.fonts.body};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  background:
    radial-gradient(120% 80% at 12% -10%, rgba(207, 234, 120, 0.28), transparent 55%),
    radial-gradient(90% 70% at 100% 110%, rgba(242, 200, 167, 0.18), transparent 50%),
    linear-gradient(165deg, ${theme.colors.forestSoft}, ${theme.colors.forest});
  ${({ $dialog }) =>
    $dialog &&
    css`
      width: 100%;
      border-radius: ${theme.radii.lg};
      box-shadow: ${theme.shadow.dialog};
    `}
`

export const Stack = styled.div<{ $dialog?: boolean }>`
  display: grid;
  justify-items: center;
  gap: ${({ $dialog }) => ($dialog ? '18px' : '28px')};
  width: min(320px, 100%);
  min-width: 0;
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} both;
`

export const Brand = styled.div<{ $compact?: boolean }>`
  display: grid;
  justify-items: center;
  gap: ${({ $compact }) => ($compact ? '8px' : '12px')};
  text-align: center;
`

export const BrandMark = styled.img<{ $compact?: boolean }>`
  width: ${({ $compact }) => ($compact ? '40px' : '56px')};
  height: ${({ $compact }) => ($compact ? '40px' : '56px')};
  padding: ${({ $compact }) => ($compact ? '8px' : '10px')};
  border-radius: ${theme.radii.pill};
  background: ${onForest(0.12)};
  box-shadow: 0 0 0 1px ${onForest(0.18)};
  animation: ${popIn} ${theme.motion.slow} ${theme.motion.spring} both;
`

export const BrandName = styled.p`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-size: clamp(34px, 5.5vw, 44px);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: ${theme.colors.cream};
`

export const BrandTagline = styled.p`
  margin: 0;
  max-width: 26ch;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.01em;
  color: ${onForest(0.72)};
`

export const Panel = styled.div`
  display: grid;
  gap: 14px;
  width: 100%;
`

export const Title = styled.h1<{ $compact?: boolean }>`
  margin: 0;
  text-align: center;
  font-family: ${theme.fonts.body};
  font-size: ${({ $compact }) => ($compact ? '22px' : 'clamp(24px, 4vw, 28px)')};
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: ${theme.colors.cream};
`

export const Lead = styled.p<{ $compact?: boolean }>`
  margin: 0;
  text-align: center;
  font-size: ${({ $compact }) => ($compact ? '13px' : '14px')};
  font-weight: 400;
  line-height: 1.55;
  letter-spacing: 0.01em;
  color: ${onForest(0.7)};
`

export const Pending = styled.p`
  margin: 0;
  padding: 14px 18px;
  border-radius: ${theme.radii.lg};
  background: ${onForest(0.12)};
  box-shadow: inset 0 0 0 1px ${onForest(0.18)};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.01em;
  color: ${theme.colors.cream};
`

export const GoogleSlot = styled.div`
  display: grid;
  place-items: center;
  min-height: 44px;
  width: 100%;
  padding: 4px 0 8px;
`

export const ErrorText = styled.p`
  margin: 0;
  padding: 0 4px;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.45;
  letter-spacing: 0.01em;
  color: ${theme.colors.warmth};
`

export const Submit = styled.button`
  ${pressable}
  min-height: 48px;
  margin: 2px 0 0;
  padding: 0 18px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${onForest(0.92)};
  color: ${theme.colors.forest};
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  &:hover {
    background: ${theme.colors.cream};
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 3px;
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

export const Foot = styled.div`
  display: grid;
  gap: 8px;
  justify-items: center;
  padding-top: 2px;
  text-align: center;
`

export const TextButton = styled.button`
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${theme.colors.growth};
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.01em;
  cursor: pointer;
  &:hover {
    color: ${theme.colors.cream};
  }
`

/** The Terms checkbox above the sign-in button. */
export const Consent = styled.label`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.5;
  color: ${theme.colors.cream};
  cursor: pointer;
  text-align: start;

  input {
    flex: none;
    inline-size: 18px;
    block-size: 18px;
    margin: 1px 0 0;
    accent-color: ${theme.colors.growth};
    cursor: pointer;
  }

  a {
    color: ${theme.colors.growth};
    font-weight: 600;
  }
`

/** Google's button is an iframe: until the box is ticked, it cannot be clicked. */
export const GoogleGate = styled.div<{ $locked: boolean }>`
  display: grid;
  justify-items: center;
  transition: opacity ${theme.motion.fast} ${theme.motion.ease};
  opacity: ${({ $locked }) => ($locked ? 0.45 : 1)};
  pointer-events: ${({ $locked }) => ($locked ? 'none' : 'auto')};
`
