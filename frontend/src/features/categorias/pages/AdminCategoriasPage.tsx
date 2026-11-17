import { useState } from 'react'
import { AlertaError, EstadoError } from '@/shared/components/EstadoError'
import { TablaSkeleton } from '@/shared/components/Skeleton'
import CategoriaList from '../components/CategoriaList'
import CategoriaModal from '../components/CategoriaModal'
import { useCategorias } from '../hooks/useCategorias'
import type { Categoria, CategoriaForm } from '../types/categoria.types'

// ABM de categorías (solo admin): la página orquesta la interfaz; los datos y mutaciones vienen de useCategorias
function AdminCategoriasPage() {
  const { categorias, isLoading, isError, error, refetch, crear, actualizar, eliminar } = useCategorias()

  // Client state: modal controlado con estado booleano
  const [modalAbierto, setModalAbierto] = useState<boolean>(false)
  const [seleccionada, setSeleccionada] = useState<Categoria | null>(null)

  const cerrarModal = () => {
    setModalAbierto(false)
    setSeleccionada(null)
  }

  const resetear = () => {
    crear.reset()
    actualizar.reset()
    eliminar.reset()
  }

  const abrirAlta = () => {
    resetear()
    setSeleccionada(null)
    setModalAbierto(true)
  }

  const abrirEdicion = (categoria: Categoria) => {
    resetear()
    setSeleccionada(categoria)
    setModalAbierto(true)
  }

  const handleSubmit = (datos: CategoriaForm) => {
    if (seleccionada) actualizar.mutate({ id: seleccionada.id, datos }, { onSuccess: cerrarModal })
    else crear.mutate(datos, { onSuccess: cerrarModal })
  }

  const handleDelete = (categoria: Categoria) => {
    if (window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) {
      eliminar.mutate(categoria.id)
    }
  }

  const errorModal = (seleccionada ? actualizar.error : crear.error)?.message ?? null

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Categorías ({categorias.length})</h2>
        <button type="button" onClick={abrirAlta} className="btn-primary">
          + Nueva categoría
        </button>
      </div>

      {eliminar.error && <AlertaError mensaje={eliminar.error.message} />}

      {isLoading && <TablaSkeleton />}
      {isError && <EstadoError mensaje={error?.message ?? 'Error'} onReintentar={() => refetch()} />}
      {!isLoading && !isError && (
        <CategoriaList
          categorias={categorias}
          onEditar={abrirEdicion}
          onEliminar={handleDelete}
        />
      )}

      <CategoriaModal
        abierto={modalAbierto}
        categoria={seleccionada}
        guardando={crear.isPending || actualizar.isPending}
        error={errorModal}
        onSubmit={handleSubmit}
        onCerrar={cerrarModal}
      />
    </section>
  )
}

export default AdminCategoriasPage
