import { useState } from 'react'
import { useCategorias } from '@/features/categorias'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { GridSkeleton } from '@/shared/components/Skeleton'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useCartStore } from '@/store/cartStore'
import { useNotificationStore } from '@/store/notificationStore'
import ProductoCard from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'
import type { Producto } from '../types/producto.types'

const POR_PAGINA = 6

function CatalogoPage() {
  // Estado del cliente: filtros y página (la lista en sí la gestiona TanStack Query)
  const [busqueda, setBusqueda] = useState<string>('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const [pagina, setPagina] = useState<number>(0)
  const search = useDebounce(busqueda.trim())

  const { categorias } = useCategorias()
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useProductos({
    skip: pagina * POR_PAGINA, // paginación en el servidor
    limit: POR_PAGINA,
    search,
    categoria_id: categoriaId,
  })

  const agregar = useCartStore((s) => s.agregar)
  const showNotification = useNotificationStore((s) => s.showNotification)

  const handleAgregar = (producto: Producto) => {
    agregar(producto)
    showNotification(`«${producto.nombre}» agregado al carrito`)
  }

  const items = data?.items ?? []

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Catálogo</h2>

      <div className="card flex flex-wrap gap-3">
        <input
          type="search"
          aria-label="Buscar producto"
          placeholder="Buscar por nombre..."
          className="input max-w-xs"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPagina(0)
          }}
        />
        <select
          aria-label="Filtrar por categoría"
          className="input max-w-xs"
          value={categoriaId ?? ''}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
            setPagina(0)
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <GridSkeleton cantidad={POR_PAGINA} />}
      {isError && <EstadoError mensaje={error?.message ?? 'Error'} onReintentar={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && (
        <EstadoVacio mensaje="No encontramos productos con esos filtros." />
      )}
      {items.length > 0 && (
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${isPlaceholderData ? 'opacity-60' : ''}`}
        >
          {items.map((p) => (
            <ProductoCard key={p.id} producto={p} onAgregar={handleAgregar} />
          ))}
        </div>
      )}

      <Paginacion pagina={pagina} total={data?.total ?? 0} limit={POR_PAGINA} onCambiar={setPagina} />
    </section>
  )
}

export default CatalogoPage
