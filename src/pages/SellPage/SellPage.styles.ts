import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Layout = styled.div<{ $composer?: boolean }>`
  display: grid;
  gap: ${({ $composer }) => ($composer ? '0' : theme.space.xl)};
  align-items: start;
  @media (min-width: 1000px) {
    grid-template-columns: ${({ $composer }) => ($composer ? '1fr' : '330px 1fr')};
    gap: ${({ $composer }) => ($composer ? '0' : '60px')};
  }
`

export const Intro = styled.aside`
  display: grid;
  gap: ${theme.space.md};
  align-content: start;
`

export const Eyebrow = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.moss};
`

export const IntroTitle = styled.h1`
  font-size: clamp(32px, 4vw, 44px);
  line-height: 1.1;
  color: ${theme.colors.ink};
`

export const IntroText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`

export const BotanicalDetail = styled.div`
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  aspect-ratio: 330 / 300;
  background: ${theme.colors.chipGreen};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const FormPanel = styled.div`
  display: grid;
  gap: ${theme.space.lg};
`

export const ProgressRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-inline-end: 36px;
`

export const StepChip = styled.span<{ $on?: boolean; $done?: boolean }>`
  padding: 6px 10px;
  border-radius: ${theme.radii.pill};
  font-size: 11px;
  font-weight: ${({ $on }) => ($on ? 700 : 500)};
  background: ${({ $on, $done }) =>
    $on ? theme.colors.growth : $done ? theme.colors.chipGreen : theme.colors.chipNeutral};
  color: ${({ $on, $done }) => ($on || $done ? theme.colors.forest : theme.colors.muted)};
`

export const Prompt = styled.p`
  font-size: clamp(18px, 2vw, 22px);
  font-family: ${theme.fonts.display};
  color: ${theme.colors.ink};
`

export const DetailsGrid = styled.div`
  display: grid;
  gap: 12px;
  @media (min-width: 700px) {
    grid-template-columns: 1fr 1fr;
  }
`

export const FieldBox = styled.label`
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};

  > span {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: ${theme.type.labelTracking};
    text-transform: ${theme.type.labelCase};
    color: ${theme.colors.moss};
  }

  input,
  select {
    border: none;
    background: transparent;
    border-radius: 0;
    padding: 0;
    font-size: 14px;
    color: ${theme.colors.ink};
    width: 100%;
    &:focus {
      outline: none;
    }
  }
`

export const FormActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.md};
`

export const Composer = styled.form`
  display: grid;
  gap: 28px;
`

export const ComposerStage = styled.div`
  display: grid;
  gap: 24px;
  align-items: stretch;

  @media (min-width: 800px) {
    grid-template-columns: minmax(260px, 0.86fr) 1.14fr;
    gap: 36px;
  }
`

export const HeroPhoto = styled.div`
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  background: ${theme.colors.chipGreen};

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (min-width: 800px) {
    aspect-ratio: auto;
    min-height: 460px;
  }
`

export const ComposerCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 0;
`

export const Identity = styled.div`
  display: grid;
  gap: 6px;
`

export const ClassTitle = styled.h2`
  font-size: clamp(30px, 3.4vw, 42px);
  line-height: 1.08;
  color: ${theme.colors.ink};
  text-wrap: balance;
`

export const ClassCode = styled.p`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: ${theme.colors.forest};
`

export const CodeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`

export const Blocker = styled.p`
  padding: 10px 12px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipWarm};
  color: ${theme.colors.ink};
  font-size: 14px;
  line-height: 1.4;
`

export const MetaLine = styled.p`
  font-size: 14px;
  line-height: 1.45;
  color: ${theme.colors.muted};
`

export const PriceBlock = styled.div`
  display: grid;
  gap: 8px;
`

export const PriceCaption = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.moss};
`

export const PriceWell = styled.label`
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 14px 18px 12px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-block-end: 2px solid ${theme.colors.forest};

  &:focus-within {
    border-color: ${theme.colors.forest};
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-growth) 65%, transparent);
  }

  input {
    flex: 1;
    min-width: 0;
    width: 100%;
    border: none;
    background: transparent;
    padding: 0;
    font-family: ${theme.fonts.display};
    font-size: clamp(40px, 5vw, 56px);
    line-height: 1;
    color: ${theme.colors.ink};
    appearance: textfield;

    &:focus {
      outline: none;
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      appearance: none;
      margin: 0;
    }
  }
`

export const CurrencyMark = styled.span`
  font-family: ${theme.fonts.display};
  font-size: clamp(28px, 3vw, 36px);
  line-height: 1;
  color: ${theme.colors.moss};
`

export const PriceHint = styled.p`
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const QuietRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px 28px;
`

export const QuietGroup = styled.div`
  display: grid;
  gap: 8px;
  justify-items: start;
`

export const QuietLabel = styled.span`
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const UnitTrack = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
`

export const UnitPill = styled.button<{ $on?: boolean }>`
  padding: 6px 12px;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  background: ${({ $on }) => ($on ? theme.colors.forest : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.cream : theme.colors.muted)};
  font-size: 13px;
  font-weight: ${({ $on }) => ($on ? 700 : 500)};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${theme.colors.forest};
    outline-offset: 2px;
  }
`

export const Switch = styled.button<{ $on?: boolean }>`
  position: relative;
  width: 44px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.track)};
  cursor: pointer;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    inset-inline-start: ${({ $on }) => ($on ? '21px' : '3px')};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ $on }) => ($on ? theme.colors.growth : theme.colors.creamCard)};
    transition: inset-inline-start 0.16s ease;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.forest};
    outline-offset: 2px;
  }
`

export const ActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 8px;

  button[type='submit'] {
    flex: 1;
    min-height: 48px;
    font-size: 15px;
  }
`

export const Confirm = styled.div`
  display: grid;
  justify-items: center;
  gap: 8px;
  text-align: center;
  padding-block: 4px 8px;

  button {
    margin-top: 12px;
    min-width: 200px;
  }
`

export const ConfirmPhoto = styled.div`
  width: min(100%, 420px);
  aspect-ratio: 5 / 4;
  margin-bottom: 8px;
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  background: ${theme.colors.chipGreen};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const ConfirmMark = styled.div`
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-top: -32px;
  border-radius: 50%;
  background: ${theme.colors.growth};
  color: ${theme.colors.forest};
  box-shadow: ${theme.shadow.soft};
`

export const ConfirmTitle = styled.h2`
  margin-top: 4px;
  font-size: clamp(32px, 4vw, 44px);
  line-height: 1.1;
  color: ${theme.colors.ink};
`

export const ConfirmName = styled.p`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.forest};
`

export const ConfirmMeta = styled.p`
  font-size: 14px;
  color: ${theme.colors.muted};
`

export const ConfirmNote = styled.p`
  max-width: 36ch;
  font-size: 14px;
  line-height: 1.45;
  color: ${theme.colors.muted};
`
