// API pública de la feature auth: lo único que otras partes de la app pueden importar
export { default as LoginPage } from './pages/LoginPage'
export { default as RegisterPage } from './pages/RegisterPage'
export { default as UnauthorizedPage } from './pages/UnauthorizedPage'
export { useAuth } from './hooks/useAuth'
export type { Role, UsuarioAuth, LoginCredenciales, RegistroForm } from './types/auth.types'
