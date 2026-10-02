import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { IconToggle } from '../../../../components/IconToggle/IconToggle'
import { useI18n } from '../../../../i18n/I18nProvider'
import { theme } from '../../../../theme/tokens'
import { Back } from './GreenhouseScope.styles'

export type GreenhouseScopeId = 'mine' | 'global'

const HEADER_NAV = `(min-width: ${theme.breakpoints.md})`

/** True when the shell header nav is on screen (desktop): Mine / Global live in the nav menu, not a toggle. */
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
 * `floating`: a small pill fixed in the middle above the bottom nav, so the level card can lead the page.
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
    <IconToggle
      label={t.greenhouse.scopeLabel}
      value={value}
      onChange={onChange}
      floating={floating}
      options={[
        { id: 'mine', label: t.greenhouse.scopeMine, icon: 'greenhouse' },
        { id: 'global', label: t.greenhouse.scopeGlobal, icon: 'globe' },
      ]}
    />
  )
}

/**
 * Phone, on a grower's public greenhouse: the floating switch's spot becomes a back arrow
 * that always leads to the public greenhouses list (Global).
 * Portaled to `document.body`, same as the floating switch, so the page-enter motion does not carry it.
 */
export function GreenhouseBack() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const back = (
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
  if (typeof document === 'undefined') return back
  return createPortal(back, document.body)
}
