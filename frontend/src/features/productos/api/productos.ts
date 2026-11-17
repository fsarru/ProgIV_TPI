import { api } from '@/shared/api/axiosInstance'
import type { FiltrosProductos, Producto, ProductoForm, ProductosPaginados, StockForm } from '../types/producto.types'

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>('/productos', {
    params: {
      skip: filtros.skip,
      limit: filtros.limit,
      search: filtros.search || undefined,
      categoria_id: filtros.categoria_id,
      disponible: filtros.disponible,
    },
  })
  return data
}

const cuerpo = (d: ProductoForm) => ({
  nombre: d.nombre,
  descripcion: d.descripcion || null,
  precio_base: d.precio_base,
  imagen_url: d.imagen_url || null,
  stock: d.stock,
  disponible: d.disponible,
  categoria_id: d.categoria_id,
})

export async function crearProducto(datos: ProductoForm): Promise<Producto> {
  const { data } = await api.post<Producto>('/productos', cuerpo(datos))
  return data
}

export async function actualizarProducto(id: number, datos: ProductoForm): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, cuerpo(datos))
  return data
}

export async function cambiarStock(id: number, datos: StockForm): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, datos)
  return data
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`)
}
