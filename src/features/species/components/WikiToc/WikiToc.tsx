import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Box, Head, Hint, Item, Jump, JumpLink, List, Title, Toggle } from './WikiToc.styles'

export type WikiTocItem = {
  id: string
  title: string
  href?: string
  children?: WikiTocItem[]
}

function Branch({ item, onJump }: { item: WikiTocItem; onJump?: (id: string) => void }) {
  const { t } = useI18n()
  const loc = useLocation()
  const nested = Boolean(item.children?.length)
  const [open, setOpen] = useState(() => loc.hash === `#${item.id}`)

  useEffect(() => {
    if (!nested || loc.hash !== `#${item.id}`) return
    setOpen(true)
  }, [item.id, loc.hash, nested])

  return (
    <Item>
      {nested ? (
        <Jump type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {item.title}
          <Hint>[{open ? t.guide.hide : t.guide.show}]</Hint>
        </Jump>
      ) : item.href ? (
        <JumpLink to={item.href}>{item.title}</JumpLink>
      ) : (
        <Jump type="button" onClick={() => onJump?.(item.id)}>
          {item.title}
        </Jump>
      )}
      {nested && open ? (
        <List>
          {item.children?.map((child) => (
            <Branch key={child.id} item={child} onJump={onJump} />
          ))}
        </List>
      ) : null}
    </Item>
  )
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
        {items.map((item) => (
          <Branch key={item.id} item={item} onJump={onJump} />
        ))}
      </List>
    </Box>
  )
}
