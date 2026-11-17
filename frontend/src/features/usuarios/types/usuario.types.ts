import type { Role } from '@/features/auth'

// Mismos nombres de campo que UserPublic del backend
export interface UsuarioAdmin {
  id: number
  username: string
  full_name: string
  email: string
  role: Role
  disabled: boolean
  created_at: string
}
