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

  async deleteAll(): Promise<void> {
    const { data } = await supabase.from(this.table).select('id')
    const ids = data?.map(c => c.id) ?? []
    if (ids.length === 0) return
    const mtcIds = (await supabase.from('mercado_tienda_categorias').select('id').in('categoria_id', ids)).data?.map(mtc => mtc.id) ?? []
    if (mtcIds.length > 0) {
      await supabase.from('mercado_productos').delete().in('mercado_tienda_categoria_id', mtcIds)
      await supabase.from('mercado_tienda_categorias').delete().in('id', mtcIds)
    }
    await supabase.from(this.table).delete().in('id', ids)
  }
}

export const categoriasService = new CategoriasService()
