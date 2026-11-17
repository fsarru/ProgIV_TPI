import { useForm } from '@tanstack/react-form'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { AlertaError } from '@/shared/components/EstadoError'
import ErroresCampo from '@/shared/ui/ErroresCampo'
import { useAuth } from '../hooks/useAuth'
import type { LoginCredenciales } from '../types/auth.types'

const validar = ({ value }: { value: LoginCredenciales }) => {
  const campos: Record<string, string> = {}
  if (!value.username.trim()) campos.username = 'El usuario es obligatorio'
  if (!value.password) campos.password = 'La contraseña es obligatoria'
  return Object.keys(campos).length > 0 ? { fields: campos } : undefined
}

function LoginPage() {
  const { isAuthenticated, login, isSubmitting, error } = useAuth()
  const location = useLocation()
  // ProtectedRoute guarda en `state.from` la pantalla pedida: después del login se vuelve a ella
  const destino: string = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  const form = useForm({
    defaultValues: { username: '', password: '' } as LoginCredenciales,
    validators: { onChange: validar },
    // Si las credenciales son incorrectas, useAuth deja el mensaje en `error` (sin recargar la página)
    onSubmit: ({ value }) => login(value.username.trim(), value.password),
  })

  if (isAuthenticated) return <Navigate to={destino} replace />

  return (
    <div className="mx-auto mt-12 max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="card flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Iniciar sesión</h2>

        <form.Field name="username">
          {(f) => (
            <div>
              <label htmlFor="username" className="label">
                Usuario
              </label>
              <input
                id="username"
                autoComplete="username"
                className="input"
                value={f.state.value}
                onChange={(e) => f.handleChange(e.target.value)}
                onBlur={f.handleBlur}
              />
              <ErroresCampo errores={f.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(f) => (
            <div>
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input"
                value={f.state.value}
                onChange={(e) => f.handleChange(e.target.value)}
                onBlur={f.handleBlur}
              />
              <ErroresCampo errores={f.state.meta.errors} />
            </div>
          )}
        </form.Field>

        {error && <AlertaError mensaje={error} />}

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p className="text-center text-sm text-slate-600 dark:text-slate-300">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Registrate
          </Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
