import { useQuery } from '@tanstack/react-query'
import { getResumen } from '../api/pedidos'
import type { ResumenPedidos } from '../types/pedido.types'

export function useResumenPedidos() {
  return useQuery<ResumenPedidos, Error>({ queryKey: ['resumen-pedidos'], queryFn: getResumen })
}
