import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getPedidos } from '../api/pedidos'
import type { FiltrosPedidos, PedidosPaginados } from '../types/pedido.types'

/** Pedidos propios (user) o todos (admin): el backend decide según el rol de la sesión. */
export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery<PedidosPaginados, Error>({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}
