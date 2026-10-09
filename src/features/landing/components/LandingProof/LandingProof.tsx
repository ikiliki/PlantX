import { Icon } from '../../../../components/Icon/Icon'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Band, Grid, Proof } from './LandingProof.styles'

/** Three concrete benefits: care, overview and growth history, each with its icon. */
export function LandingProof() {
  const { t } = useI18n()
  const items = [
    { title: t.landing.benefit1, body: t.landing.benefit1Body, icon: 'drop' as const },
    { title: t.landing.benefit2, body: t.landing.benefit2Body, icon: 'greenhouse' as const },
    { title: t.landing.benefit3, body: t.landing.benefit3Body, icon: 'chart' as const },
  ]

  return (
    <Band aria-label={t.landing.benefitsLabel}>
      <Grid>
        {items.map((item) => (
          <Proof key={item.title}>
            <Icon name={item.icon} size={20} />
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </Proof>
        ))}
      </Grid>
    </Band>
  )
}
