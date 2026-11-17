interface ResumenCardProps {
  titulo: string
  valor: string | number
  detalle?: string
}

function ResumenCard({ titulo, valor, detalle }: ResumenCardProps) {
  return (
    <div className="card">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{titulo}</p>
      <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-slate-100">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detalle}</p>}
    </div>
  )
}

export default ResumenCard
