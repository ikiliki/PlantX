import { useState } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Box, Head, Item, Jump, JumpLink, List, Title, Toggle } from './WikiToc.styles'

export type WikiTocItem = {
  id: string
  title: string
  href?: string
  children?: WikiTocItem[]
}

function Entries({ items, onJump }: { items: WikiTocItem[]; onJump?: (id: string) => void }) {
  return items.map((item) => (
    <Item key={item.id}>
      {item.href ? (
        <JumpLink to={item.href}>{item.title}</JumpLink>
      ) : (
        <Jump type="button" onClick={() => onJump?.(item.id)}>
          {item.title}
        </Jump>
      )}
      {item.children && item.children.length > 0 ? (
        <List>
          <Entries items={item.children} onJump={onJump} />
        </List>
      ) : null}
    </Item>
  ))
}

export function WikiToc({ items, onJump }: { items: WikiTocItem[]; onJump?: (id: string) => void }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(true)

  if (items.length === 0) return null

  return (
    <Box aria-label={t.guide.contents}>
      <Head>
        <Title>{t.guide.contents}</Title>
        <Toggle type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          [{open ? t.guide.hide : t.guide.show}]
        </Toggle>
      </Head>
      <List hidden={!open}>
        <Entries items={items} onJump={onJump} />
      </List>
    </Box>
  )
}
