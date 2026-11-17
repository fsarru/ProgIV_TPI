import { Link } from 'react-router-dom'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { formatMoneda } from '@/shared/utils'
import { useCartStore } from '@/store/cartStore'

function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Carrito</h2>

      {items.length === 0 ? (
        <>
          <EstadoVacio mensaje="Tu carrito está vacío." />
          <Link to="/" className="btn-primary self-start">
            Ver el catálogo
          </Link>
        </>
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">Precio</th>
                  <th className="px-3 py-2">Cantidad</th>
                  <th className="px-3 py-2">Subtotal</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.producto_id} className="border-b border-slate-100 dark:border-slate-700">
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">{i.nombre}</td>
                    <td className="px-3 py-2">{formatMoneda(i.precio_unitario)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button type="button" aria-label={`Quitar una unidad de ${i.nombre}`} className="btn-secondary !px-2 !py-0.5" onClick={() => cambiarCantidad(i.producto_id, i.cantidad - 1)}>
                          −
                        </button>
                        <span className="w-6 text-center" aria-label={`Cantidad de ${i.nombre}`}>{i.cantidad}</span>
                        <button type="button" aria-label={`Agregar una unidad de ${i.nombre}`} className="btn-secondary !px-2 !py-0.5" onClick={() => cambiarCantidad(i.producto_id, i.cantidad + 1)}>
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">{formatMoneda(i.precio_unitario * i.cantidad)}</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" className="btn-danger" onClick={() => quitar(i.producto_id)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card flex flex-wrap items-center justify-between gap-3">
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Total: {formatMoneda(total)}</p>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary" onClick={vaciar}>
                Vaciar carrito
              </button>
              <Link to="/checkout" className="btn-primary">
                Continuar con el pedido
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default CarritoPage
