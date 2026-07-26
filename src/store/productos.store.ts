import { signal } from '@preact/signals-react'
import type { Producto } from '@/models'
import { productosService } from '@/services'

export const list = signal<Producto[]>([])
export const loading = signal(false)

export async function loadProductos(): Promise<void> {
  loading.value = true
  try {
    list.value = await productosService.getAll()
  } finally {
    loading.value = false
  }
}
