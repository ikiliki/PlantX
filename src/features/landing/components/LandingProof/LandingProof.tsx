import { useI18n } from '../../../../i18n/I18nProvider'
import { Band, Grid, Proof } from './LandingProof.styles'

/** Three concrete benefits: care, overview and growth history. Hidden on phones (the hero already sells it). */
export function LandingProof() {
  const { t } = useI18n()
  const items = [
    { title: t.landing.benefit1, body: t.landing.benefit1Body },
    { title: t.landing.benefit2, body: t.landing.benefit2Body },
    { title: t.landing.benefit3, body: t.landing.benefit3Body },
  ]

  return (
    <Band aria-label={t.landing.benefitsLabel}>
      <Grid>
        {items.map((item) => (
          <Proof key={item.title}>
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </Proof>
        ))}
      </Grid>
    </Band>
  )
}
