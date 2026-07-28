import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import ToggleButton from '@mui/material/ToggleButton'
import StarIcon from '@mui/icons-material/Star'
import AddIcon from '@mui/icons-material/Add'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import { productos as productosSignal, loadingProductos, loadProductos, categorias, loadCategorias, mercados, mercadoTiendas, mercadoTiendaCategorias, loadMercadoTiendas, loadCategoriasByTienda, showSnackbar } from '@/store'
import { mercadoProductosService } from '@/services'
import { useSignalValue } from '@/hooks/useSignalValue'
import { productosService } from '@/services'
import type { Producto, CreateProductoDto, UpdateProductoDto } from '@/models'
import { ProductoItem } from '@/components/business/ProductoItem'
import { ProductoFormDialog } from '@/components/business/ProductoFormDialog'
import { ProductoBulkDialog } from '@/components/business/ProductoBulkDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function ProductosPage() {
  const items = useSignalValue(productosSignal)
  const isLoading = useSignalValue(loadingProductos)
  const [tab, setTab] = useState(0)
  const [showFavs, setShowFavs] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)

  useEffect(() => { loadCategorias(); loadProductos() }, [])

  const categoriaId = categorias.value[tab]?.id ?? ''
  const categoriaNombre = categorias.value[tab]?.nombre ?? ''

  const filtered = items.filter(p => {
    const matchCat = categoriaId ? p.categoria_id === categoriaId : true
    const matchFav = showFavs ? p.favorito : true
    const matchSearch = searchQuery ? p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) : true
    return matchCat && matchFav && matchSearch
  })

  async function handleSave(data: CreateProductoDto | UpdateProductoDto) {
    try {
      if (editing) {
        await productosService.update(editing.id, data as UpdateProductoDto)
        showSnackbar('Producto actualizado')
      } else {
        await productosService.create(data as CreateProductoDto)
        showSnackbar('Producto creado')
      }
      await loadProductos()
    } catch {
      showSnackbar('Error al guardar el producto')
    }
  }

  async function handleBulkSave(nombres: string[]) {
    try {
      for (const nombre of nombres) {
        await productosService.create({ nombre, unidad: 'pieza', categoria_id: categoriaId })
      }
      showSnackbar(`${nombres.length} producto(s) creados`)
      await loadProductos()
    } catch {
      showSnackbar('Error al crear productos masivos')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await productosService.delete(deleteTarget.id)
      showSnackbar('Producto eliminado')
      await loadProductos()
    } catch {
      showSnackbar('Error al eliminar el producto')
    } finally {
      setDeleteTarget(null)
    }
  }

  async function toggleFavorito(producto: Producto) {
    try {
      await productosService.update(producto.id, { favorito: !producto.favorito })
      await loadProductos()
    } catch {
      showSnackbar('Error al actualizar favorito')
    }
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(producto: Producto) {
    setEditing(producto)
    setFormOpen(true)
  }

  async function addToMarket(producto: Producto) {
    const activo = mercados.value.find(m => m.estado === 'activo')
    if (!activo) { showSnackbar('No hay mercado activo'); return }
    await loadMercadoTiendas(activo.id)
    const mt = mercadoTiendas.value[0]
    if (!mt) { showSnackbar('El mercado activo no tiene tiendas'); return }
    await loadCategoriasByTienda(mt.id)
    const mtc = Object.values(mercadoTiendaCategorias.value).flat().find(c => c.categoria_id === producto.categoria_id)
    if (!mtc) { showSnackbar('Primero agrega esta categoría al mercado'); return }
    try {
      await mercadoProductosService.add({ mercado_tienda_categoria_id: mtc.id, producto_id: producto.id, cantidad: 1 })
      showSnackbar(`✓ ${producto.nombre} agregado`)
    } catch { showSnackbar('Error al agregar') }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <Box sx={{ pb: 10 }}>
      {categorias.value.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons={false} sx={{ flex: 1, minHeight: 48 }}>
            {categorias.value.map(c => (
              <Tab key={c.id} label={`${c.icono} ${c.nombre}`} sx={{ minHeight: 48, py: 1 }} />
            ))}
          </Tabs>
        </Box>
      )}

      <Box sx={{ px: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar producto…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            },
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, px: 2, pb: 1 }}>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate} sx={{ flex: 1, fontSize: '0.7rem' }}>Crear</Button>
        <Button variant="outlined" size="small" startIcon={<PlaylistAddIcon />} onClick={() => setBulkOpen(true)} sx={{ flex: 1, fontSize: '0.7rem' }}>Masivo</Button>
        <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteAllOpen(true)} sx={{ flex: 1, fontSize: '0.7rem' }}>Borrar</Button>
        <ToggleButton value="favs" selected={showFavs} onChange={() => setShowFavs(!showFavs)} size="small" sx={{ flex: 1, fontSize: '0.7rem' }}>
          <StarIcon fontSize="small" color={showFavs ? 'warning' : 'inherit'} sx={{ mr: 0.3 }} /> Favs
        </ToggleButton>
      </Box>
      <Box sx={{ p: 2, pt: 0 }}>
        {filtered.length === 0 ? (
          <EmptyState message={showFavs ? 'No hay favoritos en esta categoría' : 'No hay productos en esta categoría'} />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filtered.map(p => (
              <ProductoItem
                key={p.id}
                producto={p}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onToggleFavorito={toggleFavorito}
                onAddToMarket={addToMarket}
              />
            ))}
          </Box>
        )}
      </Box>

      <ProductoFormDialog
        open={formOpen}
        producto={editing}
        categorias={categorias.value}
        defaultCategoriaId={categoriaId}
        onSave={handleSave}
        onClose={() => { setFormOpen(false); setEditing(null) }}
      />

      <ProductoBulkDialog
        open={bulkOpen}
        categoriaNombre={categoriaNombre}
        onSave={handleBulkSave}
        onClose={() => { setBulkOpen(false) }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar producto"
        message={`¿Eliminar "${deleteTarget?.nombre}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={deleteAllOpen}
        title="Borrar todos los productos"
        message="¿Eliminar todos los productos del catálogo y sus referencias en los mercados? Esta acción no se puede deshacer."
        onConfirm={async () => {
          try { await productosService.deleteAll(); showSnackbar('Productos eliminados'); await loadProductos() }
          catch { showSnackbar('Error al eliminar') }
          finally { setDeleteAllOpen(false) }
        }}
        onCancel={() => setDeleteAllOpen(false)}
      />
    </Box>
  )
}
