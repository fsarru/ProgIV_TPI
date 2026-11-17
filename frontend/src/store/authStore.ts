import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { requestLogin, requestLogout, requestMe } from '@/features/auth/api/auth'
import type { Role, UsuarioAuth } from '@/features/auth'

interface AuthState {
  usuario: UsuarioAuth | null
  cargando: boolean // true hasta que checkSession confirma (o descarta) la sesión
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  hasRole: (...roles: Role[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      // Lanza si las credenciales son incorrectas o la cuenta está desactivada (el formulario muestra el mensaje)
      login: async (username, password) => {
        await requestLogin({ username, password }) // la cookie HttpOnly la fija el servidor
        const usuario = await requestMe()
        set({ usuario, cargando: false })
      },

      logout: async () => {
        try {
          await requestLogout() // el servidor borra la cookie
        } finally {
          set({ usuario: null, cargando: false })
        }
      },

      // GET /auth/me al montar la aplicación: la cookie es la fuente de verdad, no lo persistido
      checkSession: async () => {
        try {
          set({ usuario: await requestMe(), cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },

      hasRole: (...roles) => {
        const usuario = get().usuario
        return usuario !== null && roles.includes(usuario.role)
      },
    }),
    {
      name: 'auth-storage',
      // Solo se guarda el usuario (nombre, email y rol) para pintar la interfaz sin parpadeo: NUNCA el token
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
