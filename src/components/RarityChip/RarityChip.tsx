import { useI18n } from '../../i18n/I18nProvider'
import type { PlantRarity } from '../../mock/types'
import { Chip } from './RarityChip.styles'

export function RarityChip({ rarity }: { rarity: PlantRarity }) {
  const { t } = useI18n()
  const label =
    rarity === 'unique' ? t.plant.unique : rarity === 'rare' ? t.plant.rare : t.plant.common
  return <Chip $rarity={rarity}>{label}</Chip>
}
