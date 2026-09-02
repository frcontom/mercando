import { supabase } from './supabase.client'
import type { MercadoCategoria } from '@/models'

class MercadoCategoriasService {
  private table = 'mercado_categorias'

  async getByMercado(mercadoId: string): Promise<MercadoCategoria[]> {
    const { data } = await supabase
      .from(this.table)
      .select('*, categoria:categorias(*)')
      .eq('mercado_id', mercadoId)
      .order('orden', { ascending: true })
    return data ?? []
  }

  async add(mercadoId: string, categoriaId: string): Promise<void> {
    await supabase.from(this.table).insert({ mercado_id: mercadoId, categoria_id: categoriaId })
  }

  async remove(id: string): Promise<void> {
    await supabase.from(this.table).delete().eq('id', id)
  }
}

export const mercadoCategoriasService = new MercadoCategoriasService()