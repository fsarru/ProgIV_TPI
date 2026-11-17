export function TablaSkeleton() {
  return (
    <div className="card animate-pulse space-y-3" aria-label="Cargando">
      <div className="h-8 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="h-6 rounded bg-slate-200 dark:bg-slate-700" />
      ))}
    </div>
  )
}

export function GridSkeleton({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Cargando">
      {Array.from({ length: cantidad }, (_, n) => (
        <div key={n} className="card animate-pulse space-y-3">
          <div className="h-32 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  )
}
