import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Chip from '@mui/material/Chip'
import { mercados as mercadosSignal, loadingMercados, loadMercados, showSnackbar, showFab, hideFab } from '@/store'
import { useSignalValue } from '@/hooks/useSignalValue'
import { mercadosService } from '@/services'
import type { Mercado, MercadoEstado, CreateMercadoDto, UpdateMercadoDto } from '@/models'
import { MercadoFormDialog } from '@/components/business/MercadoFormDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency } from '@/core/utils/formatters'

const estadoColors: Record<MercadoEstado, 'success' | 'default'> = {
  activo: 'success',
  inactivo: 'default',
}

const nextEstado: Record<MercadoEstado, MercadoEstado> = {
  activo: 'inactivo',
  inactivo: 'activo',
}

export default function MercadosPage() {
  const navigate = useNavigate()
  const items = useSignalValue(mercadosSignal)
  const isLoading = useSignalValue(loadingMercados)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Mercado | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Mercado | null>(null)

  useEffect(() => {
    loadMercados()
    showFab(() => { setEditing(null); setFormOpen(true) })
    return () => hideFab()
  }, [])

  async function handleSave(data: CreateMercadoDto | UpdateMercadoDto) {
    try {
      if (editing) {
        await mercadosService.update(editing.id, data as UpdateMercadoDto)
        showSnackbar('Mercado actualizado')
      } else {
        await mercadosService.create(data as CreateMercadoDto)
        showSnackbar('Mercado creado')
      }
      await loadMercados()
    } catch {
      showSnackbar('Error al guardar el mercado')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await mercadosService.delete(deleteTarget.id)
      showSnackbar('Mercado eliminado')
      await loadMercados()
    } catch {
      showSnackbar('Error al eliminar: mercado tiene productos')
    } finally {
      setDeleteTarget(null)
    }
  }

  async function toggleEstado(m: Mercado) {
    try {
      const nuevo = nextEstado[m.estado]
      await mercadosService.update(m.id, { estado: nuevo })
      showSnackbar(`Mercado marcado como "${nuevo}"`)
      await loadMercados()
    } catch {
      showSnackbar('Error al cambiar estado')
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {items.length === 0 ? (
        <EmptyState message="No hay mercados aún" />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map(m => (
            <Card
              key={m.id}
              onClick={() => navigate(`/mercados/${m.id}`)}
              sx={{ cursor: 'pointer', '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}
            >
              <CardContent sx={{ pb: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {m.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(m.fecha).toLocaleDateString()} · {formatCurrency(m.presupuesto)}
                    </Typography>
                  </Box>
                  <Chip
                    label={m.estado}
                    color={estadoColors[m.estado]}
                    size="small"
                    onClick={e => { e.stopPropagation(); toggleEstado(m) }}
                    sx={{ cursor: 'pointer' }}
                  />
                  <IconButton size="small" onClick={e => { e.stopPropagation(); setEditing(m); setFormOpen(true) }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={e => { e.stopPropagation(); setDeleteTarget(m) }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <MercadoFormDialog
        open={formOpen}
        mercado={editing}
        onSave={handleSave}
        onClose={() => { setFormOpen(false); setEditing(null) }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar mercado"
        message={`¿Eliminar "${deleteTarget?.nombre}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
