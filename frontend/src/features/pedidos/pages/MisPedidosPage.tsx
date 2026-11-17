import { useState } from 'react'
import { EstadoError } from '@/shared/components/EstadoError'
import { Paginacion } from '@/shared/components/Paginacion'
import { TablaSkeleton } from '@/shared/components/Skeleton'
import PedidoDetalleModal from '../components/PedidoDetalleModal'
import PedidosTabla from '../components/PedidosTabla'
import { useCancelarPedido } from '../hooks/useCancelarPedido'
import { usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido.types'

const POR_PAGINA = 10

function MisPedidosPage() {
  const [pagina, setPagina] = useState<number>(0)
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const { data, isLoading, isError, error, refetch } = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  const handleCancelar = (pedido: Pedido) => {
    if (window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) cancelar.mutate(pedido.id)
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mis pedidos</h2>

      {isLoading && <TablaSkeleton />}
      {isError && <EstadoError mensaje={error?.message ?? 'Error'} onReintentar={() => refetch()} />}
      {data && (
        <>
          <PedidosTabla
            pedidos={data.items}
            onVerDetalle={setDetalle}
            mensajeVacio="Todavía no hiciste ningún pedido."
            acciones={(p) =>
              // Cancelar solo está disponible en PENDIENTE (RN-04)
              p.estado === 'PENDIENTE' ? (
                <button type="button" className="btn-danger" disabled={cancelar.isPending} onClick={() => handleCancelar(p)}>
                  Cancelar
                </button>
              ) : null
            }
          />
          <Paginacion pagina={pagina} total={data.total} limit={POR_PAGINA} onCambiar={setPagina} />
        </>
      )}

      <PedidoDetalleModal pedido={detalle} onCerrar={() => setDetalle(null)} />
    </section>
  )
}

export default MisPedidosPage
