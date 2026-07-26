import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
import MenuItem from '@mui/material/MenuItem'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
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
  const [shoppingMode, setShoppingMode] = useState(true)
  const [currentTiendaId, setCurrentTiendaId] = useState<string | null>(null)
  const [tiendaExpanded, setTiendaExpanded] = useState<string | false>(false)
  const [catExpanded, setCatExpanded] = useState<string | false>(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null)

  const [addTiendaOpen, setAddTiendaOpen] = useState(false)
  const [addCategoriaFor, setAddCategoriaFor] = useState<string | null>(null)
  const [addProductoFor, setAddProductoFor] = useState<string | null>(null)
  const [productoForm, setProductoForm] = useState({ producto_id: '', cantidad: '1', precio: '' })
  const [estadoDialog, setEstadoDialog] = useState<{ open: boolean; item: MercadoProducto | null }>({ open: false, item: null })
  const [selectedEstado, setSelectedEstado] = useState<EstadoProducto>('pendiente')
  const [refreshKey, setRefreshKey] = useState(0)
  const [precioEdit, setPrecioEdit] = useState('')
  const [cantidadEdit, setCantidadEdit] = useState('1')

  const mercado = mercados.value.find(m => m.id === id)

  useEffect(() => {
    if (!id) return; (async () => {
      await Promise.all([loadMercados(), loadTiendas(), loadCategorias(), loadProductos()])
      await loadMercadoTiendas(id)
      for (const mt of mercadoTiendas.value) await loadCategoriasByTienda(mt.id)
      const todas = Object.values(mercadoTiendaCategorias.value).flat()
      for (const mtc of todas) await loadProductosByCategoria(mtc.id)
    })()
  }, [id])

  useEffect(() => {
    if (mercado?.estado === 'activo' && !shoppingMode) showFab(() => setAddTiendaOpen(true))
    else hideFab()
    return () => hideFab()
  }, [mercado?.estado, shoppingMode])

  function getCategorias(mtId: string) { return getCategoriasByTienda(mtId) }
  function getProductos(mtcId: string) { return getProductosByCategoria(mtcId) }
  function getProductosFromTienda(mtId: string) {
    return getCategorias(mtId).flatMap(c => getProductos(c.id))
  }
  function countEncontrados(mtId: string) {
    return getProductosFromTienda(mtId).filter(p => p.estado === 'encontrado').length
  }
  function totalTienda(mtId: string) {
    return getProductosFromTienda(mtId).reduce((s, p) => s + (p.subtotal ?? p.precio * p.cantidad), 0)
  }
  function totalEncontradosTienda(mtId: string) {
    return getProductosFromTienda(mtId).filter(p => p.estado === 'encontrado').reduce((s, p) => s + (p.subtotal ?? p.precio * p.cantidad), 0)
  }

  async function toggleProductoEstado(mp: MercadoProducto) {
    if (mp.estado === 'encontrado') {
      await mercadoProductosService.update(mp.id, { estado: 'pendiente' })
      await loadProductosByCategoria(mp.mercado_tienda_categoria_id)
      setRefreshKey(k => k + 1)
      return
    }
    if (mp.precio === 0) {
      setSelectedEstado('encontrado')
      setPrecioEdit('')
      setCantidadEdit(mp.cantidad.toString())
      setEstadoDialog({ open: true, item: mp })
      return
    }
    try {
      await mercadoProductosService.update(mp.id, { estado: 'encontrado' })
      await loadProductosByCategoria(mp.mercado_tienda_categoria_id)
      setRefreshKey(k => k + 1)
      showSnackbar(`${mp.producto?.nombre} ✓`)
    } catch { showSnackbar('Error') }
  }

  async function handleAddTienda(tiendaId: string) {
    if (!id) return
    try { await mercadoTiendasService.add(id, tiendaId); showSnackbar('Tienda agregada'); await loadMercadoTiendas(id); setAddTiendaOpen(false) }
    catch { showSnackbar('Error') }
  }

  async function handleRemoveTienda() {
    if (!deleteTarget || deleteTarget.type !== 'tienda') return
    try { await mercadoTiendasService.remove(deleteTarget.id); showSnackbar('Tienda eliminada'); await loadMercadoTiendas(id!) }
    catch { showSnackbar('Error') }
    finally { setDeleteTarget(null) }
  }

  async function handleAddCategoria(categoriaId: string) {
    if (!addCategoriaFor) return
    try { await mercadoTiendaCategoriasService.add(addCategoriaFor, categoriaId); showSnackbar('Categoría agregada'); await loadCategoriasByTienda(addCategoriaFor); setAddCategoriaFor(null) }
    catch { showSnackbar('Error') }
  }

  async function handleRemoveCategoria() {
    if (!deleteTarget || deleteTarget.type !== 'categoria') return
    try { await mercadoTiendaCategoriasService.remove(deleteTarget.id); showSnackbar('Categoría eliminada'); for (const mt of mercadoTiendas.value) await loadCategoriasByTienda(mt.id) }
    catch { showSnackbar('Error') }
    finally { setDeleteTarget(null) }
  }

  async function handleAddProducto() {
    if (!addProductoFor || !productoForm.producto_id) return
    try { await mercadoProductosService.add({ mercado_tienda_categoria_id: addProductoFor, producto_id: productoForm.producto_id, cantidad: Number(productoForm.cantidad) }); showSnackbar('Producto agregado'); await loadProductosByCategoria(addProductoFor); setAddProductoFor(null); setProductoForm({ producto_id: '', cantidad: '1', precio: '' }) }
    catch { showSnackbar('Error') }
  }

  async function handleRemoveProducto() {
    if (!deleteTarget || deleteTarget.type !== 'producto') return
    try { await mercadoProductosService.remove(deleteTarget.id); showSnackbar('Producto eliminado'); const mtcId = Object.values(mercadoProductos.value).flat().find(p => p.id === deleteTarget.id)?.mercado_tienda_categoria_id; if (mtcId) await loadProductosByCategoria(mtcId) }
    catch { showSnackbar('Error') }
    finally { setDeleteTarget(null) }
  }

  async function handleSaveEstado() {
    const item = estadoDialog.item; if (!item) return
    const precio = Number(precioEdit) || 0
    const cantidad = Number(cantidadEdit) || 1
    try {
      await mercadoProductosService.update(item.id, { estado: selectedEstado, precio, cantidad })
      await loadProductosByCategoria(item.mercado_tienda_categoria_id)
      showSnackbar(`${item.producto?.nombre ?? 'Producto'} → ${LABEL_ESTADOS[selectedEstado]} · ${cantidad} × ${formatCurrency(precio)}`)
      setEstadoDialog({ open: false, item: null })
      setRefreshKey(k => k + 1)
    } catch { showSnackbar('Error') }
  }

  if (!mercado) return <LoadingSpinner />

  const todosProductos = mercadoTiendas.value.flatMap(mt => getProductosFromTienda(mt.id))
  const totalGlobal = todosProductos.reduce((s, p) => s + (p.subtotal ?? p.precio * p.cantidad), 0)
  const encontradosGlobal = todosProductos.filter(p => p.estado === 'encontrado').length
  const totalEncontrados = todosProductos.filter(p => p.estado === 'encontrado').reduce((s, p) => s + (p.subtotal ?? p.precio * p.cantidad), 0)
  const tiendasDisponibles = tiendas.value.filter(t => !mercadoTiendas.value.some(mt => mt.tienda_id === t.id))

  const currentMT = mercadoTiendas.value.find(mt => mt.id === currentTiendaId)
  const currentProductos = currentTiendaId ? getProductosFromTienda(currentTiendaId) : []

  return (
    <Box sx={{ pb: 10 }}>
      {/* HEADER */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{mercado.nombre}</Typography>
          {mercado.estado === 'activo' && (
            <Button
              size="small"
              variant={shoppingMode ? 'contained' : 'outlined'}
              color={shoppingMode ? 'success' : 'inherit'}
              startIcon={shoppingMode ? <ShoppingCartIcon /> : <EditIcon />}
              onClick={() => setShoppingMode(!shoppingMode)}
            >
              {shoppingMode ? 'Comprando' : 'Editar'}
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
          <Chip label={mercado.estado} size="small" color={mercado.estado === 'activo' ? 'success' : 'default'} />
          <Typography variant="caption" color="text.secondary">{new Date(mercado.fecha).toLocaleDateString()}</Typography>
        </Box>
        {shoppingMode && (
            <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {encontradosGlobal}/{todosProductos.length}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#69f0ae' }}>
                {formatCurrency(totalEncontrados)} / {formatCurrency(totalGlobal)}
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={todosProductos.length > 0 ? (encontradosGlobal / todosProductos.length) * 100 : 0} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        )}
      </Box>

      {/* SHOP MODE */}
      {shoppingMode && (
        <Box sx={{ p: 2 }}>
          {currentTiendaId && currentMT ? (
            <>
              <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => setCurrentTiendaId(null)} sx={{ mb: 1 }}>
                Todas las tiendas
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography sx={{ fontSize: 24 }}>{currentMT.tienda?.icono}</Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{currentMT.tienda?.nombre}</Typography>
                  <LinearProgress variant="determinate" value={currentProductos.length > 0 ? (countEncontrados(currentTiendaId) / currentProductos.length) * 100 : 0} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#69f0ae' }}>{formatCurrency(totalTienda(currentTiendaId))}</Typography>
              </Box>
              {currentProductos.length === 0 ? (
                <EmptyState message="Sin productos en esta tienda" />
              ) : (
                <Box key={refreshKey} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {currentProductos.map(mp => (
                    <Card
                      key={mp.id}
                      onClick={() => toggleProductoEstado(mp)}
                      sx={{
                        cursor: 'pointer',
                        opacity: mp.estado === 'encontrado' ? 0.7 : 1,
                        bgcolor: mp.estado === 'encontrado' ? 'rgba(105, 240, 174, 0.08)' : undefined,
                        '&:active': { transform: 'scale(0.98)' },
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {mp.estado === 'encontrado' ? (
                          <CheckCircleIcon sx={{ color: '#69f0ae', fontSize: 28 }} />
                        ) : (
                          <RadioButtonUncheckedIcon sx={{ color: 'text.disabled', fontSize: 28 }} />
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, textDecoration: mp.estado === 'encontrado' ? 'line-through' : 'none' }}>
                            {mp.producto?.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {mp.cantidad} {mp.producto?.unidad}
                          </Typography>
                        </Box>
                        {mp.precio > 0 && (
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#69f0ae' }}>
                            {formatCurrency(mp.precio * mp.cantidad)}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </>
          ) : (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Selecciona una tienda</Typography>
              {mercadoTiendas.value.length === 0 ? (
                <EmptyState message="No hay que comprar" />
              ) : (
                mercadoTiendas.value.map(mt => {
                  const prods = getProductosFromTienda(mt.id)
                  const enc = countEncontrados(mt.id)
                  return (
                    <Card key={mt.id} onClick={() => setCurrentTiendaId(mt.id)} sx={{ cursor: 'pointer', mb: 1.5, '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}>
                      <CardContent sx={{ pb: '12px !important' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography sx={{ fontSize: 32 }}>{mt.tienda?.icono}</Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{mt.tienda?.nombre}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {enc}/{prods.length} · {formatCurrency(totalEncontradosTienda(mt.id))} / {formatCurrency(totalTienda(mt.id))}
                              </Typography>
                            <LinearProgress variant="determinate" value={prods.length > 0 ? (enc / prods.length) * 100 : 0} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </>
          )}
        </Box>
      )}

      {/* EDIT MODE */}
      {!shoppingMode && (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Tiendas en este mercado</Typography>
          {mercadoTiendas.value.length === 0 ? (
            <EmptyState message="Agrega tiendas a este mercado" />
          ) : (
            mercadoTiendas.value.map(mt => (
              <Accordion key={mt.id} expanded={tiendaExpanded === mt.id} onChange={(_, exp) => setTiendaExpanded(exp ? mt.id : false)} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Typography sx={{ fontSize: 20 }}>{mt.tienda?.icono}</Typography>
                    <Typography sx={{ flex: 1, fontWeight: 500 }}>{mt.tienda?.nombre}</Typography>
                    <IconButton size="small" onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'tienda', id: mt.id }) }}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>Categorías</Typography>
                  {getCategorias(mt.id).length === 0 ? (
                    <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>Sin categorías aún</Typography>
                  ) : (
                    getCategorias(mt.id).map(mtc => (
                      <Accordion key={mtc.id} expanded={catExpanded === mtc.id} onChange={(_, exp) => setCatExpanded(exp ? mtc.id : false)} sx={{ mb: 0.5 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <Typography>{mtc.categoria?.icono}</Typography>
                            <Typography sx={{ flex: 1 }}>{mtc.categoria?.nombre}<Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>({getProductos(mtc.id).length})</Typography></Typography>
                            <IconButton size="small" onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'categoria', id: mtc.id }) }}><DeleteIcon fontSize="small" /></IconButton>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          {getProductos(mtc.id).length === 0 ? (
                            <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>Sin productos</Typography>
                          ) : (
                            getProductos(mtc.id).map(mp => (
                              <Card key={mp.id} sx={{ mb: 1, '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}>
                                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{mp.producto?.nombre}</Typography>
                                      <Typography variant="caption" color="text.secondary">{mp.cantidad} {mp.producto?.unidad}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      {mp.precio > 0 && (
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#69f0ae', lineHeight: 1, letterSpacing: '-0.5px' }}>{formatCurrency(mp.precio)}</Typography>
                                      )}
                                      <Chip label={LABEL_ESTADOS[mp.estado]} size="small" color={mp.estado === 'encontrado' ? 'success' : mp.estado === 'no_habia' ? 'warning' : 'default'} onClick={() => { setSelectedEstado(mp.estado); setPrecioEdit(mp.precio.toString()); setCantidadEdit(mp.cantidad.toString()); setEstadoDialog({ open: true, item: mp }) }} />
                                      <IconButton size="small" onClick={() => setDeleteTarget({ type: 'producto', id: mp.id })}><DeleteIcon fontSize="small" /></IconButton>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            ))
                          )}
                          <Button size="small" startIcon={<AddIcon />} onClick={() => { setAddProductoFor(mtc.id); setProductoForm({ producto_id: '', cantidad: '1', precio: '' }) }}>Agregar producto</Button>
                        </AccordionDetails>
                      </Accordion>
                    ))
                  )}
                  <Button size="small" startIcon={<AddIcon />} onClick={() => setAddCategoriaFor(mt.id)} sx={{ mt: 1 }}>Agregar categoría</Button>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>
      )}

      {/* DIALOGS */}
      <Dialog open={addTiendaOpen} onClose={() => setAddTiendaOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Agregar tienda</DialogTitle>
        <DialogContent>
          {tiendasDisponibles.length === 0 ? <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No hay más tiendas disponibles</Typography>
          : <List>{tiendasDisponibles.map(t => (<ListItem key={t.id} disablePadding><ListItemButton onClick={() => handleAddTienda(t.id)}><Typography sx={{ mr: 1 }}>{t.icono}</Typography><ListItemText primary={t.nombre} /></ListItemButton></ListItem>))}</List>}
        </DialogContent>
        <DialogActions><Button onClick={() => setAddTiendaOpen(false)}>Cancelar</Button></DialogActions>
      </Dialog>

      <Dialog open={addCategoriaFor !== null} onClose={() => setAddCategoriaFor(null)} fullWidth maxWidth="xs">
        <DialogTitle>Agregar categoría</DialogTitle>
        <DialogContent>
          <List>{categorias.value.filter(c => !getCategorias(addCategoriaFor!).some(mtc => mtc.categoria_id === c.id) && productos.value.some(p => p.categoria_id === c.id)).map(cat => (<ListItem key={cat.id} disablePadding><ListItemButton onClick={() => handleAddCategoria(cat.id)}><Typography sx={{ mr: 1 }}>{cat.icono}</Typography><ListItemText primary={cat.nombre} /></ListItemButton></ListItem>))}</List>
        </DialogContent>
        <DialogActions><Button onClick={() => setAddCategoriaFor(null)}>Cancelar</Button></DialogActions>
      </Dialog>

      <Dialog open={addProductoFor !== null} onClose={() => setAddProductoFor(null)} fullWidth maxWidth="xs">
        <DialogTitle>Agregar producto</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Producto" value={productoForm.producto_id} onChange={e => setProductoForm(p => ({ ...p, producto_id: e.target.value }))} sx={{ mb: 2, mt: 1 }}>
            {productos.value.filter(p => p.categoria_id === (Object.values(mercadoTiendaCategorias.value).flat().find(mtc => mtc.id === addProductoFor)?.categoria_id ?? '')).map(p => (<MenuItem key={p.id} value={p.id}>{p.nombre} ({p.unidad})</MenuItem>))}
          </TextField>
          <TextField fullWidth type="number" label="Cantidad" value={productoForm.cantidad} onChange={e => setProductoForm(p => ({ ...p, cantidad: e.target.value }))} slotProps={{ htmlInput: { min: 1 } }} sx={{ mb: 2 }} />
          <TextField fullWidth type="text" label="Precio" value={productoForm.precio} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setProductoForm(p => ({ ...p, precio: val })) }} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
          {productoForm.precio && Number(productoForm.precio) > 0 && (
            <Box sx={{ mt: 2, px: 1, py: 0.5, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Precio unitario</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#69f0ae', minWidth: 120, textAlign: 'right' }}>{formatCurrency(Number(productoForm.precio))}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Total a pagar</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#69f0ae', minWidth: 120, textAlign: 'right' }}>{formatCurrency(Number(productoForm.precio) * Number(productoForm.cantidad))}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddProductoFor(null)}>Cancelar</Button>
          <Button onClick={handleAddProducto} variant="contained" disabled={!productoForm.producto_id}>Agregar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={estadoDialog.open} onClose={() => setEstadoDialog({ open: false, item: null })} fullWidth maxWidth="xs">
        <DialogTitle>
          {estadoDialog.item?.producto?.nombre ?? 'Actualizar producto'}
        </DialogTitle>
        <DialogContent>
          {estadoDialog.item && estadoDialog.item.precio > 0 && (
            <TextField select fullWidth label="Estado" value={selectedEstado} onChange={e => setSelectedEstado(e.target.value as EstadoProducto)} sx={{ mb: 2, mt: 1 }}>
              {ESTADOS_PRODUCTO.map(e => (<MenuItem key={e} value={e}>{LABEL_ESTADOS[e]}</MenuItem>))}
            </TextField>
          )}
          <TextField fullWidth type="number" label="¿Cuánto llevas?" value={cantidadEdit} onChange={e => setCantidadEdit(e.target.value)} slotProps={{ htmlInput: { min: 0 } }} sx={{ mb: 2 }} />
          <TextField fullWidth type="text" label="Precio" value={precioEdit} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setPrecioEdit(val) }} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
          {(precioEdit || Number(cantidadEdit) > 0) && (
            <Box sx={{ mt: 2, px: 1, py: 0.5, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Precio unitario</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#69f0ae', minWidth: 120, textAlign: 'right' }}>{formatCurrency(Number(precioEdit) || 0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">{cantidadEdit} × {formatCurrency(Number(precioEdit) || 0)}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#69f0ae', minWidth: 120, textAlign: 'right' }}>{formatCurrency((Number(precioEdit) || 0) * (Number(cantidadEdit) || 0))}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEstadoDialog({ open: false, item: null })}>Cancelar</Button>
          <Button onClick={handleSaveEstado} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={deleteTarget !== null} title="Eliminar" message="¿Eliminar este elemento?" onConfirm={() => { if (deleteTarget?.type === 'tienda') handleRemoveTienda(); else if (deleteTarget?.type === 'categoria') handleRemoveCategoria(); else if (deleteTarget?.type === 'producto') handleRemoveProducto() }} onCancel={() => setDeleteTarget(null)} />
    </Box>
  )
}
