import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import { mercados, loadMercados } from '@/store'
import { mercadoTiendas, loadMercadoTiendas } from '@/store'
import { mercadoTiendaCategorias, loadCategoriasByTienda, getCategoriasByTienda } from '@/store'
import { mercadoProductos, loadProductosByCategoria, getProductosByCategoria } from '@/store'
import { tiendas, loadTiendas, categorias, loadCategorias, productos, loadProductos } from '@/store'
import { mercadoTiendasService, mercadoTiendaCategoriasService, mercadoProductosService } from '@/services'
import { showSnackbar, showFab, hideFab } from '@/store'
import { formatCurrency } from '@/core/utils/formatters'
import { ESTADOS_PRODUCTO, LABEL_ESTADOS } from '@/core/constants/estados'
import type { EstadoProducto, MercadoProducto } from '@/models'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function MercadoDetailPage() {
  const { id } = useParams()
  const [tiendaExpanded, setTiendaExpanded] = useState<string | false>(false)
  const [catExpanded, setCatExpanded] = useState<string | false>(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null)

  const [addTiendaOpen, setAddTiendaOpen] = useState(false)
  const [addCategoriaFor, setAddCategoriaFor] = useState<string | null>(null)
  const [addProductoFor, setAddProductoFor] = useState<string | null>(null)
  const [productoForm, setProductoForm] = useState({ producto_id: '', cantidad: '1', precio: '' })
  const [estadoDialog, setEstadoDialog] = useState<{ open: boolean; item: MercadoProducto | null }>({ open: false, item: null })
  const [selectedEstado, setSelectedEstado] = useState<EstadoProducto>('pendiente')
  const [precioEdit, setPrecioEdit] = useState('')

  const mercado = mercados.value.find(m => m.id === id)

  // Carga inicial
  useEffect(() => {
    if (!id) return
    loadMercados()
    loadTiendas()
    loadCategorias()
    loadProductos()
    loadMercadoTiendas(id)
  }, [id])

  useEffect(() => {
    if (mercado?.estado !== 'completado') showFab(() => setAddTiendaOpen(true))
    return () => hideFab()
  }, [mercado?.estado])

  // Cuando cargan las tiendas del mercado, precargar categorías de TODAS
  useEffect(() => {
    mercadoTiendas.value.forEach(mt => loadCategoriasByTienda(mt.id))
  }, [mercadoTiendas.value.length])

  // Cuando cargan categorías, precargar productos de TODAS
  useEffect(() => {
    const todas = Object.values(mercadoTiendaCategorias.value).flat()
    todas.forEach(mtc => {
      if (!getProductosByCategoria(mtc.id).length) loadProductosByCategoria(mtc.id)
    })
  }, [Object.keys(mercadoTiendaCategorias.value).length])

  function getCategorias(mtId: string) {
    return getCategoriasByTienda(mtId)
  }

  function getProductos(mtcId: string) {
    return getProductosByCategoria(mtcId)
  }

  async function handleAddTienda(tiendaId: string) {
    if (!id) return
    try {
      await mercadoTiendasService.add(id, tiendaId)
      showSnackbar('Tienda agregada al mercado')
      await loadMercadoTiendas(id)
      setAddTiendaOpen(false)
    } catch { showSnackbar('Error al agregar tienda') }
  }

  async function handleRemoveTienda() {
    if (!deleteTarget || deleteTarget.type !== 'tienda') return
    try {
      await mercadoTiendasService.remove(deleteTarget.id)
      showSnackbar('Tienda eliminada del mercado')
      await loadMercadoTiendas(id!)
    } catch { showSnackbar('Error al eliminar') }
    finally { setDeleteTarget(null) }
  }

  async function handleAddCategoria(categoriaId: string) {
    if (!addCategoriaFor) return
    try {
      await mercadoTiendaCategoriasService.add(addCategoriaFor, categoriaId)
      showSnackbar('Categoría agregada')
      await loadCategoriasByTienda(addCategoriaFor)
      setAddCategoriaFor(null)
    } catch { showSnackbar('Error al agregar categoría') }
  }

  async function handleRemoveCategoria() {
    if (!deleteTarget || deleteTarget.type !== 'categoria') return
    try {
      await mercadoTiendaCategoriasService.remove(deleteTarget.id)
      showSnackbar('Categoría eliminada')
      for (const mt of mercadoTiendas.value) await loadCategoriasByTienda(mt.id)
    } catch { showSnackbar('Error al eliminar') }
    finally { setDeleteTarget(null) }
  }

  async function handleAddProducto() {
    if (!addProductoFor || !productoForm.producto_id) return
    try {
      await mercadoProductosService.add({
        mercado_tienda_categoria_id: addProductoFor,
        producto_id: productoForm.producto_id,
        cantidad: Number(productoForm.cantidad),
      })
      showSnackbar('Producto agregado')
      await loadProductosByCategoria(addProductoFor)
      setAddProductoFor(null)
      setProductoForm({ producto_id: '', cantidad: '1', precio: '' })
    } catch { showSnackbar('Error al agregar producto') }
  }

  async function handleRemoveProducto() {
    if (!deleteTarget || deleteTarget.type !== 'producto') return
    try {
      await mercadoProductosService.remove(deleteTarget.id)
      showSnackbar('Producto eliminado')
      const mtcId = mercadoProductos.value[deleteTarget.id]?.[0]?.mercado_tienda_categoria_id
      if (mtcId) await loadProductosByCategoria(mtcId)
    } catch { showSnackbar('Error al eliminar') }
    finally { setDeleteTarget(null) }
  }

  async function handleSaveEstado() {
    const item = estadoDialog.item
    if (!item) return
    const precio = Number(precioEdit) || 0
    try {
      await mercadoProductosService.update(item.id, { estado: selectedEstado, precio })
      showSnackbar('Producto actualizado')
      setEstadoDialog({ open: false, item: null })
      await loadProductosByCategoria(item.mercado_tienda_categoria_id)
    } catch { showSnackbar('Error al actualizar') }
  }

  if (!mercado) return <LoadingSpinner />

  const total = mercadoTiendas.value.reduce((sum, mt) => {
    const cats = getCategorias(mt.id)
    return sum + cats.reduce((s, c) => {
      const prods = getProductos(c.id)
      return s + prods.reduce((sp, p) => sp + (p.subtotal || p.precio * p.cantidad), 0)
    }, 0)
  }, 0)

  const tiendasDisponibles = tiendas.value.filter(t => !mercadoTiendas.value.some(mt => mt.tienda_id === t.id))

  return (
    <Box sx={{ pb: 10 }}>
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6">{mercado.nombre}</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
          <Chip label={mercado.estado} size="small" color={mercado.estado === 'completado' ? 'success' : 'warning'} />
          <Typography variant="caption" color="text.secondary">{new Date(mercado.fecha).toLocaleDateString()}</Typography>
        </Box>
        <Box sx={{ mt: 1 }}>
          <LinearProgress variant="determinate" value={Math.min(total / mercado.presupuesto, 1) * 100} sx={{ height: 6, borderRadius: 3 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Total: {formatCurrency(total)} / {formatCurrency(mercado.presupuesto)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Tiendas en este mercado
        </Typography>

        {mercadoTiendas.value.length === 0 ? (
          <EmptyState message="Agrega tiendas a este mercado" />
        ) : (
          mercadoTiendas.value.map(mt => (
            <Accordion
              key={mt.id}
              expanded={tiendaExpanded === mt.id}
              onChange={(_, exp) => setTiendaExpanded(exp ? mt.id : false)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <Typography sx={{ fontSize: 20 }}>{mt.tienda?.icono}</Typography>
                  <Typography sx={{ flex: 1, fontWeight: 500 }}>{mt.tienda?.nombre}</Typography>
                  <IconButton size="small" onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'tienda', id: mt.id }) }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>
                  Categorías
                </Typography>

                {getCategorias(mt.id).length === 0 ? (
                  <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>Sin categorías aún</Typography>
                ) : (
                  getCategorias(mt.id).map(mtc => (
                    <Accordion
                      key={mtc.id}
                      expanded={catExpanded === mtc.id}
                      onChange={(_, exp) => setCatExpanded(exp ? mtc.id : false)}
                      sx={{ mb: 0.5 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <Typography>{mtc.categoria?.icono}</Typography>
                          <Typography sx={{ flex: 1 }}>
                            {mtc.categoria?.nombre}
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              ({getProductos(mtc.id).length})
                            </Typography>
                          </Typography>
                          <IconButton size="small" onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'categoria', id: mtc.id }) }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {getProductos(mtc.id).length === 0 ? (
                          <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>Sin productos</Typography>
                        ) : (
                          getProductos(mtc.id).map(mp => (
                            <Card key={mp.id} sx={{ mb: 1, '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}>
                              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{mp.producto?.nombre}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {mp.cantidad} {mp.producto?.unidad}
                                    </Typography>
                                    {mp.precio > 0 && (
                                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                                        {mp.cantidad} × {formatCurrency(mp.precio)} = {formatCurrency(mp.precio * mp.cantidad)}
                                      </Typography>
                                    )}
                                  </Box>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                    {mp.precio > 0 && (
                                      <Typography
                                        variant="h5"
                                        sx={{
                                          fontWeight: 800,
                                          color: '#69f0ae',
                                          lineHeight: 1,
                                          letterSpacing: '-0.5px',
                                        }}
                                      >
                                        {formatCurrency(mp.precio)}
                                      </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Chip
                                        label={LABEL_ESTADOS[mp.estado]}
                                        size="small"
                                        color={mp.estado === 'encontrado' ? 'success' : mp.estado === 'no_habia' ? 'warning' : mp.estado === 'cancelado' ? 'error' : 'default'}
                                        onClick={() => { setSelectedEstado(mp.estado); setPrecioEdit(mp.precio.toString()); setEstadoDialog({ open: true, item: mp }) }}
                                      />
                                      <IconButton size="small" onClick={() => setDeleteTarget({ type: 'producto', id: mp.id })}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          ))
                        )}
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => { setAddProductoFor(mtc.id); setProductoForm({ producto_id: '', cantidad: '1', precio: '' }) }}
                        >
                          Agregar producto
                        </Button>
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}

                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setAddCategoriaFor(mt.id)}
                  sx={{ mt: 1 }}
                >
                  Agregar categoría
                </Button>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      {/* Dialog: Agregar Tienda */}
      <Dialog open={addTiendaOpen} onClose={() => setAddTiendaOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Agregar tienda</DialogTitle>
        <DialogContent>
          {tiendasDisponibles.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No hay más tiendas disponibles. Crea nuevas desde Tiendas.
            </Typography>
          ) : (
            <List>
              {tiendasDisponibles.map(t => (
                <ListItem key={t.id} disablePadding>
                  <ListItemButton onClick={() => handleAddTienda(t.id)}>
                    <Typography sx={{ mr: 1 }}>{t.icono}</Typography>
                    <ListItemText primary={t.nombre} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setAddTiendaOpen(false)}>Cancelar</Button></DialogActions>
      </Dialog>

      {/* Dialog: Agregar Categoría */}
      <Dialog open={addCategoriaFor !== null} onClose={() => setAddCategoriaFor(null)} fullWidth maxWidth="xs">
        <DialogTitle>Agregar categoría</DialogTitle>
        <DialogContent>
          <List>
            {categorias.value.filter(c => !getCategorias(addCategoriaFor!).some(mtc => mtc.categoria_id === c.id) && productos.value.some(p => p.categoria_id === c.id)).map(cat => (
              <ListItem key={cat.id} disablePadding>
                <ListItemButton onClick={() => handleAddCategoria(cat.id)}>
                  <Typography sx={{ mr: 1 }}>{cat.icono}</Typography>
                  <ListItemText primary={cat.nombre} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions><Button onClick={() => setAddCategoriaFor(null)}>Cancelar</Button></DialogActions>
      </Dialog>

      {/* Dialog: Agregar Producto */}
      <Dialog open={addProductoFor !== null} onClose={() => setAddProductoFor(null)} fullWidth maxWidth="xs">
        <DialogTitle>Agregar producto</DialogTitle>
        <DialogContent>
          <TextField
            select fullWidth label="Producto"
            value={productoForm.producto_id}
            onChange={e => setProductoForm(p => ({ ...p, producto_id: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
          >
            {productos.value
              .filter(p => p.categoria_id === (Object.values(mercadoTiendaCategorias.value).flat().find(mtc => mtc.id === addProductoFor)?.categoria_id ?? ''))
              .map(p => (
                <MenuItem key={p.id} value={p.id}>{p.nombre} ({p.unidad})</MenuItem>
              ))}
          </TextField>
          <TextField
            fullWidth type="number" label="Cantidad"
            value={productoForm.cantidad}
            onChange={e => setProductoForm(p => ({ ...p, cantidad: e.target.value }))}
            slotProps={{ htmlInput: { min: 1 } }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth type="text" label="Precio"
            value={productoForm.precio}
            onChange={e => {
              const val = e.target.value.replace(/[^0-9]/g, '')
              setProductoForm(p => ({ ...p, precio: val }))
            }}
            slotProps={{
              htmlInput: { inputMode: 'numeric' },
            }}
          />
          {productoForm.precio && Number(productoForm.precio) > 0 && (
            <Box sx={{ mt: 2, px: 1, py: 0.5, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Precio unitario</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#69f0ae', minWidth: 120, textAlign: 'right' }}>
                  {formatCurrency(Number(productoForm.precio))}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {productoForm.cantidad} × {formatCurrency(Number(productoForm.precio))}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#69f0ae', minWidth: 120, textAlign: 'right' }}>
                  {formatCurrency(Number(productoForm.precio) * Number(productoForm.cantidad))}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddProductoFor(null)}>Cancelar</Button>
          <Button onClick={handleAddProducto} variant="contained" disabled={!productoForm.producto_id}>Agregar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Editar estado/precio */}
      <Dialog open={estadoDialog.open} onClose={() => setEstadoDialog({ open: false, item: null })} fullWidth maxWidth="xs">
        <DialogTitle>Actualizar producto</DialogTitle>
        <DialogContent>
          <TextField
            select fullWidth label="Estado"
            value={selectedEstado}
            onChange={e => setSelectedEstado(e.target.value as EstadoProducto)}
            sx={{ mb: 2, mt: 1 }}
          >
            {ESTADOS_PRODUCTO.map(e => (<MenuItem key={e} value={e}>{LABEL_ESTADOS[e]}</MenuItem>))}
          </TextField>
          <TextField
            fullWidth type="text" label="Precio"
            value={precioEdit}
            onChange={e => {
              const val = e.target.value.replace(/[^0-9]/g, '')
              setPrecioEdit(val)
            }}
            slotProps={{
              htmlInput: { inputMode: 'numeric' },
              formHelperText: {
                sx: { textAlign: 'center', fontSize: '1.25rem', color: '#69f0ae', fontWeight: 700 },
              },
            }}
            helperText={precioEdit ? formatCurrency(Number(precioEdit)) : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEstadoDialog({ open: false, item: null })}>Cancelar</Button>
          <Button onClick={handleSaveEstado} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar"
        message="¿Eliminar este elemento?"
        onConfirm={() => {
          if (deleteTarget?.type === 'tienda') handleRemoveTienda()
          else if (deleteTarget?.type === 'categoria') handleRemoveCategoria()
          else if (deleteTarget?.type === 'producto') handleRemoveProducto()
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
