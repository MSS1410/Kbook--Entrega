// frontend/src/components/ScrollToTop.jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    // Si hay hash (#seccion), intenta hacer scroll a ese ancla compensando el header.
    if (hash) {
      const id = hash.replace('#', '')
      // Espera un tick para que el DOM del destino exista
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
        }
      })
      return
    }

    // Cambio de ruta o querystring → sube arriba
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [pathname, search, hash])

  return null
}
