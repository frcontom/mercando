import { supabase } from '@/services/supabase.client'
import { loadMercados } from '@/store'
import { loadTiendas } from '@/store'
import { loadCategorias } from '@/store'
import { loadProductos } from '@/store'

let activeChannel: ReturnType<typeof supabase.channel> | null = null

export function subscribeToChanges(mercadoId?: string) {
  if (activeChannel) return

  const channel = supabase.channel('db-changes')

  channel.on('postgres_changes',
    { event: '*', schema: 'public', table: 'mercados' },
    () => loadMercados()
  )
  channel.on('postgres_changes',
    { event: '*', schema: 'public', table: 'tiendas' },
    () => loadTiendas()
  )
  channel.on('postgres_changes',
    { event: '*', schema: 'public', table: 'categorias' },
    () => loadCategorias()
  )
  channel.on('postgres_changes',
    { event: '*', schema: 'public', table: 'productos' },
    () => loadProductos()
  )

  if (mercadoId) {
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'mercado_tiendas', filter: `mercado_id=eq.${mercadoId}` },
      () => window.dispatchEvent(new CustomEvent('refresh-mercado'))
    )
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'mercado_tienda_categorias' },
      () => window.dispatchEvent(new CustomEvent('refresh-mercado'))
    )
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'mercado_productos' },
      () => window.dispatchEvent(new CustomEvent('refresh-mercado'))
    )
  }

  channel.subscribe()
  activeChannel = channel
}

export function unsubscribeChanges() {
  if (activeChannel) {
    supabase.removeChannel(activeChannel)
    activeChannel = null
  }
}
