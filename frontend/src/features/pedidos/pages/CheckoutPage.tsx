import { Navigate, useNavigate } from 'react-router-dom'
import { formatMoneda } from '@/shared/utils'
import { useCartStore } from '@/store/cartStore'
import CheckoutForm from '../components/CheckoutForm'
import type { CheckoutDatos } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/useCrearPedido'

function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const crear = useCrearPedido()

  // Sin ítems no hay nada que confirmar (salvo que el pedido recién se haya creado y se esté redirigiendo)
  if (items.length === 0 && !crear.isSuccess) return <Navigate to="/carrito" replace />

  const handleSubmit = (datos: CheckoutDatos) => {
    crear.mutate(
      {
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: datos.forma_pago,
        direccion_entrega: datos.direccion_entrega,
        notas: datos.notas || undefined,
      },
      { onSuccess: () => navigate('/mis-pedidos', { replace: true }) },
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Confirmar pedido</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 text-lg font-bold text-slate-800 dark:text-slate-100">Tu pedido</h3>
          <ul className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-200">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-2">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatMoneda(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-slate-200 pt-2 text-right text-lg font-bold text-primary dark:border-slate-700">
            Total: {formatMoneda(total)}
          </p>
        </div>
        <CheckoutForm enviando={crear.isPending} error={crear.error?.message ?? null} onSubmit={handleSubmit} />
      </div>
    </section>
  )
}

export default CheckoutPage
