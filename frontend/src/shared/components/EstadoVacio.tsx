export function EstadoVacio({ mensaje }: { mensaje: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-600 dark:text-slate-400">
      {mensaje}
    </div>
  )
}
