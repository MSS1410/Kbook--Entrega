// frontend/src/hooks/useScrollToTopOn.js
import { useEffect } from 'react'

/**
 * Sube al inicio cuando cambien las dependencias dadas (por ejemplo, page).
 * Intenta alinear con el <main>; si no existe, usa window.
 */
export default function useScrollToTopOn(...deps) {
  useEffect(() => {
    const main = document.querySelector('main')
    if (main && typeof main.scrollIntoView === 'function') {
      main.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
