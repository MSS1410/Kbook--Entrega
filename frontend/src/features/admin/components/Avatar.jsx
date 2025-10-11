import React, { useState } from 'react'
import styled from 'styled-components'
import { AVATAR_PLACEHOLDER } from '../../../constants/media'

// flexible contenedor: circular default, cuadrado si $square
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
 Props esperadas:
src: url de imagen
name: string 
size: px number, default 48
 fill: si true, entonces 100% de padre
square: si true, usa bordes redondeados con  radius que declaramos abajo
radius: % esquina redonda
 */
export default function Avatar({
  src,
  name,
  size = 48,
  fill = false,
  square = false,
  radius
}) {
  const [broken, setBroken] = useState(false) // track fallo de carga
  // solo img si hay src y no rompio
  const showImg = !!src && !broken

  return (
    <Wrapper $fill={fill} $size={size} $square={square} $radius={radius}>
      {showImg ? (
        <img
          src={src}
          alt={name}
          onError={(e) => {
            // fallback a placeholdero, no fallara
            if (e.currentTarget.src !== AVATAR_PLACEHOLDER) {
              e.currentTarget.src = AVATAR_PLACEHOLDER
            } else {
              setBroken(true)
            }
          }}
        />
      ) : (
        // Maximo fallo, inicial del nombre
        name?.[0]?.toUpperCase() || 'U'
      )}
    </Wrapper>
  )
}
