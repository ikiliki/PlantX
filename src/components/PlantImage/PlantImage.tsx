import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'
import { defaultPlantPhoto } from '../../mock/images'
import { Img } from './PlantImage.styles'

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string
}

export function PlantImage({
  src,
  fallbackSrc = defaultPlantPhoto,
  alt = '',
  onLoad,
  ...rest
}: Props) {
  const [current, setCurrent] = useState(src || fallbackSrc)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setCurrent(src || fallbackSrc)
  }, [src, fallbackSrc])

  useEffect(() => {
    setLoaded(Boolean(ref.current?.complete && ref.current.naturalWidth))
  }, [current])

  return (
    <Img
      {...rest}
      ref={ref}
      src={current}
      alt={alt}
      loading="lazy"
      $loaded={loaded}
      onLoad={(event) => {
        setLoaded(true)
        onLoad?.(event)
      }}
      onError={() => {
        if (current !== fallbackSrc) setCurrent(fallbackSrc)
        else setLoaded(true)
      }}
    />
  )
}
