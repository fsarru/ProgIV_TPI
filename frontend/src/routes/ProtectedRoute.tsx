import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '@/features/auth'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  /** Roles que pueden entrar. Si no se indica, alcanza con tener sesión. */
  allowedRoles?: Role[]
}

// Ruta padre sin path: decide si muestra las rutas hijas mediante <Outlet />.
// Organiza la navegación, pero NO reemplaza la validación del backend (401 y 403 en cada petición).
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const hasRole = useAuthStore((s) => s.hasRole)
  const location = useLocation()

  // 1. Mientras checkSession confirma la sesión: indicador de carga y SIN redirigir
  if (cargando) {
    return (
      <p role="status" className="p-8 text-center text-slate-500 dark:text-slate-400">
        Verificando sesión…
      </p>
    )
  }
  // 2. Sin sesión -> /login (state.from guarda la pantalla pedida para volver a ella)
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />
  // 3. Con sesión pero rol no permitido -> /unauthorized
  if (allowedRoles && !hasRole(...allowedRoles)) return <Navigate to="/unauthorized" replace />
  // 4. Sesión válida y rol permitido -> la ruta hija
  return <Outlet />
}
