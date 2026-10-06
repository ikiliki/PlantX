import { Fragment, useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { PRIVACY_PATH, TERMS_PATH } from '../../features/legal/legalPaths'
import { LEGAL_DOCS, type LegalDocId } from '../../features/legal/legalText'
import { LEGAL_VERSION } from '../../features/legal/legalVersion'
import { Article, Draft, Intro, Meta, Page, Section, Title, Top } from './LegalPage.styles'

function contactEmail() {
  return import.meta.env.VITE_LEGAL_CONTACT_EMAIL?.trim() || null
}

/** `{contact}` in the text becomes the contact email link, or the in-app line when none is configured. */
function withContact(text: string, contact: ReactNode) {
  const parts = text.split('{contact}')
  return parts.map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 ? contact : null}
    </Fragment>
  ))
}

/**
 * The public Privacy Policy (`/privacy`) and Terms of Use (`/terms`). Outside the app shell like the landing,
 * so they open for everyone, signed in or not, even while the app is closed or the API is down.
 */
export function LegalPage({ doc }: { doc: LegalDocId }) {
  const { t, locale, dir } = useI18n()
  const content = LEGAL_DOCS[doc][locale]
  const email = contactEmail()
  const contact = email ? (
    <>
      {t.legal.contactEmail.split('{email}')[0]}
      <a href={`mailto:${email}`}>{email}</a>
    </>
  ) : (
    t.legal.contactInApp
  )

  useEffect(() => {
    document.title = `${content.title} · PlantX`
  }, [content.title])

  return (
    <Page dir={dir}>
      <Article>
        <Top aria-label={t.legal.legal}>
          <Link to="/">{t.legal.back}</Link>
          <Link to={PRIVACY_PATH} aria-current={doc === 'privacy' ? 'page' : undefined}>
            {t.legal.privacy}
          </Link>
          <Link to={TERMS_PATH} aria-current={doc === 'terms' ? 'page' : undefined}>
            {t.legal.terms}
          </Link>
        </Top>
        <Title>{content.title}</Title>
        <Meta>{t.legal.effective.replace('{date}', LEGAL_VERSION)}</Meta>
        <Intro>{content.intro}</Intro>
        {content.sections.map((section) => (
          <Section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((text) => <p key={text}>{withContact(text, contact)}</p>)}
            {section.list ? (
              <ul>
                {section.list.map((text) => (
                  <li key={text}>{withContact(text, contact)}</li>
                ))}
              </ul>
            ) : null}
          </Section>
        ))}
        <Draft>{t.legal.draftNote}</Draft>
      </Article>
    </Page>
  )
}
