import type { Producto } from './producto.model'
import type { Tienda } from './tienda.model'

export interface MercadoProducto {
  id: string
  mercado_id: string
  tienda_id: string
  producto_id: string
  precio: number
  cantidad: number
  subtotal: number
  prioridad: number
  estado: EstadoProducto
  orden: number
  observacion: string | null
  fecha_compra: string | null
  created_at: string
  producto?: Producto
  tienda?: Tienda
}

export type EstadoProducto = 'pendiente' | 'encontrado' | 'no_habia' | 'reemplazado' | 'cancelado'

export type AddProductoDto = Pick<MercadoProducto, 'mercado_id' | 'tienda_id' | 'producto_id' | 'cantidad'>
export type UpdateMercadoProductoDto = Partial<Pick<MercadoProducto, 'precio' | 'cantidad' | 'estado' | 'prioridad' | 'observacion' | 'tienda_id'>>
