import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useCartStore } from '@/store/cartStore'
import { useThemeStore } from '@/store/themeStore'

const claseLink = ({ isActive }: { isActive: boolean }): string =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-white text-primary' : 'text-white hover:bg-white/20'
  }`

function Navbar() {
  const { usuario, isAdmin, logout } = useAuth()
  const cantidad = useCartStore((s) => s.cantidadTotal())
  const darkMode = useThemeStore((s) => s.darkMode)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout() // borra la cookie en el servidor y limpia el authStore
    navigate('/login', { replace: true })
  }

  return (
    <nav className="bg-primary shadow">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="text-xl font-bold text-white">
          🍔 Food Store
        </Link>

        <div className="flex flex-wrap gap-1">
          <NavLink to="/" end className={claseLink}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseLink}>
            Carrito{cantidad > 0 ? ` (${cantidad})` : ''}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseLink}>
              Mis pedidos
            </NavLink>
          )}
          {isAdmin && (
            <>
              <NavLink to="/admin/resumen" className={claseLink}>
                Resumen
              </NavLink>
              <NavLink to="/admin/categorias" className={claseLink}>
                Categorías
              </NavLink>
              <NavLink to="/admin/productos" className={claseLink}>
                Productos
              </NavLink>
              <NavLink to="/admin/pedidos" className={claseLink}>
                Pedidos
              </NavLink>
              <NavLink to="/admin/usuarios" className={claseLink}>
                Usuarios
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-white">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-semibold transition hover:bg-white/30"
          >
            {darkMode ? '☀ Claro' : '🌙 Oscuro'}
          </button>

          {usuario ? (
            <>
              <span>
                {usuario.full_name}
                <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">{usuario.role}</span>
              </span>
              <button type="button" onClick={handleLogout} className="btn-secondary">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Iniciar sesión
              </Link>
              <Link to="/register" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/20">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
