import { useEffect, useState } from 'react'
import { Icon } from '../../../../components/Icon/Icon'
import { useI18n } from '../../../../i18n/I18nProvider'
import { theme } from '../../../../theme/tokens'
import { Btn, Root } from './GreenhouseScope.styles'

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

/** Phone-only Mine / Global switch. Leaf is yours, globe is everyone. */
export function GreenhouseScope({
  value,
  onChange,
}: {
  value: GreenhouseScopeId
  onChange: (value: GreenhouseScopeId) => void
}) {
  const { t } = useI18n()

  return (
    <Root role="radiogroup" aria-label={t.greenhouse.scopeLabel} data-greenhouse-scope={value}>
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
