import type { ReactNode } from 'react'
import { Head, Hint, Panel, Title } from './ChartPanel.styles'

export function ChartPanel({
  title,
  hint,
  aside,
  children,
}: {
  title?: string
  hint?: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <Panel>
      {(title || aside) && (
        <Head>
          <div>
            {title && <Title>{title}</Title>}
            {hint && <Hint>{hint}</Hint>}
          </div>
          {aside}
        </Head>
      )}
      {children}
    </Panel>
  )
}
