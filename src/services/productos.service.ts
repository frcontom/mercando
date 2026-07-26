import { supabase } from './supabase.client'
import type { Producto, CreateProductoDto, UpdateProductoDto } from '@/models'

class ProductosService {
  private table = 'productos'

  async getAll(): Promise<Producto[]> {
    const { data } = await supabase
      .from(this.table)
      .select('*')
      .order('nombre', { ascending: true })
    return data ?? []
  }

  async getByCategoria(categoriaId: string): Promise<Producto[]> {
    const { data } = await supabase
      .from(this.table)
      .select('*')
      .eq('categoria_id', categoriaId)
      .order('nombre', { ascending: true })
    return data ?? []
  }

  async create(dto: CreateProductoDto): Promise<Producto | null> {
    const { data } = await supabase
      .from(this.table)
      .insert(dto)
      .select()
      .single()
    return data
  }

  async update(id: string, dto: UpdateProductoDto): Promise<Producto | null> {
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

export const productosService = new ProductosService()
