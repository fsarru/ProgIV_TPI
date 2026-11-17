import { Link } from 'react-router-dom'

function UnauthorizedPage() {
  return (
    <div className="card mx-auto mt-12 max-w-md text-center">
      <h2 className="text-2xl font-bold text-error">Acceso denegado</h2>
      <p className="my-3 text-slate-600 dark:text-slate-300">No tenés permisos para ver esta página.</p>
      <Link to="/" className="btn-primary">
        Volver al inicio
      </Link>
    </div>
  )
}

export default UnauthorizedPage
