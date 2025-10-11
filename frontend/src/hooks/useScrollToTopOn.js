// frontend/src/hooks/useScrollToTopOn.js
import { useEffect } from 'react'

/**
helper de ux, me mandara siempre al inicio de la pagina, para evitar que muestre el culo de las apges.
cuando cambian las dependencias, sube hasta el inicio.
 */
export default function useScrollToTopOn(...deps) {
  useEffect(() => {
    const main = document.querySelector('main')
    if (main && typeof main.scrollIntoView === 'function') {
      main.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, deps)
}
