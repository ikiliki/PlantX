import { useState, type ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { GreenhousePlace } from './GreenhousePlace'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ padding: 24, maxWidth: 420, background: '#F4F1E8' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/GreenhousePlace',
  component: GreenhousePlace,
  decorators: [withApp],
}

export const Unknown = () => {
  const [areaId, setAreaId] = useState('unknown')
  return <GreenhousePlace areaId={areaId} onChange={setAreaId} />
}

export const CentralIsrael = () => {
  const [areaId, setAreaId] = useState('central')
  return <GreenhousePlace areaId={areaId} onChange={setAreaId} />
}
