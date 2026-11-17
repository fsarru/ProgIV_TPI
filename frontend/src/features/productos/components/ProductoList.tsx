import type { ColumnDef } from '@tanstack/react-table'
import { formatMoneda } from '@/shared/utils'
import DataTable from '@/shared/ui/DataTable'
import type { Producto } from '../types/producto.types'

interface ProductoListProps {
  productos: Producto[]
  onEditar: (producto: Producto) => void
  onStock: (producto: Producto) => void
  onEliminar: (producto: Producto) => void
}

function ProductoList({ productos, onEditar, onStock, onEliminar }: ProductoListProps) {
  const columns: ColumnDef<Producto>[] = [
    { accessorKey: 'nombre', header: 'Nombre' },
    {
      id: 'categoria',
      header: 'Categoría',
      accessorFn: (p) => p.categoria?.nombre ?? '—',
    },
    {
      accessorKey: 'precio_base',
      header: 'Precio',
      cell: ({ row }) => formatMoneda(row.original.precio_base),
    },
    { accessorKey: 'stock', header: 'Stock' },
    {
      accessorKey: 'disponible',
      header: 'Disponible',
      cell: ({ row }) =>
        row.original.disponible ? (
          <span className="badge-success">Sí</span>
        ) : (
          <span className="badge-muted">No</span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-warning" onClick={() => onEditar(row.original)}>
            Editar
          </button>
          <button type="button" className="btn-secondary !px-3 !py-1" onClick={() => onStock(row.original)}>
            Stock
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
      data={productos}
      columns={columns}
      placeholderBusqueda="Buscar producto..."
      mensajeVacio="No hay productos todavía. Creá el primero con “Nuevo producto”."
      paginar
    />
  )
}

export default ProductoList
