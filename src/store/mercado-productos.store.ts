import { signal } from '@preact/signals-react'
import type { MercadoProducto } from '@/models'
import { mercadoProductosService } from '@/services'

export const map = signal<Record<string, MercadoProducto[]>>({})
export const loading = signal(false)

export async function loadProductosByCategoria(mercadoCategoriaId: string): Promise<void> {
  loading.value = true
  try {
    const data = await mercadoProductosService.getByCategoria(mercadoCategoriaId)
    map.value = { ...map.value, [mercadoCategoriaId]: data }
  } finally {
    loading.value = false
  }
}

export function getProductosByCategoria(mercadoCategoriaId: string): MercadoProducto[] {
  return map.value[mercadoCategoriaId] ?? []
}

export function clearProductos(): void {
  map.value = {}
}