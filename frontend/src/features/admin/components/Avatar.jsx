import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  height: 48px;
  width: 48px;
  border-radius: 9999px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-muted, #f1f5f9);
  font-weight: 600;
`

export default function Avatar({ src, name }) {
  if (src) {
    return (
      <Wrapper>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img
          src={src}
          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
        />
      </Wrapper>
    )
  }
  return <Wrapper>{name?.[0]?.toUpperCase() || '?'}</Wrapper>
}
