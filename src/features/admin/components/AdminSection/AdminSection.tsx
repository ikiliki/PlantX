import type { ReactNode } from 'react'
import { Aside, Copy, Head, Lead, Root } from './AdminSection.styles'

export function AdminSection({
  title,
  lead,
  aside,
  children,
}: {
  title: string
  lead?: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <Root>
      <Head>
        <Copy>
          <h2>{title}</h2>
          {lead ? <Lead>{lead}</Lead> : null}
        </Copy>
        {aside ? <Aside>{aside}</Aside> : null}
      </Head>
      {children}
    </Root>
  )
}
