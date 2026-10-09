import { Icon } from '../../../../components/Icon/Icon'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Back, Bar, Tab } from './GreenhouseTabs.styles'

export type GreenhouseScopeId = 'mine' | 'global'

/**
 * My greenhouse / All greenhouses, on every screen size. Plain links (shareable, back button works), so the
 * public list is one obvious tap away instead of hiding in the nav menu or a floating toggle.
 * On a phone the bar sticks under the top bar while the page scrolls.
 */
export function GreenhouseTabs({ value }: { value: GreenhouseScopeId }) {
  const { t } = useI18n()
  return (
    <Bar aria-label={t.greenhouse.tabsLabel}>
      <Tab to="/greenhouse" replace $on={value === 'mine'} aria-current={value === 'mine' ? 'page' : undefined}>
        <Icon name="greenhouse" size={18} />
        {t.greenhouse.tabMine}
      </Tab>
      <Tab
        to="/greenhouse?scope=global"
        replace
        $on={value === 'global'}
        aria-current={value === 'global' ? 'page' : undefined}
      >
        <Icon name="globe" size={18} />
        {t.greenhouse.tabGlobal}
      </Tab>
    </Bar>
  )
}

/** On a grower's public greenhouse: the way back to the list, in the page, not floating over it. */
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
