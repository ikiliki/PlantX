import { Segmented } from '../../../../components/Segmented/Segmented'
import { canChooseLocale } from '../../../../i18n/locales'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { setGarden, useGarden } from '../../../../theme/themeMode'
import type { GardenMode } from '../../../../theme/tokens'
import { Field, Hint, Label, Root } from './AppearanceSettings.styles'

/**
 * Settings → Appearance: sunny or night garden (saved on this device), and the language where more than
 * one is offered. Members see it as a tab of the account dialog; guests open it from the top bar gear.
 */
export function AppearanceSettings() {
  const { t, locale } = useI18n()
  const { setLocale } = useStore()
  const garden = useGarden()

  return (
    <Root data-appearance>
      <Field>
        <Label>{t.settings.theme}</Label>
        <Segmented<GardenMode>
          ariaLabel={t.settings.theme}
          value={garden}
          onChange={(mode) => setGarden(mode)}
          options={[
            { id: 'day', label: t.settings.light },
            { id: 'night', label: t.settings.dark },
          ]}
        />
        <Hint>{t.settings.themeHint}</Hint>
      </Field>
      {canChooseLocale() ? (
        <Field>
          <Label>{t.nav.language}</Label>
          <Segmented<'he' | 'en'>
            ariaLabel={t.nav.language}
            value={locale}
            onChange={setLocale}
            options={[
              { id: 'he', label: t.landing.langHe },
              { id: 'en', label: t.landing.langEn },
            ]}
          />
        </Field>
      ) : null}
    </Root>
  )
}
