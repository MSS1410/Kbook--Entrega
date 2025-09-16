import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000' // ajusta si tu backend corre en otro puerto
})

// Añadimos token si existe
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // debug: log de cabeceras y errores
  console.log(
    '[API request]',
    config.method,
    config.url,
    'headers:',
    config.headers
  )
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.warn(
      '[API response error]',
      err.response?.status,
      err.response?.data
    )
    return Promise.reject(err)
  }
)

export default api
