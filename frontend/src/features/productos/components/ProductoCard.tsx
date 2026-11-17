import { formatMoneda } from '@/shared/utils'
import type { Producto } from '../types/producto.types'

interface ProductoCardProps {
  producto: Producto
  onAgregar: (producto: Producto) => void
}

const IMAGEN_VACIA = 'https://placehold.co/600x400?text=Sin+imagen'

function ProductoCard({ producto, onAgregar }: ProductoCardProps) {
  const sinStock = producto.stock <= 0
  const noVendible = !producto.disponible || sinStock

  return (
    <article className="card flex flex-col gap-2">
      <img
        src={producto.imagen_url || IMAGEN_VACIA}
        alt={producto.nombre}
        loading="lazy"
        className="h-32 w-full rounded-lg object-cover"
        onError={(e) => {
          e.currentTarget.src = IMAGEN_VACIA
        }}
      />
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{producto.nombre}</h3>
        {producto.categoria && <span className="badge-muted shrink-0">{producto.categoria.nombre}</span>}
      </div>
      {producto.descripcion && <p className="text-sm text-slate-600 dark:text-slate-300">{producto.descripcion}</p>}
      <div className="mt-auto flex items-center justify-between">
        <span className="text-lg font-bold text-primary">{formatMoneda(producto.precio_base)}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {noVendible ? 'No disponible' : `Stock: ${producto.stock}`}
        </span>
      </div>
      <button type="button" className="btn-primary" disabled={noVendible} onClick={() => onAgregar(producto)}>
        {noVendible ? 'Sin stock' : 'Agregar al carrito'}
      </button>
    </article>
  )
}

export default ProductoCard
