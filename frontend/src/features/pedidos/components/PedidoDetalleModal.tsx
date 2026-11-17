import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import Modal from '@/shared/ui/Modal'
import { formatFecha, formatMoneda } from '@/shared/utils'
import type { Pedido } from '../types/pedido.types'

interface PedidoDetalleModalProps {
  pedido: Pedido | null // null = cerrado
  onCerrar: () => void
}

function PedidoDetalleModal({ pedido, onCerrar }: PedidoDetalleModalProps) {
  if (!pedido) return null
  return (
    <Modal titulo={`Pedido #${pedido.id}`} onCerrar={onCerrar}>
      <div className="flex flex-col gap-3 text-sm text-slate-700 dark:text-slate-200">
        <div className="flex items-center justify-between">
          <BadgeEstado estado={pedido.estado} />
          <span>{formatFecha(pedido.created_at)}</span>
        </div>
        <p>
          <strong>Entrega:</strong> {pedido.direccion_entrega}
        </p>
        <p>
          <strong>Pago:</strong> {pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
        </p>
        {pedido.notas && (
          <p>
            <strong>Notas:</strong> {pedido.notas}
          </p>
        )}
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-1">Producto</th>
              <th className="py-1 text-right">Cant.</th>
              <th className="py-1 text-right">Precio</th>
              <th className="py-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((i) => (
              <tr key={i.producto_id} className="border-b border-slate-100 dark:border-slate-700">
                <td className="py-1">{i.nombre_producto}</td>
                <td className="py-1 text-right">{i.cantidad}</td>
                <td className="py-1 text-right">{formatMoneda(i.precio_unitario)}</td>
                <td className="py-1 text-right">{formatMoneda(i.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-right text-lg font-bold text-primary">Total: {formatMoneda(pedido.total)}</p>
      </div>
    </Modal>
  )
}

export default PedidoDetalleModal
