import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { VerifiedStamp } from './VerifiedStamp'

const withApp = (Story: () => ReactNode) => (
  <I18nProvider>
    <div style={{ position: 'relative', width: 220, height: 80, padding: 16, background: '#FFFEFA' }}>
      <Story />
    </div>
  </I18nProvider>
)

export default {
  title: 'Features/Greenhouse/VerifiedStamp',
  component: VerifiedStamp,
  decorators: [withApp],
}

export const Stamp = () => <VerifiedStamp />

export const Inline = () => <VerifiedStamp place="inline" />

export const Icon = () => <VerifiedStamp place="icon" />
