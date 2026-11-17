interface EstadoErrorProps {
  mensaje: string
  onReintentar: () => void
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div className="card border border-error/30 text-center">
      <p className="font-semibold text-error">No se pudieron cargar los datos</p>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{mensaje}</p>
      <button type="button" onClick={onReintentar} className="btn-primary">
        Reintentar
      </button>
    </div>
  )
}

export function AlertaError({ mensaje }: { mensaje: string }) {
  return (
    <p role="alert" className="rounded-lg border border-error/30 bg-red-50 px-3 py-2 text-sm text-error dark:bg-red-950">
      {mensaje}
    </p>
  )
}
