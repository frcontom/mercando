import { signal } from '@preact/signals-react'
import type { Categoria } from '@/models'
import { categoriasService } from '@/services'

export const list = signal<Categoria[]>([])
export const loading = signal(false)

export async function loadCategorias(): Promise<void> {
  loading.value = true
  try {
    list.value = await categoriasService.getAll()
  } finally {
    loading.value = false
  }
}
