import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { greenhouseLevel } from '../../greenhouseLevel'
import { GreenhouseLevelSkeleton, GreenhouseLevelView } from './GreenhouseLevelCard'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ containerType: 'inline-size', padding: 24, background: '#F4F1E8' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/GreenhouseLevelCard',
  component: GreenhouseLevelView,
  decorators: [withApp],
}

const plants = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `p${i}`, ownerId: 'u' })) as never
const done = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `t${i}`, ownerId: 'u', completedOn: '2026-10-01' })) as never

export const NewGrower = () => <GreenhouseLevelView summary={greenhouseLevel('u', [], [])} />
export const Leafling = () => <GreenhouseLevelView summary={greenhouseLevel('u', plants(6), done(4))} />
export const LevelUp = () => <GreenhouseLevelView summary={greenhouseLevel('u', plants(12), done(20))} celebrate />
export const Loading = () => <GreenhouseLevelSkeleton />
export const GuestBlurred = () => <GreenhouseLevelSkeleton blurred />
export const MasterGrower =() => <GreenhouseLevelView summary={greenhouseLevel('u', plants(120), done(400))} />
