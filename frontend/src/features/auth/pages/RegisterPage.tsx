import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertaError } from '@/shared/components/EstadoError'
import ErroresCampo from '@/shared/ui/ErroresCampo'
import { useNotificationStore } from '@/store/notificationStore'
import { useRegister } from '../hooks/useRegister'
import type { RegistroForm } from '../types/auth.types'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type RegistroConConfirmacion = RegistroForm & { confirmar: string }

const validar = ({ value }: { value: RegistroConConfirmacion }) => {
  const campos: Record<string, string> = {}
  if (value.username.trim().length < 3) campos.username = 'El usuario debe tener al menos 3 caracteres'
  if (value.full_name.trim().length < 2) campos.full_name = 'Ingresá tu nombre completo'
  if (!EMAIL_VALIDO.test(value.email.trim())) campos.email = 'Ingresá un email válido'
  if (value.password.length < 8) campos.password = 'La contraseña debe tener al menos 8 caracteres'
  if (value.confirmar !== value.password) campos.confirmar = 'Las contraseñas no coinciden'
  return Object.keys(campos).length > 0 ? { fields: campos } : undefined
}

const CAMPOS: { name: keyof RegistroConConfirmacion; label: string; type: string; autoComplete: string }[] = [
  { name: 'username', label: 'Usuario', type: 'text', autoComplete: 'username' },
  { name: 'full_name', label: 'Nombre completo', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Contraseña (mínimo 8 caracteres)', type: 'password', autoComplete: 'new-password' },
  { name: 'confirmar', label: 'Repetir contraseña', type: 'password', autoComplete: 'new-password' },
]

function RegisterPage() {
  const navigate = useNavigate()
  const showNotification = useNotificationStore((s) => s.showNotification)
  const registrar = useRegister()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmar: '' } as RegistroConConfirmacion,
    validators: { onChange: validar },
    onSubmit: ({ value }) => {
      setError(null)
      registrar.mutate(
        {
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        },
        {
          onSuccess: () => {
            showNotification('Cuenta creada. Ya podés iniciar sesión.')
            navigate('/login', { replace: true })
          },
          onError: (e) => setError(e.message), // 409 usuario o email repetido, 422...
        },
      )
    },
  })

  return (
    <div className="mx-auto mt-8 max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="card flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Crear cuenta</h2>

        {CAMPOS.map((c) => (
          <form.Field key={c.name} name={c.name}>
            {(f) => (
              <div>
                <label htmlFor={c.name} className="label">
                  {c.label}
                </label>
                <input
                  id={c.name}
                  type={c.type}
                  autoComplete={c.autoComplete}
                  className="input"
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                  onBlur={f.handleBlur}
                />
                <ErroresCampo errores={f.state.meta.errors} />
              </div>
            )}
          </form.Field>
        ))}

        {error && <AlertaError mensaje={error} />}

        <button type="submit" disabled={registrar.isPending} className="btn-primary">
          {registrar.isPending ? 'Creando cuenta...' : 'Registrarme'}
        </button>

        <p className="text-center text-sm text-slate-600 dark:text-slate-300">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
