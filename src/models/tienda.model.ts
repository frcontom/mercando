export interface Tienda {
  id: string
  nombre: string
  color: string
  icono: string
  orden: number
}

export type CreateTiendaDto = Pick<Tienda, 'nombre' | 'color' | 'icono'>
export type UpdateTiendaDto = Partial<Pick<Tienda, 'nombre' | 'color' | 'icono' | 'orden'>>
