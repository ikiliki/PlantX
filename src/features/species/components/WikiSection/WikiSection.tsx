import type { ReactNode } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Body, Hint, Section, Title, Toggle } from './WikiSection.styles'

export function WikiSection({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const { t } = useI18n()

  return (
    <Section id={id}>
      <h2>
        <Toggle type="button" aria-expanded={open} aria-controls={`${id}-body`} onClick={onToggle}>
          <Title>{title}</Title>
          <Hint>[{open ? t.guide.hide : t.guide.show}]</Hint>
        </Toggle>
      </h2>
      <Body id={`${id}-body`} hidden={!open}>
        {children}
      </Body>
    </Section>
  )
}
