import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import { tiendas as tiendasSignal, loadingTiendas, loadTiendas, showSnackbar } from '@/store'
import { useSignalValue } from '@/hooks/useSignalValue'
import { tiendasService } from '@/services'
import type { Tienda, CreateTiendaDto, UpdateTiendaDto } from '@/models'
import { TiendaCard } from '@/components/business/TiendaCard'
import { TiendaFormDialog } from '@/components/business/TiendaFormDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function TiendasPage() {
  const items = useSignalValue(tiendasSignal)
  const isLoading = useSignalValue(loadingTiendas)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Tienda | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Tienda | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)

  useEffect(() => { loadTiendas() }, [])

  async function handleSave(data: CreateTiendaDto | UpdateTiendaDto) {
    try {
      if (editing) {
        await tiendasService.update(editing.id, data as UpdateTiendaDto)
        showSnackbar('Tienda actualizada')
      } else {
        await tiendasService.create(data as CreateTiendaDto)
        showSnackbar('Tienda creada')
      }
      await loadTiendas()
    } catch {
      showSnackbar('Error al guardar la tienda')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await tiendasService.delete(deleteTarget.id)
      showSnackbar('Tienda eliminada')
      await loadTiendas()
    } catch {
      showSnackbar('Error al eliminar: tienda tiene productos asignados')
    } finally {
      setDeleteTarget(null)
    }
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(tienda: Tienda) {
    setEditing(tienda)
    setFormOpen(true)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Crear tienda
        </Button>
        <Button variant="outlined" color="error" onClick={() => setDeleteAllOpen(true)} sx={{ minWidth: 44, px: 1 }}>
          <DeleteIcon />
        </Button>
      </Box>
      {items.length === 0 ? (
        <EmptyState message="No hay tiendas aún" />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map((t, i) => (
            <Box key={t.id} className="card-enter" style={{ animationDelay: `${0.03 * i}s` }}>
              <TiendaCard
                tienda={t}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            </Box>
          ))}
        </Box>
      )}

      <TiendaFormDialog
        open={formOpen}
        tienda={editing}
        onSave={handleSave}
        onClose={() => { setFormOpen(false); setEditing(null) }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar tienda"
        message={`¿Eliminar "${deleteTarget?.nombre}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={deleteAllOpen}
        title="Borrar todas las tiendas"
        message="¿Eliminar todas las tiendas y sus relaciones en los mercados? Esta acción no se puede deshacer."
        onConfirm={async () => {
          try { await tiendasService.deleteAll(); showSnackbar('Tiendas eliminadas'); await loadTiendas() }
          catch { showSnackbar('Error al eliminar') }
          finally { setDeleteAllOpen(false) }
        }}
        onCancel={() => setDeleteAllOpen(false)}
      />
    </Box>
  )
}
