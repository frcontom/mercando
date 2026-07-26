import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { tiendas, loadingTiendas, loadTiendas, showSnackbar, showFab, hideFab } from '@/store'
import { tiendasService } from '@/services'
import type { Tienda, CreateTiendaDto, UpdateTiendaDto } from '@/models'
import { TiendaCard } from '@/components/business/TiendaCard'
import { TiendaFormDialog } from '@/components/business/TiendaFormDialog'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function TiendasPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Tienda | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Tienda | null>(null)

  useEffect(() => {
    loadTiendas()
    showFab(openCreate)
    return () => hideFab()
  }, [])

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

  if (loadingTiendas.value) return <LoadingSpinner />

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {tiendas.value.length === 0 ? (
        <EmptyState message="No hay tiendas aún" />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {tiendas.value.map(t => (
            <TiendaCard
              key={t.id}
              tienda={t}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
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
    </Box>
  )
}
