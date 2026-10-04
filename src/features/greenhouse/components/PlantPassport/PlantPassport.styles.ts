import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'
import { popIn, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'
import type { PlantRarity } from '../../../../mock/types'

const onForest = (alpha: number) => `rgba(244, 241, 232, ${alpha})`
const stacked = '@container (max-width: 760px)'

export const Frame = styled.div`
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  min-height: 0;
  height: 100%;
`

export const Board = styled.article<{ $embedded?: boolean; $dialog?: boolean }>`
  display: grid;
  grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) auto;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  background: ${theme.colors.creamCard};
  ${({ $embedded, $dialog }) =>
    $dialog
      ? css`
          flex: 1 1 auto;
          height: 100%;
          min-height: 0;
          overflow: hidden;
        `
      : $embedded
        ? css`
            flex: 1 1 auto;
            height: 100%;
            @container (min-width: 761px) {
              overflow: visible;
              & > aside,
              & > div {
                overflow: visible;
              }
            }
          `
        : css`
            border: 1px solid ${theme.colors.border};
            border-radius: ${theme.radii.lg};
            box-shadow: ${theme.shadow.soft};
          `}
  ${stacked} {
    display: flex;
    flex-direction: column;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    overflow-y: auto;
    overscroll-behavior: contain;
    scroll-behavior: auto;
    background:
      linear-gradient(165deg, rgba(207, 234, 120, 0.5), rgba(255, 254, 250, 0.18) 42%, rgba(243, 246, 236, 0.96) 100%),
      #f3f6ec;
  }
`

export const Aside = styled.aside<{ $embedded?: boolean; $dialog?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  grid-column: 1;
  grid-row: 1 / -1;
  gap: ${theme.space.md};
  min-width: 0;
  padding: ${theme.space.xl} ${theme.space.lg} ${theme.space.lg};
  color: ${theme.colors.ink};
  background:
    linear-gradient(165deg, rgba(207, 234, 120, 0.5), rgba(255, 254, 250, 0.2) 58%),
    #f3f6ec;
  overflow-y: auto;
  scrollbar-width: thin;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(18, 60, 45, 0.28);
    border-radius: 99px;
  }
  ${({ $embedded, $dialog }) =>
    $dialog
      ? css`
          height: 100%;
          min-height: 0;
          overflow-y: auto;
          padding: ${theme.space.lg} ${theme.space.lg} ${theme.space.xl};
          gap: 12px;
        `
      : $embedded &&
        css`
          @container (min-width: 761px) {
            overflow: visible;
            height: 100%;
            padding: ${theme.space.lg} ${theme.space.lg} ${theme.space.xl};
            gap: 12px;
          }
        `}
  ${stacked} {
    order: 2;
    flex: 0 0 auto;
    grid-column: auto;
    grid-row: auto;
    height: auto;
    min-height: auto;
    overflow: visible;
    padding: 4px 14px 12px;
    gap: 10px;
    background: transparent;
  }
`

export const IdentityHead = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  ${stacked} {
    padding-inline-end: 48px;
    gap: 0;
  }
`

export const PhotoIconButton = styled.button`
  position: relative;
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
  border-radius: ${theme.radii.pill};
  transition: transform ${theme.motion.base} ${theme.motion.spring};
  &:hover {
    transform: scale(1.04);
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 3px;
  }
  ${stacked} {
    display: none;
  }
`

export const PhotoIcon = styled.div`
  position: relative;
  width: 84px;
  height: 84px;
  padding: 4px;
  border-radius: ${theme.radii.pill};
  background: rgba(255, 254, 250, 0.72);
  box-shadow: 0 0 0 1px rgba(18, 60, 45, 0.12);
  animation: ${popIn} ${theme.motion.slow} ${theme.motion.spring} backwards;
  overflow: visible;
  img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: ${theme.radii.pill};
    object-fit: cover;
    transition: transform ${theme.motion.slow} ${theme.motion.ease};
  }
  ${PhotoIconButton}:hover & img {
    transform: scale(1.06);
  }
  ${stacked} {
    width: 68px;
    height: 68px;
    animation: none;
  }
`

export const CareMarkSlot = styled.span`
  position: absolute;
  inset-inline-end: -4px;
  bottom: -4px;
  z-index: 2;
  line-height: 0;
  animation: ${popIn} ${theme.motion.slow} ${theme.motion.spring} both;
  ${stacked} {
    animation: none;
  }
`

export const NameBlock = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
  flex: 1 1 auto;
  padding-top: 2px;
`


export const TaxonomyRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 14px;
  line-height: 1.35;
`

/** A taxonomy name and its AI stamp: the stamp stays beside the name when the row wraps. */
export const TaxonomyItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  max-width: 100%;
`

export const CategoryName = styled.span`
  font-weight: 700;
  color: ${theme.colors.forest};
  text-decoration: none;
  &[href]:hover {
    text-decoration: underline;
  }
`

export const SubName = styled.span`
  font-weight: 700;
  color: ${theme.colors.forest};
`

export const TaxonomySep = styled.span`
  color: ${theme.colors.moss};
  font-weight: 700;
`

export const ShowMore = styled.button`
  justify-self: start;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${theme.colors.forest};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  ${stacked} {
    order: 4;
  }

  &:hover {
    text-decoration: underline;
  }
`

export const AsideStats = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${theme.space.sm};
  margin: 0;
  ${stacked} {
    order: 3;
  }
`

const asideStatTile = css`
  display: grid;
  gap: 2px;
  min-width: 0;
  position: relative;
  padding: 10px 12px;
  border: 1px solid rgba(18, 60, 45, 0.1);
  border-radius: ${theme.radii.md};
  background: rgba(255, 254, 250, 0.62);
  text-align: start;
  dt {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
  dd {
    margin: 0;
    overflow: hidden;
    font-size: 16px;
    font-weight: 800;
    color: ${theme.colors.forest};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

export const RarityBanner = styled.div<{ $rarity: PlantRarity }>`
  display: grid;
  place-items: center;
  min-height: 28px;
  padding: 4px 12px;
  border-radius: ${theme.radii.md};
  border: 1px solid
    ${({ $rarity }) =>
      $rarity === 'common' ? onForest(0.14) : $rarity === 'rare' ? 'rgba(207, 234, 120, 0.35)' : 'transparent'};
  background: ${({ $rarity }) =>
    $rarity === 'unique'
      ? theme.colors.growth
      : $rarity === 'rare'
        ? 'rgba(207, 234, 120, 0.2)'
        : onForest(0.1)};
  color: ${({ $rarity }) => ($rarity === 'unique' ? theme.colors.forest : onForest(0.88))};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  animation-delay: 60ms;
  ${stacked} {
    animation: none;
  }
`

export const AsideStat = styled.div`
  ${asideStatTile}
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  ${[1, 2, 3, 4, 5, 6].map((n) => `&:nth-child(${n}) { animation-delay: ${100 + n * 40}ms; }`).join('\n')}
  ${stacked} {
    animation: none;
  }
`

export const AsideStatButton = styled.button`
  ${asideStatTile}
  margin: 0;
  font: inherit;
  color: inherit;
  cursor: help;
  position: relative;
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  ${stacked} {
    animation: none;
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

export const AsideLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

/** Wide layout: labels over the owner and greenhouse rows, pushed to the bottom. Stacked, the rows sit under the name and the labels go. */
export const OwnerLabel = styled(AsideLabel)`
  margin-top: auto;
  ${stacked} {
    display: none;
  }
`

export const Main = styled.div<{ $embedded?: boolean; $dialog?: boolean }>`
  display: flex;
  flex-direction: column;
  grid-column: 2;
  grid-row: 2;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  ${({ $embedded, $dialog }) =>
    $dialog
      ? css`
          overflow: hidden;
        `
      : $embedded &&
        css`
          @container (min-width: 761px) {
            overflow: hidden;
          }
        `}
  ${stacked} {
    display: flex;
    order: 3;
    flex: 0 0 auto;
    grid-column: auto;
    grid-row: auto;
    height: auto;
    min-height: auto;
    overflow: visible;
  }
`

export const Code = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${theme.colors.muted};
`

export const Title = styled.h1`
  min-width: 0;
  max-width: 100%;
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: clamp(24px, 2.6vw, 30px);
  line-height: 1.12;
  letter-spacing: -0.01em;
  color: ${theme.colors.forest};
  white-space: normal;
  overflow-wrap: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;

  ${stacked} {
    font-size: clamp(20px, 5.5cqi, 24px);
    -webkit-line-clamp: 2;
  }
`

export const OwnerLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  max-width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(18, 60, 45, 0.1);
  border-radius: ${theme.radii.md};
  background: rgba(255, 254, 250, 0.62);
  color: ${theme.colors.ink};
  text-decoration: none;
  transition: background ${theme.motion.fast} ${theme.motion.ease};
  ${stacked} {
    order: 1;
  }
  &:hover {
    background: ${theme.colors.creamCard};
  }
`

/** The owner's greenhouse (level, XP, plants); stacked, it sits under the owner card. */
export const GreenhouseLink = styled(OwnerLink)`
  ${stacked} {
    order: 2;
  }
`

export const GreenhouseLabel = styled(AsideLabel)`
  ${stacked} {
    display: none;
  }
`

export const OwnerMeta = styled.span`
  display: grid;
  gap: 1px;
  min-width: 0;
`

export const OwnerName = styled.span`
  min-width: 0;
  overflow: hidden;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Rating = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${theme.colors.muted};
`

export const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

export const GradeMark = styled.span`
  flex: 0 0 auto;
  min-width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  padding-inline: 6px;
  border-radius: ${theme.radii.md};
  background: rgba(207, 234, 120, 0.16);
  color: ${theme.colors.growth};
  font-family: ${theme.fonts.display};
  font-size: 22px;
  line-height: 1;
`

export const PriceCaption = styled.span`
  flex: 1 0 100%;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${onForest(0.6)};
`

export const PriceWrap = styled.button`
  position: relative;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px 8px;
  min-width: 0;
  max-width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: help;
  border-radius: ${theme.radii.sm};
  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 4px;
  }
`

export const PriceTip = styled.span`
  position: absolute;
  z-index: 4;
  inset-block-start: calc(100% + 8px);
  inset-inline-start: 0;
  display: grid;
  gap: 6px;
  width: max-content;
  max-width: min(260px, 70vw);
  padding: 10px 12px;
  border-radius: 10px;
  background: ${theme.colors.ink};
  color: ${theme.colors.cream};
  box-shadow: ${theme.shadow.card};
  font-family: ${theme.fonts.body};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  text-align: start;
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition: opacity 0.15s ease, transform 0.15s ease;

  ${PriceWrap}:hover &,
  ${PriceWrap}:focus &,
  ${PriceWrap}:focus-visible &,
  ${AsideStatButton}:hover &,
  ${AsideStatButton}:focus &,
  ${AsideStatButton}:focus-visible & {
    opacity: 1;
    transform: none;
  }
`

export const TipLine = styled.span`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  white-space: nowrap;
  strong {
    font-weight: 700;
  }
`

export const PriceBlock = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 12px;
`

export const Price = styled.p`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-size: 36px;
  line-height: 1;
  color: ${theme.colors.cream};
`

export const Qty = styled.span`
  font-size: 14px;
  color: ${onForest(0.6)};
`

export const ActionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  align-items: center;
  button,
  a {
    width: 100%;
  }
  > :only-child {
    grid-column: 1 / -1;
  }
`

const linkButton = css<{ $tone?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.radii.pill};
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  ${({ $tone }) =>
    $tone === 'secondary'
      ? css`
          background: ${theme.colors.creamCard};
          color: ${theme.colors.forest};
          border: 1px solid ${theme.colors.border};
          &:hover {
            background: ${theme.colors.chipGreen};
          }
        `
      : css`
          background: ${theme.colors.forest};
          color: white;
          border: 1px solid ${theme.colors.forest};
          &:hover {
            background: ${theme.colors.forestMid};
          }
        `}
`

export const ListingLink = styled(Link)<{ $tone?: 'primary' | 'secondary' }>`
  ${linkButton}
`

export const TabBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  flex: 0 0 auto;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: 0 4px;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 16px;
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  ${stacked} {
    order: 3;
    top: -1px;
    padding: 0 8px;
    background: rgba(243, 246, 236, 0.94);
    backdrop-filter: blur(10px);
    border-bottom-color: rgba(18, 60, 45, 0.12);
  }
`

export const Tab = styled.button<{ $on?: boolean }>`
  appearance: none;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  margin-bottom: -1px;
  padding: 12px 14px 10px;
  border: 0;
  border-bottom: 2px solid ${({ $on }) => ($on ? theme.colors.ink : 'transparent')};
  background: transparent;
  color: ${({ $on }) => ($on ? theme.colors.ink : theme.colors.muted)};
  font: inherit;
  font-size: 15px;
  font-weight: ${({ $on }) => ($on ? 700 : 500)};
  text-align: start;
  white-space: normal;
  cursor: pointer;
  transition:
    color ${theme.motion.fast} ${theme.motion.ease},
    border-color ${theme.motion.base} ${theme.motion.ease};
  &:hover {
    color: ${theme.colors.ink};
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: -2px;
  }
  ${stacked} {
    padding: 8px 10px 8px;
    font-size: 14px;
  }
`

export const Panel = styled.div<{ $embedded?: boolean; $dialog?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  gap: 12px;
  padding: 16px 24px 24px;
  ${({ $embedded, $dialog }) =>
    $dialog
      ? css`
          flex: 0 0 260px;
          max-height: 260px;
          min-height: 260px;
          overflow-x: hidden;
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-gutter: stable;
          scrollbar-width: thin;
          scrollbar-color: rgba(93, 124, 78, 0.55) transparent;
          &::-webkit-scrollbar {
            width: 10px;
          }
          &::-webkit-scrollbar-thumb {
            border: 2px solid transparent;
            border-radius: 99px;
            background: rgba(93, 124, 78, 0.45);
            background-clip: padding-box;
          }
        `
      : $embedded &&
        css`
          @container (min-width: 761px) {
            flex: 0 0 auto;
            gap: 10px;
            padding: 12px 20px 16px;
          }
        `}
  ${stacked} {
    order: 4;
    flex: 0 0 auto;
    max-height: none;
    min-height: auto;
    overflow: visible;
    padding: 12px 14px 28px;
    gap: 10px;
    background: transparent;
  }
`

export const SectionTitle = styled.h3`
  font-size: 18px;
  color: ${theme.colors.ink};
`

export const Muted = styled.p`
  font-size: 14px;
  line-height: 1.45;
  color: ${theme.colors.muted};
`

export const Facts = styled.div`
  display: grid;
  gap: 14px;
  @container (min-width: 720px) {
    grid-template-columns: 1fr 1fr;
  }
`

export const Fact = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
  scroll-margin: 24px;
  &:focus {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: 4px;
    border-radius: ${theme.radii.sm};
  }
`

export const FactLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const FactValue = styled.span`
  font-size: 15px;
  color: ${theme.colors.ink};
  overflow-wrap: anywhere;
`

export const ParentLink = styled(Link)`
  font-size: 15px;
  font-weight: 700;
  color: ${theme.colors.forest};
`

/** "+2" on the small photo: the plant has more photos in the gallery. */
export const PhotoMore = styled.span`
  position: absolute;
  inset-block-end: -2px;
  inset-inline-end: -4px;
  display: grid;
  place-items: center;
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  border: 2px solid ${theme.colors.creamCard};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.growth};
  font-size: 11px;
  font-weight: 800;
  box-shadow: ${theme.shadow.soft};
`

export const ActivityBody = styled.div`
  display: grid;
  gap: 8px;
  justify-items: start;
  min-width: 0;
  width: 100%;

  > span:first-child {
    font-size: 15px;
    color: ${theme.colors.ink};
  }

  ${stacked} {
    gap: 6px;

    > ul {
      width: 100%;
      max-width: none;
      grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
    }
  }
`

export const Timeline = styled.ol`
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const TimelineRow = styled.li<{ $mark?: boolean }>`
  display: grid;
  gap: 2px 16px;
  padding: 8px 0;
  border-bottom: 1px solid ${theme.colors.border};
  border-radius: 10px;
  scroll-margin: 12px;
  ${({ $mark }) =>
    $mark &&
    css`
      margin-inline: -8px;
      padding-inline: 8px;
      background: ${theme.colors.chipGreen};
      border-inline-start: 3px solid ${theme.colors.forest};
    `}
  &:last-child {
    border-bottom: 0;
  }
  @container (min-width: 720px) {
    grid-template-columns: 148px minmax(0, 1fr);
    align-items: baseline;
  }
  ${stacked} {
    gap: 4px 10px;
    padding: 10px 0;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;

    time {
      font-size: 12px;
    }
  }
  time {
    font-size: 13px;
    color: ${theme.colors.muted};
  }
  > span {
    font-size: 15px;
    color: ${theme.colors.ink};
  }
`

export const GradeRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`

export const ClassBlock = styled.div`
  display: grid;
  gap: 6px;
  justify-items: start;
`

export const ClassLink = styled(Link)`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${theme.colors.forest};
`

export const ClassName = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.ink};
`

export const ClassPrice = styled.p`
  font-family: ${theme.fonts.display};
  font-size: 32px;
  line-height: 1;
  color: ${theme.colors.ink};
`

export const PerUnit = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 14px;
  color: ${theme.colors.muted};
`

export const CompList = styled.div`
  display: grid;
`

export const CompRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${theme.colors.border};
  font-size: 14px;
  &:last-child {
    border-bottom: 0;
  }
  strong {
    color: ${theme.colors.ink};
  }
`

export const Toast = styled.p`
  padding: 10px 12px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
  font-size: 14px;
  font-weight: 700;
`

export const Missing = styled.p`
  padding: 48px 24px;
  text-align: center;
  color: ${theme.colors.muted};
`

/** Owner's plant with an unknown place: a link to Settings. */
export const SetPlace = styled(Link)`
  color: ${theme.colors.warn};
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
`
