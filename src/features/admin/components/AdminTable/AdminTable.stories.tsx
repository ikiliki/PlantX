import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { AdminTable } from './AdminTable'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/AdminTable',
  component: AdminTable,
  decorators: [withApp],
}

const rows = [
  { id: '1', name: 'Maya', role: 'grower' },
  { id: '2', name: 'Dana', role: 'admin' },
]

export const Default = () => (
  <AdminTable
    rows={rows}
    rowId={(row) => row.id}
    empty="No rows"
    selectable
    selected={[]}
    onSelectedChange={() => undefined}
    expandable
    expandedIds={[]}
    onExpandedChange={() => undefined}
    columns={[
      { id: 'name', header: 'Name', cell: (row) => row.name },
      { id: 'role', header: 'Role', cell: (row) => row.role, muted: true },
    ]}
    renderExpand={(row) => <p>Details for {row.name}</p>}
    actions={(row) => [
      { id: 'act', label: 'Action', onClick: () => undefined, disabled: row.role === 'admin' },
    ]}
    bulkActions={[{ id: 'bulk', label: 'Bulk', onClick: () => undefined }]}
  />
)
