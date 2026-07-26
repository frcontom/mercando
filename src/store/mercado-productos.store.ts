import { signal } from '@preact/signals-react'
import type { MercadoProducto } from '@/models'
import { mercadoProductosService } from '@/services'

export const list = signal<MercadoProducto[]>([])
export const loading = signal(false)

export async function loadMercadoProductos(mercadoId: string): Promise<void> {
  loading.value = true
  try {
    list.value = await mercadoProductosService.getByMercado(mercadoId)
  } finally {
    loading.value = false
  }
}
