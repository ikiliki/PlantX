import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import type { User } from '../../../../mock/types'
import { plantImages } from '../../../../mock/images'
import { GreenhouseCard } from './GreenhouseCard'

const maya: User = {
  id: 'u-maya',
  name: 'Maya Levi',
  nameHe: 'מאיה לוי',
  role: 'grower',
  region: 'Central Israel',
  regionHe: 'מרכז',
  bio: 'Home grower with surplus golden pothos.',
  bioHe: 'מגדלת ביתית עם עודפי פוטוס.',
  rating: 4.8,
  completedOrders: 14,
  verificationRate: 0.62,
  cancellations: 1,
  specialties: ['Pothos'],
  specialtiesHe: ['פוטוס'],
  avatarColor: '#1FA85A',
  friendIds: [],
}

const withApp = (Story: () => ReactNode) => (
  <I18nProvider>
    <MemoryRouter>
      <div style={{ width: 420, padding: 16, background: '#F4F1E8' }}>
        <Story />
      </div>
    </MemoryRouter>
  </I18nProvider>
)

export default {
  title: 'Features/Greenhouse/GreenhouseCard',
  component: GreenhouseCard,
  decorators: [withApp],
}

const photos = [
  { id: 'a', src: plantImages.pothos },
  { id: 'b', src: plantImages.monstera },
  { id: 'c', src: plantImages.pothosNjoy },
]

export const FullShelf = () => <GreenhouseCard user={maya} href="/greenhouse/u-maya" plantCount={6} photos={photos} />

export const OnePlant = () => (
  <GreenhouseCard user={maya} href="/greenhouse/u-maya" plantCount={1} photos={photos.slice(0, 1)} />
)

export const EmptyShelf = () => <GreenhouseCard user={maya} href="/greenhouse/u-maya" plantCount={0} />

export const Compact = () => (
  <GreenhouseCard user={maya} href="/greenhouse/u-maya" plantCount={2} photos={photos.slice(0, 2)} compact />
)
