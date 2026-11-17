import { useForm } from '@tanstack/react-form'
import type { Categoria } from '@/features/categorias'
import { AlertaError } from '@/shared/components/EstadoError'
import ErroresCampo from '@/shared/ui/ErroresCampo'
import Modal from '@/shared/ui/Modal'
import type { Producto, ProductoForm } from '../types/producto.types'

interface ProductoModalProps {
  abierto: boolean
  producto: Producto | null // null = alta; con valor = edición
  categorias: Categoria[]
  guardando: boolean
  error: string | null
  onSubmit: (datos: ProductoForm) => void
  onCerrar: () => void
}

type FormularioProps = Omit<ProductoModalProps, 'abierto'>

const validar = ({ value }: { value: ProductoForm }) => {
  const fields: Record<string, string> = {}
  if (value.nombre.trim().length < 2) fields.nombre = 'El nombre debe tener al menos 2 caracteres'
  if (!Number.isFinite(value.precio_base) || value.precio_base < 0) fields.precio_base = 'Ingresá un precio válido (≥ 0)'
  if (!Number.isInteger(value.stock) || value.stock < 0) fields.stock = 'El stock debe ser un entero ≥ 0'
  if (!value.categoria_id) fields.categoria_id = 'Elegí una categoría'
  return Object.keys(fields).length > 0 ? { fields } : undefined
}

const aNumero = (texto: string): number => (texto === '' ? Number.NaN : Number(texto))

function Formulario({ producto, categorias, guardando, error, onSubmit, onCerrar }: FormularioProps) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? 0,
    } as ProductoForm,
    validators: { onChange: validar },
    onSubmit: ({ value }) =>
      onSubmit({ ...value, nombre: value.nombre.trim(), descripcion: value.descripcion.trim(), imagen_url: value.imagen_url.trim() }),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-4"
    >
      <form.Field name="nombre">
        {(f) => (
          <div>
            <label htmlFor="nombre" className="label">
              Nombre
            </label>
            <input id="nombre" className="input" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />
            <ErroresCampo errores={f.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="categoria_id">
        {(f) => (
          <div>
            <label htmlFor="categoria_id" className="label">
              Categoría
            </label>
            <select
              id="categoria_id"
              className="input"
              value={f.state.value || ''}
              onChange={(e) => f.handleChange(Number(e.target.value))}
              onBlur={f.handleBlur}
            >
              <option value="">Elegí una categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <ErroresCampo errores={f.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-3">
        <form.Field name="precio_base">
          {(f) => (
            <div>
              <label htmlFor="precio_base" className="label">
                Precio
              </label>
              <input
                id="precio_base"
                type="number"
                min={0}
                step="0.01"
                className="input"
                value={Number.isNaN(f.state.value) ? '' : f.state.value}
                onChange={(e) => f.handleChange(aNumero(e.target.value))}
                onBlur={f.handleBlur}
              />
              <ErroresCampo errores={f.state.meta.errors} />
            </div>
          )}
        </form.Field>
        <form.Field name="stock">
          {(f) => (
            <div>
              <label htmlFor="stock" className="label">
                Stock
              </label>
              <input
                id="stock"
                type="number"
                min={0}
                step={1}
                className="input"
                value={Number.isNaN(f.state.value) ? '' : f.state.value}
                onChange={(e) => f.handleChange(aNumero(e.target.value))}
                onBlur={f.handleBlur}
              />
              <ErroresCampo errores={f.state.meta.errors} />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="descripcion">
        {(f) => (
          <div>
            <label htmlFor="descripcion" className="label">
              Descripción (opcional)
            </label>
            <textarea id="descripcion" rows={2} className="input" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
          </div>
        )}
      </form.Field>

      <form.Field name="imagen_url">
        {(f) => (
          <div>
            <label htmlFor="imagen_url" className="label">
              URL de la imagen (opcional)
            </label>
            <input id="imagen_url" type="url" className="input" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
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
          {guardando ? 'Guardando...' : producto ? 'Guardar cambios' : 'Crear'}
        </button>
      </div>
    </form>
  )
}

function ProductoModal({ abierto, producto, ...resto }: ProductoModalProps) {
  if (!abierto) return null
  return (
    <Modal titulo={producto ? 'Editar producto' : 'Nuevo producto'} onCerrar={resto.onCerrar}>
      {/* key: el formulario se reinicia al cambiar de producto */}
      <Formulario key={producto?.id ?? 'nuevo'} producto={producto} {...resto} />
    </Modal>
  )
}

export default ProductoModal
