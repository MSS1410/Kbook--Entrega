import axios from 'axios'

// api/= cliente HTTP
// en cada archivo api agrupo enpoints de un dominio, usuarios, uploads, contacto...
//asi, las pantallas no saben de rutas ni headers, solo llaman a enpoints que decida

//los hooks seran para la logica de estado y ciclo de vida para ui:
// encapsulo fetch estado errores efectos lat, las vistas consumen datos y acciones desde los hooks con api limpia


//cliente axios comun para todo proyecto
const api = axios.create({
  baseURL: 'http://localhost:4000' //  backend defecto
})

// añado token a cada request, si existe en sessionstorage
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // log headers y errores
  console.log(
    '[API request]',
    config.method,
    config.url,
    'headers:',
    config.headers
  )
  return config
})
// manejo de errores global
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
