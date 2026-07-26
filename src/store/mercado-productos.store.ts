import { signal } from '@preact/signals-react'
import type { MercadoProducto } from '@/models'
import { mercadoProductosService } from '@/services'

export const map = signal<Record<string, MercadoProducto[]>>({})
export const loading = signal(false)

export async function loadProductosByCategoria(mercadoTiendaCategoriaId: string): Promise<void> {
  loading.value = true
  try {
    const data = await mercadoProductosService.getByCategoria(mercadoTiendaCategoriaId)
    map.value = { ...map.value, [mercadoTiendaCategoriaId]: data }
  } finally {
    loading.value = false
  }
}

export function getProductosByCategoria(mercadoTiendaCategoriaId: string): MercadoProducto[] {
  return map.value[mercadoTiendaCategoriaId] ?? []
}

export function clearProductos(): void {
  map.value = {}
}
