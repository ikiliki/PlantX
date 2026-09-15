import { useEffect, useState, type ImgHTMLAttributes } from 'react'
import styled from 'styled-components'
import { defaultPlantPhoto } from '../../mock/images'
import { theme } from '../../theme/tokens'

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: ${theme.colors.forestSoft};
`

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string
}

export function PlantImage({
  src,
  fallbackSrc = defaultPlantPhoto,
  alt = '',
  ...rest
}: Props) {
  const [current, setCurrent] = useState(src || fallbackSrc)

  useEffect(() => {
    setCurrent(src || fallbackSrc)
  }, [src, fallbackSrc])

  return (
    <Img
      {...rest}
      src={current}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (current !== fallbackSrc) setCurrent(fallbackSrc)
      }}
    />
  )
}
