import { supabase } from './supabase.client'
import type { MercadoProducto, AddProductoDto, UpdateMercadoProductoDto } from '@/models'

class MercadoProductosService {
  private table = 'mercado_productos'

  async getByCategoria(mercadoCategoriaId: string): Promise<MercadoProducto[]> {
    const { data } = await supabase
      .from(this.table)
      .select('*, producto:productos(*)')
      .eq('mercado_categoria_id', mercadoCategoriaId)
      .order('created_at', { ascending: true })
    return data ?? []
  }

  async add(dto: AddProductoDto): Promise<MercadoProducto | null> {
    const { data } = await supabase
      .from(this.table)
      .insert(dto)
      .select()
      .single()
    return data
  }

  async update(id: string, dto: UpdateMercadoProductoDto): Promise<void> {
    await supabase.from(this.table).update(dto).eq('id', id)
  }

  async remove(id: string): Promise<void> {
    await supabase.from(this.table).delete().eq('id', id)
  }
}

export const mercadoProductosService = new MercadoProductosService()