import { useEffect, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { AccountDialog } from './AccountDialog'

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
  title: 'Features/Profile/AccountDialog',
  component: AccountDialog,
  decorators: [withApp],
}

export const Open = () => <AccountDialog onClose={() => undefined} />
