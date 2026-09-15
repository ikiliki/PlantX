import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Button as Styled } from './Button.styles'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  block?: boolean
  size?: 'sm' | 'md'
  children: ReactNode
}

export function Button({ variant = 'primary', block, size = 'md', children, ...rest }: Props) {
  return (
    <Styled $variant={variant} $block={block} $size={size} {...rest}>
      {children}
    </Styled>
  )
}
