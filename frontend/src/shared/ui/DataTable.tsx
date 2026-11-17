import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { EstadoVacio } from '@/shared/components/EstadoVacio'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  placeholderBusqueda: string
  mensajeVacio: string
  /** Paginación del lado del cliente (el panel pide limit=100 al servidor) */
  paginar?: boolean
  /** Muestra el cuadro de búsqueda global (por defecto sí) */
  buscador?: boolean
  filasPorPagina?: number
}

const flecha = (orden: false | 'asc' | 'desc'): string =>
  orden === 'asc' ? ' ▲' : orden === 'desc' ? ' ▼' : ''

// Tabla genérica con TanStack Table: ordenamiento por columna y búsqueda global
function DataTable<T>({
  data,
  columns,
  placeholderBusqueda,
  mensajeVacio,
  paginar = false,
  buscador = true,
  filasPorPagina = 10,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtro, setFiltro] = useState<string>('')

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: filtro },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltro,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(paginar ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    initialState: { pagination: { pageSize: filasPorPagina } },
  })

  if (data.length === 0) return <EstadoVacio mensaje={mensajeVacio} />

  const filas = table.getRowModel().rows

  return (
    <div className="card space-y-3">
      {buscador && (
        <input
          type="search"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder={placeholderBusqueda}
          aria-label="Buscar"
          className="input max-w-xs"
        />
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-3 py-2 font-semibold ${
                      header.column.getCanSort() ? 'cursor-pointer select-none hover:text-primary' : ''
                    }`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {flecha(header.column.getIsSorted())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-3 py-2 align-top">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filas.length === 0 && (
          <p className="py-4 text-center text-slate-500 dark:text-slate-400">Sin resultados para la búsqueda.</p>
        )}
      </div>
      {paginar && table.getPageCount() > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button type="button" className="btn-secondary" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            ← Anterior
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <button type="button" className="btn-secondary" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}

export default DataTable
