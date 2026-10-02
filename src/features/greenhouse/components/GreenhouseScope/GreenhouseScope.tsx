import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../../components/Icon/Icon'
import { useI18n } from '../../../../i18n/I18nProvider'
import { theme } from '../../../../theme/tokens'
import { Back, Btn, Root } from './GreenhouseScope.styles'

export type GreenhouseScopeId = 'mine' | 'global'

const HEADER_NAV = `(min-width: ${theme.breakpoints.md})`

/** True when the shell header nav is on screen, so the page toggle stays off. */
export function useHeaderNav() {
  const [on, setOn] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(HEADER_NAV).matches : false))
  useEffect(() => {
    const mq = window.matchMedia(HEADER_NAV)
    const apply = () => setOn(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return on
}

/**
 * Phone-only Mine / Global switch. Leaf is yours, globe is everyone.
 * `floating`: a small pill fixed above the bottom nav, so the level card can lead the page.
 */
export function GreenhouseScope({
  value,
  onChange,
  floating = false,
}: {
  value: GreenhouseScopeId
  onChange: (value: GreenhouseScopeId) => void
  floating?: boolean
}) {
  const { t } = useI18n()

  return (
    <Root role="radiogroup" aria-label={t.greenhouse.scopeLabel} data-greenhouse-scope={value} $floating={floating}>
      <Btn
        type="button"
        role="radio"
        aria-label={t.greenhouse.scopeMine}
        aria-checked={value === 'mine'}
        $on={value === 'mine'}
        onClick={() => onChange('mine')}
      >
        <Icon name="greenhouse" size={16} />
      </Btn>
      <Btn
        type="button"
        role="radio"
        aria-label={t.greenhouse.scopeGlobal}
        aria-checked={value === 'global'}
        $on={value === 'global'}
        onClick={() => onChange('global')}
      >
        <Icon name="globe" size={16} />
      </Btn>
    </Root>
  )
}

/**
 * Phone, on a grower's public greenhouse: the floating switch's spot becomes a back arrow
 * that always leads to the public greenhouses list (Global).
 */
export function GreenhouseBack() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <Back
      type="button"
      aria-label={t.common.back}
      title={t.common.back}
      onClick={() => navigate('/greenhouse?scope=global')}
    >
      <svg viewBox="0 0 20 20" aria-hidden>
        <path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Back>
  )
}
