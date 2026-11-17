export type Role = 'user' | 'admin'

/** Lo que guarda el authStore del usuario de la sesión (nunca el token) */
export interface UsuarioAuth {
  id: number
  username: string
  full_name: string
  email: string
  role: Role
}

export interface LoginCredenciales {
  username: string
  password: string
}

export interface RegistroForm {
  username: string
  full_name: string
  email: string
  password: string
}

export interface MensajeResponse {
  message: string
}
