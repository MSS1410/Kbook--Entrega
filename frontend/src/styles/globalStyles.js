import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  /* Reset básico */
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html, body, #root { height: 100%; }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  img { max-width: 100%; display: block; }
  ul { list-style: none; }
  button { cursor: pointer; font-family: inherit; }

  /* Enlaces: usamos el color 'accent' como tono de interacción por defecto */
  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: none;
    transition: opacity .15s ease;
  }
  a:hover { opacity: .9; }

  /* Selección de texto coherente con tu morado */
  ::selection {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.onPrimary};
  }

  /* Scrollbar minimal (opcional, soportado en WebKit/Blink) */
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: ${({ theme }) =>
    theme.colors.mutedSurface}; }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover { background: ${({ theme }) =>
    theme.colors.mutedText}; }
`

export default GlobalStyles
