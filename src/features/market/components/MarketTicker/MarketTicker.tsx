import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { theme } from '../../../../theme/tokens'

const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`

const TrackWrap = styled.div`
  overflow: hidden;
  background: white;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.soft};
  margin-bottom: ${theme.space.lg};
  direction: ltr;
`

const Track = styled.div`
  display: flex;
  width: max-content;
  animation: ${scroll} 42s linear infinite;
  &:hover {
    animation-play-state: paused;
  }
`

const Item = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  color: ${theme.colors.ink};
  border-inline-end: 1px solid ${theme.colors.border};
  min-width: 220px;
  text-decoration: none;
  &:hover {
    background: rgba(31, 168, 90, 0.06);
  }
`

const Thumb = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
`

const Code = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: ${theme.colors.greenDark};
`

const Price = styled.div<{ $up: boolean }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ $up }) => ($up ? theme.colors.greenDark : theme.colors.danger)};
`

export function MarketTicker() {
  const { db } = useStore()
  const { formatMoney } = useI18n()
  const items = [...db.marketClasses, ...db.marketClasses]

  return (
    <TrackWrap aria-label="Market ticker">
      <Track>
        {items.map((mc, i) => (
          <Item key={`${mc.id}-${i}`} to={`/market/${mc.id}`}>
            <Thumb>
              <PlantImage src={mc.photo} alt="" />
            </Thumb>
            <div>
              <Code>{mc.code}</Code>
              <Price $up={mc.changePct >= 0}>
                {formatMoney(mc.lastPrice)}{' '}
                {mc.changePct >= 0 ? '▲' : '▼'} {Math.abs(mc.changePct).toFixed(1)}%
              </Price>
            </div>
          </Item>
        ))}
      </Track>
    </TrackWrap>
  )
}
