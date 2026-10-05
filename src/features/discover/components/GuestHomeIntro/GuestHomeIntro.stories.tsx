import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../auth/AuthProvider'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { GuestHomeIntro } from './GuestHomeIntro'

const withApp = (width: number) => (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <AuthProvider>
        <MemoryRouter>
          <div style={{ width, maxWidth: '100%' }}>
            <Story />
          </div>
        </MemoryRouter>
      </AuthProvider>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Discover/GuestHomeIntro',
  component: GuestHomeIntro,
}

export const Playing = () => <GuestHomeIntro />
Playing.decorators = [withApp(680)]

export const AiStep = () => <GuestHomeIntro startStep={1} autoplay={false} />
AiStep.decorators = [withApp(680)]

export const CareStep = () => <GuestHomeIntro startStep={2} autoplay={false} />
CareStep.decorators = [withApp(680)]

export const Phone = () => <GuestHomeIntro />
Phone.decorators = [withApp(360)]
