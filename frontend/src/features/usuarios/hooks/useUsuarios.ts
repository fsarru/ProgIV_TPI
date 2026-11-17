import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isForbidden } from '@/shared/api/handleApiError'
import { useNotificationStore } from '@/store/notificationStore'
import { activarUsuario, desactivarUsuario, getUsuarios } from '../api/usuarios'
import type { UsuarioAdmin } from '../types/usuario.types'

// Administración de cuentas (solo admin): listado, activar y desactivar con invalidación
export function useUsuarios() {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((s) => s.showNotification)

  const query = useQuery<UsuarioAdmin[], Error>({ queryKey: ['usuarios'], queryFn: getUsuarios })

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['usuarios'] })
  const avisarError = (e: Error) => {
    if (!isForbidden(e)) showNotification(e.message, 'error')
  }

  const activar = useMutation<UsuarioAdmin, Error, number>({
    mutationFn: activarUsuario,
    onSuccess: async () => {
      await invalidar()
      showNotification('Usuario activado correctamente')
    },
    onError: avisarError,
  })

  const desactivar = useMutation<UsuarioAdmin, Error, number>({
    mutationFn: desactivarUsuario,
    onSuccess: async () => {
      await invalidar()
      showNotification('Usuario desactivado correctamente')
    },
    onError: avisarError,
  })

  return {
    usuarios: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    activar,
    desactivar,
  }
}
