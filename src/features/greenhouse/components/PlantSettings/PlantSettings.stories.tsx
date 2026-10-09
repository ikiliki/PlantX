import type { Plant } from '../../../../mock/types'
import { PlantSettings } from './PlantSettings'

export default {
  title: 'Greenhouse/PlantSettings',
  component: PlantSettings,
}

const plant = { id: 'pl-maya-mother', title: 'Mother Pothos', private: false } as Plant

export const PublicPlant = () => <PlantSettings plant={plant} />
export const PrivatePlant = () => <PlantSettings plant={{ ...plant, private: true }} />
