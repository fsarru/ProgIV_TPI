import axios from 'axios'

interface DetalleValidacion {
  msg: string
}

// FastAPI responde los errores como { "detail": ... }:
// cadena en 400/404/409, lista de errores de validación en 422.
export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error.message : 'Error inesperado.'
  if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder.'
  if (!error.response) return 'No se pudo conectar con el servidor.'

  const { status, data } = error.response
  const detail = (data as { detail?: unknown } | undefined)?.detail

  switch (status) {
    case 401:
      return 'La sesión venció. Es necesario iniciar sesión de nuevo.'
    case 403:
      return 'No tiene permisos para realizar esta acción.'
    case 422:
      return Array.isArray(detail)
        ? (detail as DetalleValidacion[]).map((d) => d.msg).join('. ')
        : 'Los datos enviados no son válidos.'
  }
  if (typeof detail === 'string') return detail // 400, 404, 409: el mensaje del backend es el más preciso
  if (status < 500) return 'No se pudo completar la operación.'
  return 'Error del servidor. Intente nuevamente más tarde.'
}

/** ¿El error es un 403 de la API? (el interceptor ya avisó «acceso denegado»: no se repite el aviso) */
export function isForbidden(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 403
}
