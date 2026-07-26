import { signal } from '@preact/signals-react'
import type { MercadoTiendaCategoria } from '@/models'
import { mercadoTiendaCategoriasService } from '@/services'

export const list = signal<MercadoTiendaCategoria[]>([])
export const loading = signal(false)

export async function loadCategoriasByTienda(mercadoTiendaId: string): Promise<void> {
  loading.value = true
  try {
    list.value = await mercadoTiendaCategoriasService.getByMercadoTienda(mercadoTiendaId)
  } finally {
    loading.value = false
  }
}
