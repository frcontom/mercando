export interface Producto {
  id: string
  categoria_id: string
  nombre: string
  unidad: string
  favorito: boolean
  codigo_barras: string | null
  imagen: string | null
  activo: boolean
}

export type CreateProductoDto = Pick<Producto, 'categoria_id' | 'nombre' | 'unidad'>
export type UpdateProductoDto = Partial<Pick<Producto, 'categoria_id' | 'nombre' | 'unidad' | 'favorito' | 'activo'>>
