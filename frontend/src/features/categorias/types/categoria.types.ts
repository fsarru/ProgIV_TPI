export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

export interface CategoriaForm {
  nombre: string
  descripcion: string
}
