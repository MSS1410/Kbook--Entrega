import React, { useState } from 'react'
import styled from 'styled-components'
import { AVATAR_PLACEHOLDER } from '../../../constants/media'

const Wrapper = styled.div`
  width: ${({ $fill, $size }) => ($fill ? '100%' : `${$size}px`)};
  height: ${({ $fill, $size }) => ($fill ? '100%' : `${$size}px`)};
  border-radius: ${({ $square, $radius }) =>
    $square ? $radius ?? '12px' : '9999px'};
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-muted, #f1f5f9);
  font-weight: 600;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

/**
 * Props:
 * - src, name
 * - size (número, por defecto 48)
 * - fill (true => se ajusta al 100% del contenedor)
 * - square (true => esquinas redondeadas en vez de círculo)
 * - radius (override del radio cuando square=true)
 */
export default function Avatar({
  src,
  name,
  size = 48,
  fill = false,
  square = false,
  radius
}) {
  const [broken, setBroken] = useState(false)
  const showImg = !!src && !broken
  return (
    <Wrapper $fill={fill} $size={size} $square={square} $radius={radius}>
      {showImg ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
          src={src}
          alt={name}
          onError={(e) => {
            if (e.currentTarget.src !== AVATAR_PLACEHOLDER) {
              e.currentTarget.src = AVATAR_PLACEHOLDER
            } else {
              setBroken(true)
            }
          }}
        />
      ) : (
        name?.[0]?.toUpperCase() || 'U'
      )}
    </Wrapper>
  )
}
