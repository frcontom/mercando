import { signal } from '@preact/signals-react'
import type { Tienda } from '@/models'
import { tiendasService } from '@/services'

export const list = signal<Tienda[]>([])
export const loading = signal(false)

export async function loadTiendas(): Promise<void> {
  loading.value = true
  try {
    list.value = await tiendasService.getAll()
  } finally {
    loading.value = false
  }
}
