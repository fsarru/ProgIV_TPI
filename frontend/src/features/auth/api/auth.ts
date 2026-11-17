import { api } from '@/shared/api/axiosInstance'
import type { UsuarioAdmin } from '@/features/usuarios'
import type { LoginCredenciales, MensajeResponse, RegistroForm, UsuarioAuth } from '../types/auth.types'

// El login es un formulario OAuth2 (application/x-www-form-urlencoded) con `username` y `password`
export async function requestLogin({ username, password }: LoginCredenciales): Promise<MensajeResponse> {
  const form = new URLSearchParams({ username, password })
  const { data } = await api.post<MensajeResponse>('/auth/token', form)
  return data
}

export async function requestLogout(): Promise<void> {
  await api.post('/auth/logout')
}

// Usuario de la sesión. Los 401 / 400 los transforma checkSession en «sin sesión».
export async function requestMe(): Promise<UsuarioAuth> {
  const { data } = await api.get<UsuarioAdmin>('/auth/me')
  return { id: data.id, username: data.username, full_name: data.full_name, email: data.email, role: data.role }
}

export async function registrarUsuario(datos: RegistroForm): Promise<UsuarioAdmin> {
  const { data } = await api.post<UsuarioAdmin>('/auth/register', datos)
  return data
}

