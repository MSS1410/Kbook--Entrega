//helper
export const absUrl = (u) => {
  if (!u) return '' // tolera vacio
  if (/^https?:\/\//i.test(u)) return u
  // base desde VITE_API_URL //sin barra final// o localhost por defecto
  const base =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_API_URL &&
      import.meta.env.VITE_API_URL.replace(/\/$/, '')) ||
    'http://localhost:4000'
  // asegura una sola barra en la union de  base + path
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`
}
