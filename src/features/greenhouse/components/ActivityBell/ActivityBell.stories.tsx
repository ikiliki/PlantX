import { useEffect, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { ActivityBell } from './ActivityBell'

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
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 24, background: '#FFFEFA' }}>
          <SignedIn>
            <Story />
          </SignedIn>
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/ActivityBell',
  component: ActivityBell,
  decorators: [withApp],
}

export const Closed = () => <ActivityBell />

export const Open = () => <ActivityBell defaultOpen />
