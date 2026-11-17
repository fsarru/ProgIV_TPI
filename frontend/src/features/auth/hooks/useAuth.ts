import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

// Fachada del authStore para los componentes: usuario, rol y acciones con estado de envío y error
export function useAuth() {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const loginStore = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  /** true si inició sesión; si no, deja el mensaje en `error` (credenciales incorrectas, cuenta desactivada…) */
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsSubmitting(true)
    setError(null)
    try {
      await loginStore(username, password)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    usuario,
    cargando,
    isAuthenticated: usuario !== null,
    isAdmin: usuario?.role === 'admin',
    login,
    logout,
    isSubmitting,
    error,
  }
}
