import { Select } from '../../../../components/Form/Form'
import { useI18n } from '../../../../i18n/I18nProvider'
import { AREAS, greenhouseAreaId } from '../../../../mock/locations'
import { useStore } from '../../../../mock/store'
import { Hint, Root } from './GreenhousePlace.styles'

/**
 * Greenhouse place. New plants copy it. Empty or unknown regions show Unknown. The caller supplies the label
 * (the account dialog's row); `id` ties it to the select.
 */
export function GreenhousePlace({
  id,
  areaId,
  onChange,
}: {
  id?: string
  areaId?: string
  onChange?: (areaId: string) => void
}) {
  const { currentUser, setGreenhousePlace } = useStore()
  const { t, locale } = useI18n()
  const controlled = areaId != null && onChange != null
  if (!controlled && (!currentUser || currentUser.role === 'guest')) return null

  const selected = controlled ? areaId : greenhouseAreaId(currentUser?.region)
  const change = onChange ?? setGreenhousePlace

  return (
    <Root>
      <Select
        id={id}
        aria-label={id ? undefined : t.settings.region}
        value={selected}
        onChange={(event) => change(event.target.value)}
      >
        {AREAS.map((area) => (
          <option key={area.id} value={area.id}>
            {locale === 'he' ? area.regionHe : area.region}
          </option>
        ))}
      </Select>
      <Hint>{t.settings.placeHint}</Hint>
    </Root>
  )
}
