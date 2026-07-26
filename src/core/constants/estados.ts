import type { EstadoProducto } from '@/models'

export const ESTADOS_PRODUCTO: EstadoProducto[] = [
  'pendiente',
  'encontrado',
  'no_habia',
  'reemplazado',
  'cancelado',
]

export const LABEL_ESTADOS: Record<EstadoProducto, string> = {
  pendiente: 'Pendiente',
  encontrado: 'Encontrado',
  no_habia: 'No había',
  reemplazado: 'Reemplazado',
  cancelado: 'Cancelado',
}
