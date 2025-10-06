const theme = {
  colors: {
    // === Paleta base que ya tenías ===
    primary: 'rgb(80, 24, 133)', // Morado principal
    secondary: '#03DAC6', // Teal de acento
    background: '#F5F5F5', // Fondo de página (general)
    surface: '#FFFFFF', // Fondo de componentes
    error: '#B00020', // Mensajes de error
    text: '#000000', // Texto principal
    onPrimary: '#FFFFFF', // Texto sobre primary
    onSecondary: '#000000', // Texto sobre secondary
    onBackground: '#000000', // Texto sobre background
    onSurface: '#000000', // Texto sobre surface
    onError: '#FFFFFF', // Texto sobre error

    // === Nuevos tokens (usados por Admin y útiles para todo el sitio) ===
    // Header público/admin: blanco + texto lila
    headerBg: '#FFFFFF',
    headerText: 'rgb(80, 24, 133)',

    // Colores utilitarios
    bg: '#F5F5F5', // alias de background (comodín)
    cardBg: '#FFFFFF', // alias explícito para tarjetas
    border: '#E2E8F0', // bordes suaves
    mutedSurface: '#F8FAFC', // superficies muy claras (hover/ghost)
    mutedText: '#64748B', // texto secundario
    accent: 'rgb(80, 24, 133)' // alias de primary para enlaces/acciones
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },

  fonts: {
    body: 'Arial, sans-serif',
    heading: 'Helvetica Neue, sans-serif',
    monospace: 'Menlo, monospace'
  },

  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    xxl: '2rem'
  },

  radii: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    round: '50%'
  },

  // (opcional) sombras simples reutilizables
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.06)',
    md: '0 2px 8px rgba(0,0,0,0.1)'
  }
}

export default theme
