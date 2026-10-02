import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { GreenhouseDirectory } from './GreenhouseDirectory'

function SignedIn({ children }: { children: ReactNode }) {
  const { loginAs } = useStore()
  useEffect(() => {
    loginAs('u-maya')
  }, [loginAs])
  return children
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ width: 520, padding: 16, background: '#F4F1E8' }}>
          <SignedIn>
            <Story />
          </SignedIn>
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/GreenhouseDirectory',
  component: GreenhouseDirectory,
  decorators: [withApp],
}

export const Global = () => <GreenhouseDirectory />
