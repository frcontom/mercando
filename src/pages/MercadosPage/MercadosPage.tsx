import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import Chip from '@mui/material/Chip'
import { mercados, loadingMercados, loadMercados } from '@/store'
import { mercadosService } from '@/services'
import { showSnackbar } from '@/store'
import type { Mercado, CreateMercadoDto, UpdateMercadoDto } from '@/models'
import { MercadoFormDialog } from '@/components/business/MercadoFormDialog'
import { AppFab } from '@/components/ui/AppFab'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency } from '@/core/utils/formatters'

const estadoChip: Record<string, 'info' | 'warning' | 'success'> = {
  planeando: 'info',
  en_curso: 'warning',
  completado: 'success',
}

export default function MercadosPage() {
  const navigate = useNavigate()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Mercado | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Mercado | null>(null)

  useEffect(() => { loadMercados() }, [])

  async function handleSave(data: CreateMercadoDto | UpdateMercadoDto) {
    if (editing) {
      await mercadosService.update(editing.id, data as UpdateMercadoDto)
      showSnackbar('Mercado actualizado')
    } else {
      await mercadosService.create(data as CreateMercadoDto)
      showSnackbar('Mercado creado')
    }
    await loadMercados()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await mercadosService.delete(deleteTarget.id)
    showSnackbar('Mercado eliminado')
    setDeleteTarget(null)
    await loadMercados()
  }

  if (loadingMercados.value) return <LoadingSpinner />

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {mercados.value.length === 0 ? (
        <EmptyState message="No hay mercados aún" />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {mercados.value.map(m => (
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
                    color={estadoChip[m.estado]}
                    size="small"
                  />
                  <IconButton size="small" onClick={e => { e.stopPropagation(); setEditing(m); setFormOpen(true) }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <AppFab onClick={() => { setEditing(null); setFormOpen(true) }} />

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
