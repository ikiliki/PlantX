import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { EditPencil, InlineEdit } from './InlineEdit'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ display: 'grid', gap: 16, padding: 24, maxWidth: 420 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/InlineEdit',
  component: InlineEdit,
  decorators: [withApp],
}

const saved = async () => true
const refused = async () => false

export const Text = () => <InlineEdit label="Name" kind="text" value="Golden pothos" required onSave={saved} onCancel={() => undefined} />
export const Note = () => <InlineEdit label="Note" kind="textarea" value="" onSave={saved} onCancel={() => undefined} />
export const Choice = () => (
  <InlineEdit
    label="Stage"
    kind="choice"
    value="EST"
    options={[
      { id: 'CUT', label: 'Cutting' },
      { id: 'ROOTED', label: 'Rooted' },
      { id: 'EST', label: 'Established' },
      { id: 'MATURE', label: 'Mature' },
    ]}
    onSave={saved}
    onCancel={() => undefined}
  />
)
export const SaveRefused = () => <InlineEdit label="Name" kind="text" value="Golden pothos" onSave={refused} onCancel={() => undefined} />
export const Pencil = () => <EditPencil label="Size" onClick={() => undefined} />
