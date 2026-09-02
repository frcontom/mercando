import { signal } from '@preact/signals-react'
import type { MercadoCategoria } from '@/models'
import { mercadoCategoriasService } from '@/services'

export const list = signal<MercadoCategoria[]>([])
export const loading = signal(false)

export async function loadMercadoCategorias(mercadoId: string): Promise<void> {
  loading.value = true
  try {
    list.value = await mercadoCategoriasService.getByMercado(mercadoId)
  } finally {
    loading.value = false
  }
}