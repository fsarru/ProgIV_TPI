import { EstadoError } from '@/shared/components/EstadoError'
import { TablaSkeleton } from '@/shared/components/Skeleton'
import { formatMoneda } from '@/shared/utils'
import ResumenCard from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/useResumenPedidos'

function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos()

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Resumen del negocio</h2>
      {isLoading && <TablaSkeleton />}
      {isError && <EstadoError mensaje={error?.message ?? 'Error'} onReintentar={() => refetch()} />}
      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pedidos pendientes" valor={data.pendientes} />
          <ResumenCard titulo="En preparación" valor={data.en_preparacion} />
          <ResumenCard titulo="Entregados" valor={data.entregados} />
          <ResumenCard titulo="Cancelados" valor={data.cancelados} />
          <ResumenCard titulo="Pedidos de hoy" valor={data.pedidos_hoy} />
          <ResumenCard titulo="Ingresos (entregados)" valor={formatMoneda(data.ingresos_entregados)} />
        </div>
      )}
    </section>
  )
}

export default AdminResumenPage
