import { signal } from '@preact/signals-react'
import type { MercadoProducto } from '@/models'
import { mercadoProductosService } from '@/services'

export const list = signal<MercadoProducto[]>([])
export const loading = signal(false)

export async function loadProductosByCategoria(mercadoTiendaCategoriaId: string): Promise<void> {
  loading.value = true
  try {
    list.value = await mercadoProductosService.getByCategoria(mercadoTiendaCategoriaId)
  } finally {
    loading.value = false
  }
}
