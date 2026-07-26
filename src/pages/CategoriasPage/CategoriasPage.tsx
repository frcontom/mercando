import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { categorias, loadingCategorias, loadCategorias } from '@/store'
import { categoriasService } from '@/services'
import { showSnackbar } from '@/store'
import type { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '@/models'
import { CategoriaItem } from '@/components/business/CategoriaItem'
import { CategoriaFormDialog } from '@/components/business/CategoriaFormDialog'
import { AppFab } from '@/components/ui/AppFab'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function CategoriasPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Categoria | null>(null)

  useEffect(() => { loadCategorias() }, [])

  async function handleSave(data: CreateCategoriaDto | UpdateCategoriaDto) {
    if (editing) {
      await categoriasService.update(editing.id, data as UpdateCategoriaDto)
      showSnackbar('Categoría actualizada')
    } else {
      await categoriasService.create(data as CreateCategoriaDto)
      showSnackbar('Categoría creada')
    }
    await loadCategorias()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await categoriasService.delete(deleteTarget.id)
    showSnackbar('Categoría eliminada')
    setDeleteTarget(null)
    await loadCategorias()
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(categoria: Categoria) {
    setEditing(categoria)
    setFormOpen(true)
  }

  if (loadingCategorias.value) return <LoadingSpinner />

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {categorias.value.length === 0 ? (
        <EmptyState message="No hay categorías aún" />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {categorias.value.map(c => (
            <CategoriaItem
              key={c.id}
              categoria={c}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </Box>
      )}

      <AppFab onClick={openCreate} />

      <CategoriaFormDialog
        open={formOpen}
        categoria={editing}
        onSave={handleSave}
        onClose={() => { setFormOpen(false); setEditing(null) }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar categoría"
        message={`¿Eliminar "${deleteTarget?.nombre}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
