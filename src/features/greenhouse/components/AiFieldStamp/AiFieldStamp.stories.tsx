import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { AiFieldStamp } from './AiFieldStamp'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ display: 'flex', gap: 48, padding: 24, paddingBottom: 96 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/AiFieldStamp',
  component: AiFieldStamp,
  decorators: [withApp],
}

/** Hover or focus each stamp to see its tooltip. */
export const KeptAndChanged = () => (
  <>
    <span>
      Climbing <AiFieldStamp mark={{ check: 'kept', aiValue: 'climbing' }} />
    </span>
    <span>
      Hanging <AiFieldStamp mark={{ check: 'changed', aiValue: 'climbing' }} aiLabel="Climbing" />
    </span>
  </>
)
