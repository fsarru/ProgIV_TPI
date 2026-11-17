import { useState } from 'react'
import { useCategorias } from '@/features/categorias'
import { AlertaError, EstadoError } from '@/shared/components/EstadoError'
import { TablaSkeleton } from '@/shared/components/Skeleton'
import ProductoList from '../components/ProductoList'
import ProductoModal from '../components/ProductoModal'
import StockModal from '../components/StockModal'
import { useProductosAdmin } from '../hooks/useProductos'
import type { Producto, ProductoForm, StockForm } from '../types/producto.types'

// ABM de productos (solo admin) con TanStack Table y TanStack Form, más cambio de stock y disponibilidad
function AdminProductosPage() {
  const { productos, total, isLoading, isError, error, refetch, crear, actualizar, modificarStock, eliminar } =
    useProductosAdmin()
  const { categorias } = useCategorias()

  const [modalAbierto, setModalAbierto] = useState<boolean>(false)
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null)
  const [paraStock, setParaStock] = useState<Producto | null>(null)

  const cerrarModal = () => {
    setModalAbierto(false)
    setSeleccionado(null)
  }

  const resetear = () => {
    crear.reset()
    actualizar.reset()
    modificarStock.reset()
    eliminar.reset()
  }

  const abrirAlta = () => {
    resetear()
    setSeleccionado(null)
    setModalAbierto(true)
  }

  const abrirEdicion = (producto: Producto) => {
    resetear()
    setSeleccionado(producto)
    setModalAbierto(true)
  }

  const handleSubmit = (datos: ProductoForm) => {
    if (seleccionado) actualizar.mutate({ id: seleccionado.id, datos }, { onSuccess: cerrarModal })
    else crear.mutate(datos, { onSuccess: cerrarModal })
  }

  const handleStock = (datos: StockForm) => {
    if (paraStock) modificarStock.mutate({ id: paraStock.id, datos }, { onSuccess: () => setParaStock(null) })
  }

  const handleDelete = (producto: Producto) => {
    if (window.confirm(`¿Eliminar el producto "${producto.nombre}"?`)) eliminar.mutate(producto.id)
  }

  const errorModal = (seleccionado ? actualizar.error : crear.error)?.message ?? null

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Productos ({total})</h2>
        <button type="button" onClick={abrirAlta} className="btn-primary">
          + Nuevo producto
        </button>
      </div>

      {eliminar.error && <AlertaError mensaje={eliminar.error.message} />}

      {isLoading && <TablaSkeleton />}
      {isError && <EstadoError mensaje={error?.message ?? 'Error'} onReintentar={() => refetch()} />}
      {!isLoading && !isError && (
        <ProductoList productos={productos} onEditar={abrirEdicion} onStock={(p) => { modificarStock.reset(); setParaStock(p) }} onEliminar={handleDelete} />
      )}

      <ProductoModal
        abierto={modalAbierto}
        producto={seleccionado}
        categorias={categorias}
        guardando={crear.isPending || actualizar.isPending}
        error={errorModal}
        onSubmit={handleSubmit}
        onCerrar={cerrarModal}
      />
      <StockModal
        producto={paraStock}
        guardando={modificarStock.isPending}
        error={modificarStock.error?.message ?? null}
        onSubmit={handleStock}
        onCerrar={() => setParaStock(null)}
      />
    </section>
  )
}

export default AdminProductosPage
