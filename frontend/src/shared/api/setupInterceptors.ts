import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { api } from './axiosInstance'
import { handleApiError } from './handleApiError'

const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

// Interceptor de solicitud: NO maneja el token (viaja en la cookie HttpOnly).
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers.set('Accept-Language', 'es')
  return config
})

// 401 de estas rutas es parte de su funcionamiento normal (credenciales incorrectas / «no hay sesión»)
const RUTAS_DE_AUTH = ['/auth/token', '/auth/me']

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? ''
    const esDeAuth = RUTAS_DE_AUTH.some((ruta) => url.includes(ruta))
    const status = error.response?.status
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail

    // Sesión vencida (401) o cuenta desactivada con la sesión abierta (400): se limpia el authStore y
    // ProtectedRoute lleva al login sin recargar la página.
    const sesionVencida = status === 401 && !esDeAuth
    const cuentaDesactivada = status === 400 && detail === CUENTA_DESACTIVADA && !url.includes('/auth/token')
    if (sesionVencida || cuentaDesactivada) {
      useAuthStore.setState({ usuario: null, cargando: false })
      if (cuentaDesactivada) {
        useNotificationStore.getState().showNotification(CUENTA_DESACTIVADA, 'error')
      }
    }
    if (status === 403) {
      // Sesión válida pero sin permisos: se avisa, NO se cierra la sesión
      useNotificationStore.getState().showNotification('Acceso denegado: no tenés permisos para esa acción.', 'error')
    }

    error.message = esDeAuth && typeof detail === 'string' ? detail : handleApiError(error)
    return Promise.reject(error)
  },
)
