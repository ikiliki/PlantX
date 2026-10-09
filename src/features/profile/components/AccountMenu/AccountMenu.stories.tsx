import { useEffect, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { AccountMenu } from './AccountMenu'

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
        <SignedIn>
          <Story />
        </SignedIn>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Profile/AccountMenu',
  component: AccountMenu,
}

export const Open = () => <AccountMenu onClose={() => undefined} onProfile={() => undefined} onSettings={() => undefined} />
Open.decorators = [withApp]
