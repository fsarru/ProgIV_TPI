import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isForbidden } from '@/shared/api/handleApiError'
import { useNotificationStore } from '@/store/notificationStore'
import { cancelarPedido } from '../api/pedidos'
import type { Pedido } from '../types/pedido.types'

/** Cliente: cancela un pedido propio (solo PENDIENTE). El backend restituye el stock. */
export function useCancelarPedido() {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((s) => s.showNotification)

  return useMutation<Pedido, Error, number>({
    mutationFn: cancelarPedido,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
        queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] }),
      ])
      showNotification('Pedido cancelado. El stock fue restituido.')
    },
    onError: (e) => {
      if (!isForbidden(e)) showNotification(e.message, 'error')
    },
  })
}
