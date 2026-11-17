import type { ColumnDef } from '@tanstack/react-table'
import { useAuth } from '@/features/auth'
import { AlertaError, EstadoError } from '@/shared/components/EstadoError'
import { TablaSkeleton } from '@/shared/components/Skeleton'
import DataTable from '@/shared/ui/DataTable'
import { useUsuarios } from '../hooks/useUsuarios'
import type { UsuarioAdmin } from '../types/usuario.types'

function AdminUsuariosPage() {
  const { usuario: yo } = useAuth()
  const { usuarios, isLoading, isError, error, refetch, activar, desactivar } = useUsuarios()

  const handleDesactivar = (u: UsuarioAdmin) => {
    if (window.confirm(`¿Desactivar la cuenta de ${u.full_name}?`)) desactivar.mutate(u.id)
  }

  const columns: ColumnDef<UsuarioAdmin>[] = [
    { accessorKey: 'username', header: 'Usuario' },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Rol' },
    {
      accessorKey: 'disabled',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.disabled ? (
          <span className="badge-muted">Desactivado</span>
        ) : (
          <span className="badge-success">Activo</span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original
        if (u.disabled) {
          return (
            <button type="button" className="btn-primary" disabled={activar.isPending} onClick={() => activar.mutate(u.id)}>
              Activar
            </button>
          )
        }
        // El botón Desactivar no se muestra en la fila del usuario de la sesión
        if (u.id === yo?.id) return <span className="text-slate-400">—</span>
        return (
          <button type="button" className="btn-danger" disabled={desactivar.isPending} onClick={() => handleDesactivar(u)}>
            Desactivar
          </button>
        )
      },
    },
  ]

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Usuarios ({usuarios.length})</h2>

      {(activar.error || desactivar.error) && (
        <AlertaError mensaje={(activar.error ?? desactivar.error)?.message ?? 'Error'} />
      )}

      {isLoading && <TablaSkeleton />}
      {isError && <EstadoError mensaje={error?.message ?? 'Error'} onReintentar={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable
          data={usuarios}
          columns={columns}
          placeholderBusqueda="Buscar usuario..."
          mensajeVacio="No hay usuarios."
          paginar
        />
      )}
    </section>
  )
}

export default AdminUsuariosPage
