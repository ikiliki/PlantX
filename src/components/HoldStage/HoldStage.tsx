import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { Back, Body, Card, Center, Mark, Orb, Stage, Title } from './HoldStage.styles'

/** Shared full-screen public hold: landing is the only other public page. No app header. */
export function HoldStage({
  mode,
  mark,
  title,
  body,
  children,
  cover = false,
  preview = false,
}: {
  mode: string
  mark: string
  title: string
  body: string
  children?: ReactNode
  /** Cover the app shell when a live route is held. */
  cover?: boolean
  /** Sit inside an admin preview frame. The back control stays visual. */
  preview?: boolean
}) {
  const { t } = useI18n()
  const [spot, setSpot] = useState({ x: 50, y: 28 })

  return (
    <Stage
      $x={spot.x}
      $y={spot.y}
      $cover={cover && !preview}
      $frame={preview}
      data-page-mode={mode}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setSpot({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        })
      }}
    >
      {preview ? (
        <Back as="span">
          <span aria-hidden="true">←</span>
          {t.release.backToLanding}
        </Back>
      ) : (
        <Back as={Link} to="/">
          <span aria-hidden="true">←</span>
          {t.release.backToLanding}
        </Back>
      )}
      <Center>
        <Card role="status">
          <Orb aria-hidden="true" />
          <Mark>{mark}</Mark>
          <Title>{title}</Title>
          <Body>{body}</Body>
          {children}
        </Card>
      </Center>
    </Stage>
  )
}
