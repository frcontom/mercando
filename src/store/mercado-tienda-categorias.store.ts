import { signal } from '@preact/signals-react'
import type { MercadoTiendaCategoria } from '@/models'
import { mercadoTiendaCategoriasService } from '@/services'

export const map = signal<Record<string, MercadoTiendaCategoria[]>>({})
export const loading = signal(false)

export async function loadCategoriasByTienda(mercadoTiendaId: string): Promise<void> {
  loading.value = true
  try {
    const data = await mercadoTiendaCategoriasService.getByMercadoTienda(mercadoTiendaId)
    map.value = { ...map.value, [mercadoTiendaId]: data }
  } finally {
    loading.value = false
  }
}

export function getCategoriasByTienda(mercadoTiendaId: string): MercadoTiendaCategoria[] {
  return map.value[mercadoTiendaId] ?? []
}

export function clearCategorias(): void {
  map.value = {}
}
