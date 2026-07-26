import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import { categorias as categoriasSignal, loadingCategorias, loadCategorias, showSnackbar } from '@/store'
import { useSignalValue } from '@/hooks/useSignalValue'
import { categoriasService } from '@/services'
import type { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '@/models'
import { CategoriaItem } from '@/components/business/CategoriaItem'
import { CategoriaFormDialog } from '@/components/business/CategoriaFormDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function CategoriasPage() {
  const items = useSignalValue(categoriasSignal)
  const isLoading = useSignalValue(loadingCategorias)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Categoria | null>(null)

  useEffect(() => { loadCategorias() }, [])

  async function handleSave(data: CreateCategoriaDto | UpdateCategoriaDto) {
    try {
      if (editing) {
        await categoriasService.update(editing.id, data as UpdateCategoriaDto)
        showSnackbar('Categoría actualizada')
      } else {
        await categoriasService.create(data as CreateCategoriaDto)
        showSnackbar('Categoría creada')
      }
      await loadCategorias()
    } catch {
      showSnackbar('Error al guardar la categoría')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await categoriasService.delete(deleteTarget.id)
      showSnackbar('Categoría eliminada')
      await loadCategorias()
    } catch {
      showSnackbar('Error al eliminar: categoría tiene productos')
    } finally {
      setDeleteTarget(null)
    }
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(categoria: Categoria) {
    setEditing(categoria)
    setFormOpen(true)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mb: 2 }}>
        Crear categoría
      </Button>
      {items.length === 0 ? (
        <EmptyState message="No hay categorías aún" />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map(c => (
            <CategoriaItem
              key={c.id}
              categoria={c}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </Box>
      )}

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
