import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isForbidden } from '@/shared/api/handleApiError'
import { useNotificationStore } from '@/store/notificationStore'
import {
  actualizarProducto,
  cambiarStock,
  crearProducto,
  eliminarProducto,
  getProductos,
} from '../api/productos'
import type { FiltrosProductos, Producto, ProductoForm, ProductosPaginados, StockForm } from '../types/producto.types'

/** Catálogo público: lista paginada en el servidor. La queryKey incluye los filtros (cada combinación se cachea). */
export function useProductos(filtros: FiltrosProductos) {
  return useQuery<ProductosPaginados, Error>({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData, // al cambiar de página no se vacía la grilla
  })
}

/** Panel de administración: el listado pide limit=100 y la tabla pagina del lado del cliente. */
export function useProductosAdmin() {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((s) => s.showNotification)

  const query = useProductos({ skip: 0, limit: 100 })

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['productos'] })
  const avisarError = (e: Error) => {
    if (!isForbidden(e)) showNotification(e.message, 'error')
  }

  const crear = useMutation<Producto, Error, ProductoForm>({
    mutationFn: crearProducto,
    onSuccess: async () => {
      await invalidar()
      showNotification('Producto creado correctamente')
    },
    onError: avisarError,
  })

  const actualizar = useMutation<Producto, Error, { id: number; datos: ProductoForm }>({
    mutationFn: ({ id, datos }) => actualizarProducto(id, datos),
    onSuccess: async () => {
      await invalidar()
      showNotification('Producto actualizado correctamente')
    },
    onError: avisarError,
  })

  const modificarStock = useMutation<Producto, Error, { id: number; datos: StockForm }>({
    mutationFn: ({ id, datos }) => cambiarStock(id, datos),
    onSuccess: async () => {
      await invalidar()
      showNotification('Stock actualizado correctamente')
    },
    onError: avisarError,
  })

  const eliminar = useMutation<void, Error, number>({
    mutationFn: eliminarProducto,
    onSuccess: async () => {
      await invalidar()
      showNotification('Producto eliminado correctamente')
    },
    onError: avisarError,
  })

  return {
    productos: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    crear,
    actualizar,
    modificarStock,
    eliminar,
  }
}
