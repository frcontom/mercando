import { supabase } from './supabase.client'
import type { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '@/models'

class CategoriasService {
  private table = 'categorias'

  async getAll(): Promise<Categoria[]> {
    const { data } = await supabase
      .from(this.table)
      .select('*')
      .order('orden', { ascending: true })
    return data ?? []
  }

  async create(dto: CreateCategoriaDto): Promise<Categoria | null> {
    const { data } = await supabase
      .from(this.table)
      .insert(dto)
      .select()
      .single()
    return data
  }

  async update(id: string, dto: UpdateCategoriaDto): Promise<Categoria | null> {
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

export const categoriasService = new CategoriasService()
