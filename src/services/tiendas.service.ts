import { supabase } from './supabase.client'
import type { Tienda, CreateTiendaDto, UpdateTiendaDto } from '@/models'

class TiendasService {
  private table = 'tiendas'

  async getAll(): Promise<Tienda[]> {
    const { data } = await supabase
      .from(this.table)
      .select('*')
      .order('orden', { ascending: true })
    return data ?? []
  }

  async create(dto: CreateTiendaDto): Promise<Tienda | null> {
    const { data } = await supabase
      .from(this.table)
      .insert(dto)
      .select()
      .single()
    return data
  }

  async update(id: string, dto: UpdateTiendaDto): Promise<Tienda | null> {
    const { data } = await supabase
      .from(this.table)
      .update(dto)
      .eq('id', id)
      .select()
      .single()
    return data
  }

  async delete(id: string): Promise<void> {
    await supabase.from(this.table).delete().eq('id', id)
  }

  async deleteAll(): Promise<void> {
    const { data } = await supabase.from(this.table).select('id')
    const ids = data?.map(t => t.id) ?? []
    if (ids.length === 0) return
    const mtIds = (await supabase.from('mercado_tiendas').select('id').in('tienda_id', ids)).data?.map(mt => mt.id) ?? []
    if (mtIds.length > 0) {
      const mtcIds = (await supabase.from('mercado_tienda_categorias').select('id').in('mercado_tienda_id', mtIds)).data?.map(mtc => mtc.id) ?? []
      if (mtcIds.length > 0) {
        await supabase.from('mercado_productos').delete().in('mercado_tienda_categoria_id', mtcIds)
        await supabase.from('mercado_tienda_categorias').delete().in('id', mtcIds)
      }
      await supabase.from('mercado_tiendas').delete().in('id', mtIds)
    }
    await supabase.from(this.table).delete().in('id', ids)
  }
}

export const tiendasService = new TiendasService()
