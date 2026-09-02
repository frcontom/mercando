import type { Producto } from './producto.model'

export interface MercadoProducto {
  id: string
  mercado_categoria_id: string
  producto_id: string
  precio: number
  cantidad: number
  cantidad_encontrada: number
  subtotal: number
  estado: EstadoProducto
  observacion: string | null
  fecha_compra: string | null
  created_at: string
  producto?: Producto
}

export type EstadoProducto = 'pendiente' | 'encontrado' | 'no_habia'

export type AddProductoDto = Pick<MercadoProducto, 'mercado_categoria_id' | 'producto_id' | 'cantidad'>
export type UpdateMercadoProductoDto = Partial<Pick<MercadoProducto, 'precio' | 'cantidad' | 'cantidad_encontrada' | 'estado' | 'observacion'>>