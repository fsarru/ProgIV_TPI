import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCartStore } from '@/store/cartStore'
import { useNotificationStore } from '@/store/notificationStore'
import { crearPedido } from '../api/pedidos'
import type { Pedido, PedidoCreate } from '../types/pedido.types'

export function useCrearPedido() {
  const queryClient = useQueryClient()
  const vaciar = useCartStore((s) => s.vaciar)
  const showNotification = useNotificationStore((s) => s.showNotification)

  return useMutation<Pedido, Error, PedidoCreate>({
    mutationFn: crearPedido,
    onSuccess: async () => {
      vaciar() // el pedido se confirmó: el carrito vuelve a estar vacío
      // El stock cambió (RN-01): se refrescan los pedidos y el catálogo
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
        queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] }),
      ])
      showNotification('¡Pedido creado correctamente!')
    },
    onError: (e) => showNotification(e.message, 'error'), // 400 stock insuficiente / no disponible...
  })
}
