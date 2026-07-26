import { supabase } from './supabase.client'
import type { MercadoTienda } from '@/models'

class MercadoTiendasService {
  private table = 'mercado_tiendas'

  async getByMercado(mercadoId: string): Promise<MercadoTienda[]> {
    const { data } = await supabase
      .from(this.table)
      .select('*, tienda:tiendas(*)')
      .eq('mercado_id', mercadoId)
      .order('orden', { ascending: true })
    return data ?? []
  }

  async add(mercadoId: string, tiendaId: string): Promise<void> {
    await supabase.from(this.table).insert({ mercado_id: mercadoId, tienda_id: tiendaId })
  }

  async remove(id: string): Promise<void> {
    await supabase.from(this.table).delete().eq('id', id)
  }
}

export const mercadoTiendasService = new MercadoTiendasService()
