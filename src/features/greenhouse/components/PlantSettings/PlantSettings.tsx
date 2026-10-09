import { Icon } from '../../../../components/Icon/Icon'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { Plant } from '../../../../mock/types'
import { PlantDelete, PlantOwnerControls } from '../PlantOwnerControls/PlantOwnerControls'
import { Action, ActionControl, ActionCopy, ActionHint, ActionIcon, ActionTitle, Actions } from './PlantSettings.styles'

/**
 * The passport's Settings tab (owner only): the plant's actions as a list. Each row says what it is, what it
 * does, and holds its control at the end: who can see the plant, then delete it (a danger row, last).
 */
export function PlantSettings({ plant, onDeleted }: { plant: Plant; onDeleted?: () => void }) {
  const { t } = useI18n()
  const isPrivate = Boolean(plant.private)

  return (
    <Actions>
      <Action>
        <ActionIcon aria-hidden>
          <Icon name={isPrivate ? 'lock' : 'globe'} size={18} />
        </ActionIcon>
        <ActionCopy>
          <ActionTitle>{t.passport.privacyLabel}</ActionTitle>
          <ActionHint>{isPrivate ? t.passport.privateHint : t.passport.publicHint}</ActionHint>
        </ActionCopy>
        <ActionControl>
          <PlantOwnerControls plant={plant} />
        </ActionControl>
      </Action>

      <Action $danger>
        <ActionIcon aria-hidden $danger>
          <Icon name="trash" size={18} />
        </ActionIcon>
        <ActionCopy>
          <ActionTitle $danger>{t.passport.deletePlant}</ActionTitle>
          <ActionHint>{t.passport.deleteHint}</ActionHint>
        </ActionCopy>
        <ActionControl>
          <PlantDelete plant={plant} onDeleted={onDeleted} />
        </ActionControl>
      </Action>
    </Actions>
  )
}
