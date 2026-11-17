import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import DataTable from '@/shared/ui/DataTable'
import { formatFecha, formatMoneda } from '@/shared/utils'
import type { Pedido } from '../types/pedido.types'

interface PedidosTablaProps {
  pedidos: Pedido[]
  /** Muestra la columna del cliente (vista del admin) */
  mostrarCliente?: boolean
  /** Botones de la fila: cancelar (cliente) o avanzar / cancelar (admin) */
  acciones: (pedido: Pedido) => ReactNode
  onVerDetalle: (pedido: Pedido) => void
  mensajeVacio: string
}

function PedidosTabla({ pedidos, mostrarCliente = false, acciones, onVerDetalle, mensajeVacio }: PedidosTablaProps) {
  const columns: ColumnDef<Pedido>[] = [
    { accessorKey: 'id', header: '#', cell: ({ row }) => `#${row.original.id}` },
    { accessorKey: 'created_at', header: 'Fecha', cell: ({ row }) => formatFecha(row.original.created_at) },
    ...(mostrarCliente
      ? [{ accessorKey: 'usuario_id', header: 'Cliente', cell: ({ row }) => `Usuario ${row.original.usuario_id}` } as ColumnDef<Pedido>]
      : []),
    { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
    { accessorKey: 'forma_pago', header: 'Pago' },
    { accessorKey: 'total', header: 'Total', cell: ({ row }) => formatMoneda(row.original.total) },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary !px-3 !py-1" onClick={() => onVerDetalle(row.original)}>
            Ver detalle
          </button>
          {acciones(row.original)}
        </div>
      ),
    },
  ]

  return <DataTable data={pedidos} columns={columns} placeholderBusqueda="" mensajeVacio={mensajeVacio} buscador={false} />
}

export default PedidosTabla
