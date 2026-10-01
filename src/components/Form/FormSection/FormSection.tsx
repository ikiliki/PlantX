import type { ReactNode } from 'react'
import { Body, Head, Hint, Row, Section, Title } from './FormSection.styles'

export function FormSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <Section>
      <Head>
        <Title>{title}</Title>
        {hint ? <Hint>{hint}</Hint> : null}
      </Head>
      <Body>{children}</Body>
    </Section>
  )
}

export { Row as FormRow, OptionGrid as FormOptionGrid, Option as FormOption } from './FormSection.styles'
