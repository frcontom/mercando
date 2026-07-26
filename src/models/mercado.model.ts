export interface Mercado {
  id: string
  nombre: string
  fecha: string
  presupuesto: number
  estado: MercadoEstado
  created_at: string
}

export type MercadoEstado = 'planeando' | 'en_curso' | 'completado'

export type CreateMercadoDto = Pick<Mercado, 'nombre' | 'fecha' | 'presupuesto'>
export type UpdateMercadoDto = Partial<Pick<Mercado, 'nombre' | 'fecha' | 'presupuesto' | 'estado'>>
