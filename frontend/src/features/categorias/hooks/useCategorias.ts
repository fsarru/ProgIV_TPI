import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isForbidden } from '@/shared/api/handleApiError'
import { useNotificationStore } from '@/store/notificationStore'
import { actualizarCategoria, crearCategoria, eliminarCategoria, getCategorias } from '../api/categorias'
import type { Categoria, CategoriaForm } from '../types/categoria.types'

const KEY = ['categorias'] as const

// Estado del servidor: consulta + mutaciones con invalidación. Lo usan el catálogo (solo lectura) y el ABM.
export function useCategorias() {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((s) => s.showNotification)

  const query = useQuery<Categoria[], Error>({ queryKey: KEY, queryFn: getCategorias })

  // Un producto guarda su categoría: al cambiar una categoría también se refrescan los productos
  const invalidar = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: KEY }),
      queryClient.invalidateQueries({ queryKey: ['productos'] }),
    ])
  }
  const avisarError = (e: Error) => {
    if (!isForbidden(e)) showNotification(e.message, 'error') // el 403 ya lo avisó el interceptor
  }

  const crear = useMutation<Categoria, Error, CategoriaForm>({
    mutationFn: crearCategoria,
    onSuccess: async () => {
      await invalidar()
      showNotification('Categoría creada correctamente')
    },
    onError: avisarError,
  })

  const actualizar = useMutation<Categoria, Error, { id: number; datos: CategoriaForm }>({
    mutationFn: ({ id, datos }) => actualizarCategoria(id, datos),
    onSuccess: async () => {
      await invalidar()
      showNotification('Categoría actualizada correctamente')
    },
    onError: avisarError,
  })

  const eliminar = useMutation<void, Error, number>({
    mutationFn: eliminarCategoria,
    onSuccess: async () => {
      await invalidar()
      showNotification('Categoría eliminada correctamente')
    },
    onError: avisarError,
  })

  return {
    categorias: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    crear,
    actualizar,
    eliminar,
  }
}
