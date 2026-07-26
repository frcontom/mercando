import { supabase } from './supabase.client'
import type { MercadoTiendaCategoria } from '@/models'

class MercadoTiendaCategoriasService {
  private table = 'mercado_tienda_categorias'

  async getByMercadoTienda(mercadoTiendaId: string): Promise<MercadoTiendaCategoria[]> {
    const { data } = await supabase
      .from(this.table)
      .select('*, categoria:categorias(*)')
      .eq('mercado_tienda_id', mercadoTiendaId)
      .order('orden', { ascending: true })
    return data ?? []
  }

  async add(mercadoTiendaId: string, categoriaId: string): Promise<void> {
    await supabase.from(this.table).insert({ mercado_tienda_id: mercadoTiendaId, categoria_id: categoriaId })
  }

  async remove(id: string): Promise<void> {
    await supabase.from(this.table).delete().eq('id', id)
  }
}

export const mercadoTiendaCategoriasService = new MercadoTiendaCategoriasService()
