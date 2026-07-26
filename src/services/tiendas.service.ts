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
}

export const tiendasService = new TiendasService()
