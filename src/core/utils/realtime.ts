import { supabase } from '@/services/supabase.client'
import { loadMercados } from '@/store'
import { loadTiendas } from '@/store'
import { loadCategorias } from '@/store'
import { loadProductos } from '@/store'

let activeChannel: ReturnType<typeof supabase.channel> | null = null
let mercadoSubscribed = new Set<string>()

export function subscribeToChanges(mercadoId?: string) {
  if (mercadoId && mercadoSubscribed.has(mercadoId)) return
  if (!mercadoId && activeChannel) return

  if (!mercadoId) {
    const channel = supabase.channel('global-changes')
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'mercados' }, () => loadMercados()
    )
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'tiendas' }, () => loadTiendas()
    )
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'categorias' }, () => loadCategorias()
    )
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'productos' }, () => loadProductos()
    )
    channel.subscribe()
    activeChannel = channel
    return
  }

  const channel = supabase.channel(`mercado-${mercadoId}`)
  channel.on('postgres_changes',
    { event: '*', schema: 'public', table: 'mercado_tiendas', filter: `mercado_id=eq.${mercadoId}` },
    () => window.dispatchEvent(new CustomEvent('refresh-mercado', { detail: { mercadoId } }))
  )
  channel.on('postgres_changes',
    { event: '*', schema: 'public', table: 'mercado_tienda_categorias' },
    () => window.dispatchEvent(new CustomEvent('refresh-mercado', { detail: { mercadoId } }))
  )
  channel.on('postgres_changes',
    { event: '*', schema: 'public', table: 'mercado_productos' },
    () => window.dispatchEvent(new CustomEvent('refresh-mercado', { detail: { mercadoId } }))
  )
  channel.subscribe()
  mercadoSubscribed.add(mercadoId)
}

export function unsubscribeChanges() {
  if (activeChannel) {
    supabase.removeChannel(activeChannel)
    activeChannel = null
  }
  // Tambien limpiamos canales de mercado
  for (const mid of mercadoSubscribed) {
    const ch = supabase.getChannels().find(c => c.topic === `mercado-${mid}`)
    if (ch) supabase.removeChannel(ch)
  }
  mercadoSubscribed.clear()
}
