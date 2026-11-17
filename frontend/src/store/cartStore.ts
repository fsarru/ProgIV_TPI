import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '@/features/productos'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  imagen_url: string | null
}

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: Producto, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
  cantidadTotal: () => number
}

// El carrito vive en el navegador (persist -> localStorage): sobrevive a recargas, no se envía al servidor
// hasta confirmar el pedido. El stock real se valida en el backend al crear el pedido (RN-01).
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === producto.id)
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                cantidad,
                imagen_url: producto.imagen_url,
              },
            ],
          }
        }),

      quitar: (productoId) => set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items:
            cantidad < 1
              ? state.items.filter((i) => i.producto_id !== productoId)
              : state.items.map((i) => (i.producto_id === productoId ? { ...i, cantidad } : i)),
        })),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),
      cantidadTotal: () => get().items.reduce((suma, i) => suma + i.cantidad, 0),
    }),
    { name: 'cart-storage' },
  ),
)
