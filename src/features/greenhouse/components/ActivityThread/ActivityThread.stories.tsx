import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { ActivityThread } from './ActivityThread'

const withApp = (Story: () => ReactNode) => (
  <I18nProvider>
    <MemoryRouter>
      <div style={{ padding: 24, background: '#F4F1E8', containerType: 'inline-size', maxWidth: 360 }}>
        <Story />
      </div>
    </MemoryRouter>
  </I18nProvider>
)

export default {
  title: 'Features/Greenhouse/ActivityThread',
  component: ActivityThread,
  decorators: [withApp],
}

export const Default = () => (
  <ActivityThread
    activity={[
      {
        at: '2026-09-12',
        plant: 'Mother Pothos',
        plantId: 'pl-1',
        photo: '/class-photos/pot-gold-a-l-mat.jpg',
        label: 'Added to greenhouse',
      },
      {
        at: '2026-09-20',
        plant: 'Mother Pothos',
        plantId: 'pl-1',
        photo: '/class-photos/pot-gold-a-l-mat.jpg',
        label: 'Watered',
      },
      {
        at: '2026-09-28',
        plant: 'Rooted cuttings',
        plantId: 'pl-2',
        photo: '/class-photos/pot-gold-a-s-r.png',
        label: 'Listed for sale',
      },
    ]}
  />
)

export const Empty = () => <ActivityThread activity={[]} />
