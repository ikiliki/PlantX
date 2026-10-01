import { useI18n } from '../../../../i18n/I18nProvider'
import { Row, Tab } from './AdminTabs.styles'

export const adminNav = [
  { id: 'server', to: '/admin/server' },
  { id: 'requests', to: '/admin/requests' },
  { id: 'system', to: '/admin/system' },
  { id: 'apis', to: '/admin/apis' },
] as const

export function AdminTabs({ current }: { current: (typeof adminNav)[number]['id'] }) {
  const { t } = useI18n()
  return (
    <Row>
      {adminNav.map((item) => (
        <Tab key={item.id} to={item.to} $on={current === item.id}>
          {t.admin[item.id]}
        </Tab>
      ))}
    </Row>
  )
}
