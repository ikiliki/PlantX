import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { PlantImage } from '../../components/PlantImage/PlantImage'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { theme } from '../../theme/tokens'

export function ClaimPage() {
  const { db, currentUser, claimDraft, loginAs } = useStore()
  const { t, tr, formatMoney, locale } = useI18n()
  const navigate = useNavigate()
  const draft = db.claimDrafts[0]

  if (!draft) {
    return (
      <div>
        <PageHeader>
          <h1>{t.claim.title}</h1>
        </PageHeader>
        <Card>
          <p>{t.claim.claimed}</p>
        </Card>
      </div>
    )
  }

  const species = db.species.find((s) => s.id === draft.speciesId)
  const canClaim = currentUser && currentUser.role !== 'guest' && !draft.claimedBy

  return (
    <div>
      <PageHeader>
        <div>
          <h1>{t.claim.title}</h1>
          <p>{t.claim.subtitle}</p>
        </div>
      </PageHeader>

      <Card $pad={false} style={{ maxWidth: 480 }}>
        <div style={{ aspectRatio: '4/3' }}>
          <PlantImage src={draft.photo} alt="" />
        </div>
        <div style={{ padding: 20, display: 'grid', gap: 10 }}>
          <strong style={{ fontSize: 20 }}>{tr(draft.title, draft.titleHe)}</strong>
          <div style={{ color: theme.colors.muted }}>
            {tr(species?.commonName ?? '', species?.commonNameHe ?? '')} ·{' '}
            {locale === 'he' ? draft.regionHe : draft.region}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{formatMoney(draft.price)}</div>
          <div style={{ fontSize: 13, color: theme.colors.muted }}>
            prepared for {locale === 'he' ? draft.preparedForNameHe : draft.preparedForName}
          </div>
          {draft.claimedBy ? (
            <p style={{ fontWeight: 700, color: theme.colors.greenDark }}>{t.claim.claimed}</p>
          ) : canClaim ? (
            <Button
              block
              onClick={() => {
                claimDraft(draft.id)
                navigate('/greenhouse')
              }}
            >
              {t.claim.claim}
            </Button>
          ) : (
            <>
              <p>{t.claim.loginHint}</p>
              <Button
                block
                onClick={() => {
                  loginAs('u-maya')
                }}
              >
                {t.roles.grower} — Maya
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
