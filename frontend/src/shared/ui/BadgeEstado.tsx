import type { EstadoPedido } from '@/features/pedidos'

const estilos: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  EN_PREPARACION: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ENTREGADO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELADO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const etiquetas: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

// Colorea los cuatro estados del pedido
export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${estilos[estado]}`}>
      {etiquetas[estado]}
    </span>
  )
}
