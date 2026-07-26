import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { productos, loadingProductos, loadProductos, categorias, loadCategorias } from '@/store'
import { productosService } from '@/services'
import { showSnackbar } from '@/store'
import type { Producto, CreateProductoDto, UpdateProductoDto } from '@/models'
import { ProductoItem } from '@/components/business/ProductoItem'
import { ProductoFormDialog } from '@/components/business/ProductoFormDialog'
import { AppFab } from '@/components/ui/AppFab'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function ProductosPage() {
  const [tab, setTab] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null)

  useEffect(() => {
    loadCategorias()
    loadProductos()
  }, [])

  const categoriaId = categorias.value[tab]?.id ?? ''

  const filtered = categoriaId
    ? productos.value.filter(p => p.categoria_id === categoriaId)
    : productos.value

  async function handleSave(data: CreateProductoDto | UpdateProductoDto) {
    if (editing) {
      await productosService.update(editing.id, data as UpdateProductoDto)
      showSnackbar('Producto actualizado')
    } else {
      await productosService.create(data as CreateProductoDto)
      showSnackbar('Producto creado')
    }
    await loadProductos()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await productosService.delete(deleteTarget.id)
    showSnackbar('Producto eliminado')
    setDeleteTarget(null)
    await loadProductos()
  }

  async function toggleFavorito(producto: Producto) {
    await productosService.update(producto.id, { favorito: !producto.favorito })
    await loadProductos()
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(producto: Producto) {
    setEditing(producto)
    setFormOpen(true)
  }

  if (loadingProductos.value) return <LoadingSpinner />

  return (
    <Box sx={{ pb: 10 }}>
      {categorias.value.length > 0 && (
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons={false}
          sx={{ px: 2, minHeight: 48 }}
        >
          {categorias.value.map(c => (
            <Tab key={c.id} label={`${c.icono} ${c.nombre}`} sx={{ minHeight: 48, py: 1 }} />
          ))}
        </Tabs>
      )}

      <Box sx={{ p: 2 }}>
        {filtered.length === 0 ? (
          <EmptyState message="No hay productos en esta categoría" />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filtered.map(p => (
              <ProductoItem
                key={p.id}
                producto={p}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onToggleFavorito={toggleFavorito}
              />
            ))}
          </Box>
        )}
      </Box>

      <AppFab onClick={openCreate} />

      <ProductoFormDialog
        open={formOpen}
        producto={editing}
        categorias={categorias.value}
        onSave={handleSave}
        onClose={() => { setFormOpen(false); setEditing(null) }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar producto"
        message={`¿Eliminar "${deleteTarget?.nombre}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
