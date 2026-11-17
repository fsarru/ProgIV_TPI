import { useForm } from '@tanstack/react-form'
import { AlertaError } from '@/shared/components/EstadoError'
import ErroresCampo from '@/shared/ui/ErroresCampo'
import Modal from '@/shared/ui/Modal'
import type { Producto, StockForm } from '../types/producto.types'

interface StockModalProps {
  producto: Producto | null // null = cerrado
  guardando: boolean
  error: string | null
  onSubmit: (datos: StockForm) => void
  onCerrar: () => void
}

function Formulario({ producto, guardando, error, onSubmit, onCerrar }: Omit<StockModalProps, 'producto'> & { producto: Producto }) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible } as StockForm,
    validators: {
      onChange: ({ value }) =>
        !Number.isInteger(value.stock) || value.stock < 0 ? { fields: { stock: 'El stock debe ser un entero ≥ 0' } } : undefined,
    },
    onSubmit: ({ value }) => onSubmit(value),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-4"
    >
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Producto: <strong>{producto.nombre}</strong>
      </p>
      <form.Field name="stock">
        {(f) => (
          <div>
            <label htmlFor="stock-nuevo" className="label">
              Stock
            </label>
            <input
              id="stock-nuevo"
              type="number"
              min={0}
              step={1}
              className="input"
              value={Number.isNaN(f.state.value) ? '' : f.state.value}
              onChange={(e) => f.handleChange(e.target.value === '' ? Number.NaN : Number(e.target.value))}
            />
            <ErroresCampo errores={f.state.meta.errors} />
          </div>
        )}
      </form.Field>
      <form.Field name="disponible">
        {(f) => (
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={f.state.value} onChange={(e) => f.handleChange(e.target.checked)} />
            Disponible para la venta
          </label>
        )}
      </form.Field>
      {error && <AlertaError mensaje={error} />}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCerrar} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={guardando} className="btn-primary">
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

function StockModal({ producto, ...resto }: StockModalProps) {
  if (!producto) return null
  return (
    <Modal titulo="Stock y disponibilidad" onCerrar={resto.onCerrar}>
      <Formulario key={producto.id} producto={producto} {...resto} />
    </Modal>
  )
}

export default StockModal
