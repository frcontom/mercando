import { supabase } from './supabase.client'
import type { MercadoProducto, AddProductoDto, UpdateMercadoProductoDto } from '@/models'

class MercadoProductosService {
  private table = 'mercado_productos'

  async getByMercado(mercadoId: string): Promise<MercadoProducto[]> {
    const { data } = await supabase
      .from(this.table)
      .select('*, producto:productos(*), tienda:tiendas(*)')
      .eq('mercado_id', mercadoId)
      .order('orden', { ascending: true })
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

  async updateEstado(id: string, estado: MercadoProducto['estado']): Promise<void> {
    await supabase.from(this.table).update({ estado }).eq('id', id)
  }

  async updatePrecio(id: string, precio: number): Promise<void> {
    await supabase.from(this.table).update({ precio }).eq('id', id)
  }

  async update(id: string, dto: UpdateMercadoProductoDto): Promise<void> {
    await supabase.from(this.table).update(dto).eq('id', id)
  }

  async remove(id: string): Promise<void> {
    await supabase.from(this.table).delete().eq('id', id)
  }
}

export const mercadoProductosService = new MercadoProductosService()
