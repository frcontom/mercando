import { supabase } from './supabase.client'
import type { Mercado, CreateMercadoDto, UpdateMercadoDto } from '@/models'

class MercadosService {
  private table = 'mercados'

  async getAll(): Promise<Mercado[]> {
    const { data } = await supabase
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false })
    return data ?? []
  }

  async get(id: string): Promise<Mercado | null> {
    const { data } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  async create(dto: CreateMercadoDto): Promise<Mercado | null> {
    const { data } = await supabase
      .from(this.table)
      .insert(dto)
      .select()
      .single()
    return data
  }

  async update(id: string, dto: UpdateMercadoDto): Promise<Mercado | null> {
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

export const mercadosService = new MercadosService()
