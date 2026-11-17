import { useForm } from '@tanstack/react-form'
import { AlertaError } from '@/shared/components/EstadoError'
import ErroresCampo from '@/shared/ui/ErroresCampo'
import type { FormaPago } from '../types/pedido.types'

export interface CheckoutDatos {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  enviando: boolean
  error: string | null
  onSubmit: (datos: CheckoutDatos) => void
}

const validar = ({ value }: { value: CheckoutDatos }) => {
  const fields: Record<string, string> = {}
  const direccion = value.direccion_entrega.trim()
  if (direccion.length < 5 || direccion.length > 200) fields.direccion_entrega = 'La dirección debe tener entre 5 y 200 caracteres'
  if (value.notas.length > 500) fields.notas = 'Las notas no pueden superar los 500 caracteres'
  return Object.keys(fields).length > 0 ? { fields } : undefined
}

function CheckoutForm({ enviando, error, onSubmit }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO', notas: '' } as CheckoutDatos,
    validators: { onChange: validar },
    onSubmit: ({ value }) => onSubmit({ ...value, direccion_entrega: value.direccion_entrega.trim(), notas: value.notas.trim() }),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="card flex flex-col gap-4"
    >
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Datos de entrega y pago</h3>

      <form.Field name="direccion_entrega">
        {(f) => (
          <div>
            <label htmlFor="direccion_entrega" className="label">
              Dirección de entrega
            </label>
            <input
              id="direccion_entrega"
              className="input"
              autoComplete="street-address"
              value={f.state.value}
              onChange={(e) => f.handleChange(e.target.value)}
              onBlur={f.handleBlur}
            />
            <ErroresCampo errores={f.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(f) => (
          <div>
            <label htmlFor="forma_pago" className="label">
              Forma de pago
            </label>
            <select id="forma_pago" className="input" value={f.state.value} onChange={(e) => f.handleChange(e.target.value as FormaPago)}>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>
        )}
      </form.Field>

      <form.Field name="notas">
        {(f) => (
          <div>
            <label htmlFor="notas" className="label">
              Notas (opcional)
            </label>
            <textarea id="notas" rows={3} className="input" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
            <ErroresCampo errores={f.state.meta.errors} />
          </div>
        )}
      </form.Field>

      {error && <AlertaError mensaje={error} />}

      <button type="submit" disabled={enviando} className="btn-primary">
        {enviando ? 'Confirmando...' : 'Confirmar pedido'}
      </button>
    </form>
  )
}

export default CheckoutForm
