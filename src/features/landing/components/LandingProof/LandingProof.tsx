import { useI18n } from '../../../../i18n/I18nProvider'
import { Band, Grid, Proof } from './LandingProof.styles'

/** What a home grower gets, at a glance. Live features only; the market waits in `LandingSoon`. */
export function LandingProof() {
  const { t } = useI18n()
  const items = [
    { title: t.landing.proof1, body: t.landing.proof1Body },
    { title: t.landing.proof2, body: t.landing.proof2Body },
    { title: t.landing.proof3, body: t.landing.proof3Body },
    { title: t.landing.proof4, body: t.landing.proof4Body },
    { title: t.landing.proof5, body: t.landing.proof5Body },
    { title: t.landing.proof6, body: t.landing.proof6Body },
  ]

  return (
    <Band>
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
