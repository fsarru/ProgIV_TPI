import { useState } from 'react'
import { EstadoError } from '@/shared/components/EstadoError'
import { Paginacion } from '@/shared/components/Paginacion'
import { TablaSkeleton } from '@/shared/components/Skeleton'
import PedidoDetalleModal from '../components/PedidoDetalleModal'
import PedidosTabla from '../components/PedidosTabla'
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido'
import { usePedidos } from '../hooks/usePedidos'
import type { EstadoPedido, Pedido } from '../types/pedido.types'

const POR_PAGINA = 10

const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

// Siguiente paso válido de la máquina de estados (RN-02); los estados terminales no tienen acciones
const AVANCE: Partial<Record<EstadoPedido, { estado: EstadoPedido; etiqueta: string }>> = {
  PENDIENTE: { estado: 'EN_PREPARACION', etiqueta: 'Preparar' },
  EN_PREPARACION: { estado: 'ENTREGADO', etiqueta: 'Entregar' },
}

function AdminPedidosPage() {
  const [pagina, setPagina] = useState<number>(0)
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    estado: estado || undefined,
  })
  const cambiar = useCambiarEstadoPedido()

  const handleCancelar = (p: Pedido) => {
    if (window.confirm(`¿Cancelar el pedido #${p.id}? Se restituye el stock.`)) cambiar.mutate({ id: p.id, estado: 'CANCELADO' })
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Pedidos {data ? `(${data.total})` : ''}</h2>
        <select
          aria-label="Filtrar por estado"
          className="input max-w-xs"
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as EstadoPedido | '')
            setPagina(0)
          }}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <TablaSkeleton />}
      {isError && <EstadoError mensaje={error?.message ?? 'Error'} onReintentar={() => refetch()} />}
      {data && (
        <>
          <PedidosTabla
            pedidos={data.items}
            mostrarCliente
            onVerDetalle={setDetalle}
            mensajeVacio="No hay pedidos para mostrar."
            acciones={(p) => {
              const avance = AVANCE[p.estado]
              if (!avance) return null
              return (
                <>
                  <button
                    type="button"
                    className="btn-primary !px-3 !py-1"
                    disabled={cambiar.isPending}
                    onClick={() => cambiar.mutate({ id: p.id, estado: avance.estado })}
                  >
                    {avance.etiqueta}
                  </button>
                  <button type="button" className="btn-danger" disabled={cambiar.isPending} onClick={() => handleCancelar(p)}>
                    Cancelar
                  </button>
                </>
              )
            }}
          />
          <Paginacion pagina={pagina} total={data.total} limit={POR_PAGINA} onCambiar={setPagina} />
        </>
      )}

      <PedidoDetalleModal pedido={detalle} onCerrar={() => setDetalle(null)} />
    </section>
  )
}

export default AdminPedidosPage
