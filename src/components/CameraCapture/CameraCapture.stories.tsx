import type { ReactNode } from 'react'
import { I18nProvider } from '../../i18n/I18nProvider'
import { StoreProvider } from '../../mock/store'
import { CameraCapture } from './CameraCapture'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Components/CameraCapture',
  component: CameraCapture,
  decorators: [withApp],
}

/** Asks for the camera first, then shows the live view (or why it can't). */
export const Default = () => <CameraCapture onCapture={() => undefined} onClose={() => undefined} />
