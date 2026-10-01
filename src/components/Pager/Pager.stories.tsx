import { useState } from 'react'
import type { ReactNode } from 'react'
import { I18nProvider } from '../../i18n/I18nProvider'
import { PAGE_SIZE, Pager, pageWindow } from './Pager'

const withApp = (Story: () => ReactNode) => (
  <I18nProvider>
    <div style={{ padding: 24, background: '#F4F1E8' }}>
      <Story />
    </div>
  </I18nProvider>
)

export default {
  title: 'Components/Pager',
  component: Pager,
  decorators: [withApp],
}

const rows = Array.from({ length: PAGE_SIZE * 2 + 3 }, (_, index) => index + 1)

export const Default = () => {
  const [page, setPage] = useState(0)
  const window = pageWindow(rows, page)
  return (
    <Pager
      page={window.page}
      pageCount={window.pageCount}
      from={window.from}
      to={window.to}
      total={window.total}
      onPage={setPage}
    />
  )
}
