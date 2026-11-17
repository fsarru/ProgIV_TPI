import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/shared/ui/DataTable'
import type { Categoria } from '../types/categoria.types'

interface CategoriaListProps {
  categorias: Categoria[]
  onEditar: (categoria: Categoria) => void
  onEliminar: (categoria: Categoria) => void
}

function CategoriaList({ categorias, onEditar, onEliminar }: CategoriaListProps) {
  const columns: ColumnDef<Categoria>[] = [
    { accessorKey: 'nombre', header: 'Nombre' },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) => row.original.descripcion || <span className="text-slate-400">—</span>,
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button type="button" className="btn-warning" onClick={() => onEditar(row.original)}>
            Editar
          </button>
          <button type="button" className="btn-danger" onClick={() => onEliminar(row.original)}>
            Eliminar
          </button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={categorias}
      columns={columns}
      placeholderBusqueda="Buscar categoría..."
      mensajeVacio="No hay categorías todavía. Creá la primera con “Nueva categoría”."
    />
  )
}

export default CategoriaList
