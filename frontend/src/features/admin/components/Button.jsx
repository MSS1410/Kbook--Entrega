import styled, { css } from 'styled-components'

const variants = {
  primary: css`
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.onPrimary};
    &:hover {
      opacity: 0.92;
    }
  `,
  ghost: css`
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.accent};
    border: 1px solid ${({ theme }) => theme.colors.border};
    &:hover {
      background: ${({ theme }) => theme.colors.mutedSurface};
    }
  `,
  danger: css`
    background: #ef4444;
    color: #fff;
    &:hover {
      opacity: 0.92;
    }
  `
}

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 0;
  cursor: pointer;
  font-size: 14px;
  ${({ $variant }) => variants[$variant || 'primary']}
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export default Button
