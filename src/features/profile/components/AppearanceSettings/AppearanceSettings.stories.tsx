import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { AppearanceSettings } from './AppearanceSettings'

export default {
  title: 'Profile/AppearanceSettings',
  component: AppearanceSettings,
}

export const Default = () => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ width: 360, maxWidth: '100%', padding: 16 }}>
        <AppearanceSettings />
      </div>
    </I18nProvider>
  </StoreProvider>
)
