export interface Categoria {
  id: string
  nombre: string
  icono: string
  orden: number
}

export type CreateCategoriaDto = Pick<Categoria, 'nombre' | 'icono'>
export type UpdateCategoriaDto = Partial<Pick<Categoria, 'nombre' | 'icono' | 'orden'>>
