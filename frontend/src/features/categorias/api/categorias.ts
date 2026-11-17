import { api } from '@/shared/api/axiosInstance'
import type { Categoria, CategoriaForm } from '../types/categoria.types'

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>('/categorias')
  return data
}

export async function crearCategoria(datos: CategoriaForm): Promise<Categoria> {
  const { data } = await api.post<Categoria>('/categorias', {
    nombre: datos.nombre,
    descripcion: datos.descripcion || null,
  })
  return data
}

export async function actualizarCategoria(id: number, datos: CategoriaForm): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, {
    nombre: datos.nombre,
    descripcion: datos.descripcion || null,
  })
  return data
}

export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`)
}
