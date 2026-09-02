import type { Categoria } from './categoria.model'

export interface MercadoCategoria {
  id: string
  mercado_id: string
  categoria_id: string
  orden: number
  categoria?: Categoria
}