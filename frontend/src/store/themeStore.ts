import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  darkMode: boolean
  toggleTheme: () => void
}

// Preferencia de interfaz: SÍ se persiste (a diferencia de la sesión, que se recupera con /auth/me)
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleTheme: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    { name: 'theme-storage' }, // clave en localStorage
  ),
)

// La variante `dark:` de Tailwind se activa con la clase "dark" en <html> (ver index.css).
// Se sincroniza acá, junto al store, para que App.tsx no tenga lógica de interfaz.
const aplicarTema = (darkMode: boolean) => document.documentElement.classList.toggle('dark', darkMode)

aplicarTema(useThemeStore.getState().darkMode) // localStorage es síncrono: el store ya está rehidratado
useThemeStore.subscribe((state) => aplicarTema(state.darkMode))
