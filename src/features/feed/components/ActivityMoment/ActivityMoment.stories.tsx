import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { seedUpdates } from '../../../../mock/updates'
import { StoreProvider } from '../../../../mock/store'
import type { FeedUpdateKind } from '../../../../mock/types'
import { ActivityMoment } from './ActivityMoment'
import { FeedUpdate } from '../FeedUpdate/FeedUpdate'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ display: 'grid', gap: 12, maxWidth: 560, padding: 24, background: '#F4F1E8' }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

function ofKind(kind: FeedUpdateKind) {
  const update = seedUpdates().find((item) => item.kind === kind)
  if (!update) throw new Error(kind)
  return update
}

export default {
  title: 'Features/Feed/ActivityMoment',
  component: ActivityMoment,
  decorators: [withApp],
}

export const Cards = () => (
  <>
    {seedUpdates().map((update) => (
      <FeedUpdate key={update.id} update={update} />
    ))}
  </>
)

export const Water = () => <ActivityMoment update={ofKind('water')} onClose={() => {}} />

export const NewPlant = () => <ActivityMoment update={ofKind('added')} onClose={() => {}} />

export const Photo = () => <ActivityMoment update={ofKind('photo')} onClose={() => {}} />

export const Scan = () => <ActivityMoment update={ofKind('scan')} onClose={() => {}} />
