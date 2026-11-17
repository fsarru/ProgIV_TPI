import { useForm } from '@tanstack/react-form'
import type { Categoria, CategoriaForm } from '../types/categoria.types'
import ErroresCampo from '@/shared/ui/ErroresCampo'
import { AlertaError } from '@/shared/components/EstadoError'
import Modal from '@/shared/ui/Modal'

interface CategoriaModalProps {
  abierto: boolean
  categoria: Categoria | null // null = alta; con valor = edición
  guardando: boolean
  error: string | null
  onSubmit: (datos: CategoriaForm) => void
  onCerrar: () => void
}

interface FormularioProps {
  categoria: Categoria | null
  guardando: boolean
  error: string | null
  onSubmit: (datos: CategoriaForm) => void
  onCerrar: () => void
}

// Validación declarativa (devuelve errores por campo)
const validar = ({ value }: { value: CategoriaForm }) => {
  if (!value.nombre.trim()) return { fields: { nombre: 'El nombre es obligatorio' } }
  return undefined
}

function Formulario({ categoria, guardando, error, onSubmit, onCerrar }: FormularioProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    } as CategoriaForm,
    validators: { onChange: validar },
    onSubmit: ({ value }) => onSubmit({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() }),
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
            <input
              id="nombre"
              className="input"
              value={f.state.value}
              onChange={(e) => f.handleChange(e.target.value)}
              onBlur={f.handleBlur}
            />
            <ErroresCampo errores={f.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(f) => (
          <div>
            <label htmlFor="descripcion" className="label">
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              rows={3}
              className="input"
              value={f.state.value}
              onChange={(e) => f.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      {error && <AlertaError mensaje={error} />}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCerrar} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={guardando} className="btn-primary">
          {guardando ? 'Guardando...' : categoria ? 'Guardar cambios' : 'Crear'}
        </button>
      </div>
    </form>
  )
}

function CategoriaModal({ abierto, categoria, guardando, error, onSubmit, onCerrar }: CategoriaModalProps) {
  if (!abierto) return null

  return (
    <Modal titulo={categoria ? 'Editar categoría' : 'Nueva categoría'} onCerrar={onCerrar}>
      {/* key: el formulario se reinicia al cambiar de categoría */}
      <Formulario
        key={categoria?.id ?? 'nueva'}
        categoria={categoria}
        guardando={guardando}
        error={error}
        onSubmit={onSubmit}
        onCerrar={onCerrar}
      />
    </Modal>
  )
}

export default CategoriaModal
