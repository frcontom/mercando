import { signal, computed } from '@preact/signals-react'
import type { Mercado } from '@/models'
import { mercadosService } from '@/services'

export const list = signal<Mercado[]>([])
export const selected = signal<Mercado | null>(null)
export const loading = signal(false)

export const activeMercados = computed(() =>
  list.value.filter(m => m.estado !== 'completado')
)

export async function loadMercados(): Promise<void> {
  loading.value = true
  try {
    list.value = await mercadosService.getAll()
  } finally {
    loading.value = false
  }
}
