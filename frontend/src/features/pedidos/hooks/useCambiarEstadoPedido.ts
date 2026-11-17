import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isForbidden } from '@/shared/api/handleApiError'
import { useNotificationStore } from '@/store/notificationStore'
import { cambiarEstado } from '../api/pedidos'
import type { EstadoPedido, Pedido } from '../types/pedido.types'

/** Admin: avanza o cancela un pedido según la máquina de estados. Cancelar restituye el stock en el backend. */
export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((s) => s.showNotification)

  return useMutation<Pedido, Error, { id: number; estado: EstadoPedido }>({
    mutationFn: ({ id, estado }) => cambiarEstado(id, estado),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }), // por si se restituyó stock
        queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] }),
      ])
      showNotification('Estado del pedido actualizado')
    },
    onError: (e) => {
      if (!isForbidden(e)) showNotification(e.message, 'error')
    },
  })
}
