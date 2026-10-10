import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { Todo } from '../../../../mock/types'
import { PassportNow } from './PassportNow'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ display: 'grid', gap: 12, padding: 24, maxWidth: 340, background: '#F3F6EC' }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/PassportNow',
  component: PassportNow,
  decorators: [withApp],
}

const todo = (patch: Partial<Todo>): Todo => ({
  id: 'td-story',
  ownerId: 'u-maya',
  plantId: 'pl-story',
  category: 'plant',
  subcategory: 'water',
  dueOn: new Date().toISOString().slice(0, 10),
  completedOn: null,
  createdAt: '2026-10-01',
  ...patch,
})

export const NextCare = () => <PassportNow now={{ kind: 'next', todo: todo({}), first: false }} />

export const Overdue = () => <PassportNow now={{ kind: 'next', todo: todo({ dueOn: '2026-01-01' }), first: false }} />

export const FirstWatering = () => <PassportNow now={{ kind: 'next', todo: todo({ dueOn: null }), first: true }} />

export const PhotoDone = () => <PassportNow now={{ kind: 'done', care: 'photo' }} />

export const NothingPlanned = () => <PassportNow now={{ kind: 'clear' }} />
