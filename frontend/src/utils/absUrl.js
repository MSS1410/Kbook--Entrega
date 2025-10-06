// helper en cada archivo o en src/utils/absUrl.js
export const absUrl = (u) => {
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  const base =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_API_URL &&
      import.meta.env.VITE_API_URL.replace(/\/$/, '')) ||
    'http://localhost:4000'
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`
}
