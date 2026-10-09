import { useI18n } from '../../../../i18n/I18nProvider'
import { Back } from './GreenhouseBackLink.styles'

/** On a grower's public greenhouse: the way back to All greenhouses, in the page, not floating over it. */
export function GreenhouseBackLink() {
  const { t } = useI18n()
  return (
    <Back to="/greenhouse?scope=global">
      <svg viewBox="0 0 20 20" aria-hidden>
        <path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {t.greenhouse.backToAll}
    </Back>
  )
}
