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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
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
  const [marketProduct, setMarketProduct] = useState<Producto | null>(null)
  const [marketCantidad, setMarketCantidad] = useState('1')

  useEffect(() => { loadCategorias(); loadProductos() }, [])

  const categoriaId = tab === 0 ? '' : (categorias.value[tab - 1]?.id ?? '')
  const categoriaNombre = tab === 0 ? 'Todos' : (categorias.value[tab - 1]?.nombre ?? '')

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

  function addToMarket(producto: Producto) {
    const activo = mercados.value.find(m => m.estado === 'activo')
    if (!activo) { showSnackbar('No hay mercado activo'); return }
    setMarketProduct(producto)
    setMarketCantidad('1')
  }

  async function confirmAddToMarket() {
    const producto = marketProduct
    if (!producto) return
    const activo = mercados.value.find(m => m.estado === 'activo')
    if (!activo) { showSnackbar('No hay mercado activo'); setMarketProduct(null); return }
    try {
      await loadMercadoTiendas(activo.id)
      const mt = mercadoTiendas.value[0]
      if (!mt) { showSnackbar('El mercado no tiene tiendas'); setMarketProduct(null); return }
      await loadCategoriasByTienda(mt.id)
      const todas = Object.values(mercadoTiendaCategorias.value).flat()
      const mtc = todas.find(c => c.categoria_id === producto.categoria_id)
      if (!mtc) { showSnackbar('Agrega esta categoría al mercado primero'); setMarketProduct(null); return }
      await mercadoProductosService.add({ mercado_tienda_categoria_id: mtc.id, producto_id: producto.id, cantidad: Number(marketCantidad) || 1 })
      showSnackbar(`${producto.nombre} → Mercado ✓`)
    } catch { showSnackbar('Error al agregar') }
    setMarketProduct(null)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <Box sx={{ pb: 10 }}>
      {categorias.value.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons={false} sx={{ flex: 1, minHeight: 48 }}>
            <Tab label="📦 Todos" sx={{ minHeight: 48, py: 1 }} />
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

      <Dialog open={marketProduct !== null} onClose={() => setMarketProduct(null)} fullWidth maxWidth="xs">
        <DialogTitle>Agregar al mercado</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>{marketProduct?.nombre}</Typography>
          <TextField select fullWidth label="Cantidad" value={marketCantidad} onChange={e => setMarketCantidad(e.target.value)} sx={{ mb: 1 }}>
            {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
              <MenuItem key={n} value={n.toString()}>{n}</MenuItem>
            ))}
          </TextField>
          <Typography variant="caption" color="text.secondary">
            Se agregará al mercado activo en la categoría correspondiente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarketProduct(null)}>Cancelar</Button>
          <Button onClick={confirmAddToMarket} variant="contained">Agregar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
