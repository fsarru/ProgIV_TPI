interface PaginacionProps {
  pagina: number // base 0
  total: number
  limit: number
  onCambiar: (pagina: number) => void
}

// Paginación en el servidor: la página se traduce a skip = pagina × limit
export function Paginacion({ pagina, total, limit, onCambiar }: PaginacionProps) {
  const paginas = Math.max(1, Math.ceil(total / limit))
  if (paginas <= 1) return null
  return (
    <nav className="flex items-center justify-center gap-3" aria-label="Paginación">
      <button type="button" className="btn-secondary" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
        ← Anterior
      </button>
      <span className="text-sm text-slate-600 dark:text-slate-300">
        Página {pagina + 1} de {paginas}
      </span>
      <button
        type="button"
        className="btn-secondary"
        disabled={pagina + 1 >= paginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente →
      </button>
    </nav>
  )
}
