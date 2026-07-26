import { supabase } from './supabase.client'
import type { HistorialPrecio } from '@/models'

class HistorialPreciosService {
  private table = 'historial_precios'

  async registrar(productoId: string, tiendaId: string, precio: number): Promise<void> {
    await supabase.from(this.table).insert({
      producto_id: productoId,
      tienda_id: tiendaId,
      precio,
      fecha: new Date().toISOString(),
    })
  }

  async obtenerHistorial(productoId: string): Promise<HistorialPrecio[]> {
    const { data } = await supabase
      .from(this.table)
      .select('*')
      .eq('producto_id', productoId)
      .order('fecha', { ascending: false })
    return data ?? []
  }
}

export const historialPreciosService = new HistorialPreciosService()
