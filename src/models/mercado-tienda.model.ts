import type { Tienda } from './tienda.model'

export interface MercadoTienda {
  id: string
  mercado_id: string
  tienda_id: string
  orden: number
  tienda?: Tienda
}
