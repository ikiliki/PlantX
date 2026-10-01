import { Field, FormOption, FormOptionGrid } from '../../../../components/Form/Form'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { OthersFilterGroup } from '../../othersFilterGroups'
import {
  Group,
  GroupBody,
  GroupSummary,
  Heading,
  Hint,
  PropertyBlock,
  Root,
} from './CatalogOthersFilters.styles'

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function toggle(list: string[], item: string) {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]
}

export function CatalogOthersFilters({
  traits,
  groups,
  onTraitsChange,
  showHeading = true,
}: {
  traits: Record<string, string[]>
  groups: OthersFilterGroup[]
  onTraitsChange: (traits: Record<string, string[]>) => void
  showHeading?: boolean
}) {
  const { t } = useI18n()
  if (groups.length === 0) return null

  const setTrait = (propertyId: string, optionId: string, relevant: boolean) => {
    if (!relevant) return
    const current = traits[propertyId] ?? []
    onTraitsChange({ ...traits, [propertyId]: toggle(current, optionId) })
  }

  return (
    <Root aria-label={t.market.filterOthers}>
      {showHeading && (
        <>
          <Heading>{t.market.filterOthers}</Heading>
          <Hint>{t.market.catalogTraitsHint}</Hint>
        </>
      )}
      {groups.map((group) => {
        const label = group.id === 'general' ? t.market.filterGeneral : group.name
        const visible = group.properties.filter((property) => property.options.length > 0)
        if (visible.length === 0) return null
        return (
          <Group key={group.id} open={group.id === 'general'}>
            <GroupSummary data-muted={!group.relevant}>
              <span>{label}</span>
              <Chevron />
            </GroupSummary>
            <GroupBody>
              {visible.map((property) => (
                <PropertyBlock key={property.id}>
                  <Field>
                    {property.name}
                    <FormOptionGrid>
                      {property.options.map((item) => (
                        <FormOption
                          key={item.id}
                          type="button"
                          $on={(traits[property.id] ?? []).includes(item.id)}
                          $off={!property.relevant}
                          disabled={!property.relevant}
                          onClick={() => setTrait(property.id, item.id, property.relevant)}
                        >
                          {item.name}
                          {property.relevant ? ` · ${item.count}` : ''}
                        </FormOption>
                      ))}
                    </FormOptionGrid>
                  </Field>
                </PropertyBlock>
              ))}
            </GroupBody>
          </Group>
        )
      })}
    </Root>
  )
}
