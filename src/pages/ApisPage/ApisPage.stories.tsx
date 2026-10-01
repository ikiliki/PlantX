import { useEffect, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../mock/store'
import { ApisPage } from './ApisPage'

function SignedIn({ children }: { children: ReactNode }) {
  const { loginAs } = useStore()
  useEffect(() => {
    loginAs('u-dana')
  }, [loginAs])
  return children
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter initialEntries={['/admin/apis']}>
        <SignedIn>
          <Story />
        </SignedIn>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Pages/ApisPage',
  component: ApisPage,
  decorators: [withApp],
}

/** No server in Storybook, so provider cards and history show their empty states. */
export const NoServer = () => <ApisPage />
