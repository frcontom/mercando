import type { Categoria } from './categoria.model'

export interface MercadoTiendaCategoria {
  id: string
  mercado_tienda_id: string
  categoria_id: string
  orden: number
  categoria?: Categoria
}
