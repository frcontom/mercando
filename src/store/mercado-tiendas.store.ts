import { signal } from '@preact/signals-react'
import type { MercadoTienda } from '@/models'
import { mercadoTiendasService } from '@/services'

export const list = signal<MercadoTienda[]>([])
export const loading = signal(false)

export async function loadMercadoTiendas(mercadoId: string): Promise<void> {
  loading.value = true
  try {
    list.value = await mercadoTiendasService.getByMercado(mercadoId)
  } finally {
    loading.value = false
  }
}
