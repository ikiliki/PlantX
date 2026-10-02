import { useState, type ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { GreenhouseScope, type GreenhouseScopeId } from './GreenhouseScope'

function Demo() {
  const [value, setValue] = useState<GreenhouseScopeId>('global')
  return <GreenhouseScope value={value} onChange={setValue} />
}

export default {
  title: 'Features/Greenhouse/GreenhouseScope',
  component: GreenhouseScope,
  decorators: [
    (Story: () => ReactNode) => (
      <I18nProvider>
        <div style={{ padding: 16, background: '#F4F1E8' }}>
          <Story />
        </div>
      </I18nProvider>
    ),
  ],
}

export const Icons = () => <Demo />
