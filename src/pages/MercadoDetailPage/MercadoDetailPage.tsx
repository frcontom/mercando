import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'

import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import MenuItem from '@mui/material/MenuItem'

import { mercados, loadMercados } from '@/store'
import { mercadoTiendas, loadMercadoTiendas } from '@/store'
import { mercadoTiendaCategorias, loadCategoriasByTienda, getCategoriasByTienda } from '@/store'
import { mercadoProductos, loadProductosByCategoria, getProductosByCategoria } from '@/store'
import { tiendas, loadTiendas, categorias, loadCategorias, productos, loadProductos } from '@/store'
import { mercadoTiendasService, mercadoTiendaCategoriasService, mercadoProductosService } from '@/services'
import { supabase } from '@/services/supabase.client'
import { showSnackbar, pendingCount, refreshHandler, userRole } from '@/store'
import { StoreIcon } from '@/components/business/StoreIcon'
import { QuickAddDialog } from '@/components/business/QuickAddDialog'
import { playClick } from '@/core/utils/sound'
import { CompraCompletadaDialog } from '@/components/business/CompraCompletadaDialog'
import confetti from 'canvas-confetti'
import { subscribeToChanges } from '@/core/utils/realtime'
import { formatCurrency } from '@/core/utils/formatters'
import { ESTADOS_PRODUCTO, LABEL_ESTADOS } from '@/core/constants/estados'
import type { EstadoProducto, MercadoProducto } from '@/models'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function MercadoDetailPage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [shoppingMode, setShoppingMode] = useState(true)
  const [currentTiendaId, setCurrentTiendaId] = useState<string | null>(searchParams.get('tienda') ?? null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null)

  const [addTiendaOpen, setAddTiendaOpen] = useState(false)
  const [addCategoriaFor, setAddCategoriaFor] = useState<string | null>(null)
  const [addProductoFor, setAddProductoFor] = useState<string | null>(null)
  const [productoForm, setProductoForm] = useState({ producto_id: '', cantidad: '1' })
  const [estadoDialog, setEstadoDialog] = useState<{ open: boolean; item: MercadoProducto | null }>({ open: false, item: null })
  const [quantityDialog, setQuantityDialog] = useState<{ open: boolean; item: MercadoProducto | null }>({ open: false, item: null })
  const [selectedEstado, setSelectedEstado] = useState<EstadoProducto>('pendiente')
  const [refreshKey, setRefreshKey] = useState(0)
  const [precioEdit, setPrecioEdit] = useState('')
  const [cantidadEdit, setCantidadEdit] = useState('1')
  const [searchQuery, setSearchQuery] = useState('')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const mercado = mercados.value.find(m => m.id === id)

  const [dataLoaded, setDataLoaded] = useState(false)

  function updatePendingCount() {
    let total = 0
    for (const mt of mercadoTiendas.value) {
      for (const c of getCategorias(mt.id)) {
        for (const p of getProductos(c.id)) {
          if (p.estado === 'pendiente') total++
        }
      }
    }
    pendingCount.value = total
  }

  useEffect(() => {
    if (!id) return; (async () => {
      try {
        await Promise.all([loadMercados(), loadTiendas(), loadCategorias(), loadProductos()])
        await loadMercadoTiendas(id)
        for (const mt of mercadoTiendas.value) await loadCategoriasByTienda(mt.id)
        for (const cats of Object.values(mercadoTiendaCategorias.value).flat()) await loadProductosByCategoria(cats.id)
        updatePendingCount()
      } catch (e) { console.error(e) }
      setDataLoaded(true)
    })()
  }, [id])

  useEffect(() => {
    refreshHandler.value = async () => {
      if (!id) return
      await loadMercadoTiendas(id)
      for (const mt of mercadoTiendas.value) await loadCategoriasByTienda(mt.id)
      for (const cats of Object.values(mercadoTiendaCategorias.value).flat()) await loadProductosByCategoria(cats.id)
      setRefreshKey(k => k + 1); updatePendingCount()
    }
    return () => { refreshHandler.value = null }
  }, [id])

  useEffect(() => {
    if (!id) return
    const handler = () => { (async () => {
      await loadMercadoTiendas(id)
      for (const mt of mercadoTiendas.value) await loadCategoriasByTienda(mt.id)
      for (const cats of Object.values(mercadoTiendaCategorias.value).flat()) await loadProductosByCategoria(cats.id)
      setRefreshKey(k => k + 1)
    })() }
    window.addEventListener('refresh-mercado', handler)
    subscribeToChanges(id)
    return () => window.removeEventListener('refresh-mercado', handler)
  }, [id])

  useEffect(() => {
    if (selectedEstado === 'no_habia' || selectedEstado === 'pendiente') { setCantidadEdit('0'); setPrecioEdit('0') }
    else if (selectedEstado === 'encontrado') {
      setCantidadEdit(estadoDialog.item ? (estadoDialog.item.cantidad_encontrada || estadoDialog.item.cantidad).toString() : '1')
      setPrecioEdit(estadoDialog.item && estadoDialog.item.precio > 0 ? estadoDialog.item.precio.toString() : '')
    }
  }, [selectedEstado])

  function getCategorias(mtId: string) { return getCategoriasByTienda(mtId) }
  function getProductos(mtcId: string) { return getProductosByCategoria(mtcId) }
  function getProductosFromTienda(mtId: string) {
    const order = { pendiente: 0, encontrado: 1, no_habia: 2 }
    return getCategorias(mtId).flatMap(c => getProductos(c.id))
      .sort((a, b) => (order[a.estado] ?? 0) - (order[b.estado] ?? 0))
  }
  function qtyParaTotal(mp: MercadoProducto) {
    return mp.estado !== 'pendiente' && mp.cantidad_encontrada > 0 ? mp.cantidad_encontrada : mp.cantidad
  }
  function countEncontrados(mtId: string) {
    if (mtId === '__todas__') return encontradosGlobal
    return getProductosFromTienda(mtId).filter(p => p.estado === 'encontrado').length
  }
  function totalTienda(mtId: string) {
    return getProductosFromTienda(mtId).reduce((s, p) => s + (p.subtotal ?? p.precio * qtyParaTotal(p)), 0)
  }
  function totalEncontradosTienda(mtId: string) {
    return getProductosFromTienda(mtId).filter(p => p.estado === 'encontrado').reduce((s, p) => s + (p.subtotal ?? p.precio * qtyParaTotal(p)), 0)
  }

  async function toggleProductoEstado(mp: MercadoProducto) {
    setSelectedEstado(mp.estado === 'pendiente' ? 'encontrado' : mp.estado)
    setPrecioEdit(mp.precio > 0 ? mp.precio.toString() : '')
    setCantidadEdit(mp.cantidad_encontrada > 0 ? mp.cantidad_encontrada.toString() : mp.cantidad.toString())
    setEstadoDialog({ open: true, item: mp })
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
    try { await mercadoProductosService.add({ mercado_tienda_categoria_id: addProductoFor, producto_id: productoForm.producto_id, cantidad: Number(productoForm.cantidad) }); showSnackbar('Producto agregado'); await loadProductosByCategoria(addProductoFor); setAddProductoFor(null); setProductoForm({ producto_id: '', cantidad: '1' }) }
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
    const precio = selectedEstado === 'pendiente' ? 0 : (Number(precioEdit) || 0)
    const cantidad = selectedEstado === 'pendiente' ? item.cantidad : (Number(cantidadEdit) || 1)
    const encontrada = selectedEstado === 'pendiente' ? 0 : (selectedEstado === 'encontrado' ? cantidad : 0)
    try {
      await mercadoProductosService.update(item.id, { estado: selectedEstado, precio, cantidad: item.cantidad, cantidad_encontrada: encontrada })
      await loadProductosByCategoria(item.mercado_tienda_categoria_id)
      if (selectedEstado === 'encontrado') playClick()
      if (navigator.vibrate) navigator.vibrate(selectedEstado === 'encontrado' ? 10 : 20)
      showSnackbar(`${item.producto?.nombre ?? 'Producto'} → ${LABEL_ESTADOS[selectedEstado]}`)
      setEstadoDialog({ open: false, item: null })
      setRefreshKey(k => k + 1)
      updatePendingCount()
      if (pendingCount.value === 0) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#90caf9', '#69f0ae', '#ffd740'] })
        setTimeout(() => setSummaryOpen(true), 1200)
      }
    } catch { showSnackbar('Error') }
  }

  if (!dataLoaded || !mercado) return <LoadingSpinner />

  const order = { pendiente: 0, encontrado: 1, no_habia: 2 }
  const todosProductos = mercadoTiendas.value.flatMap(mt => getProductosFromTienda(mt.id))
    .sort((a, b) => (order[a.estado] ?? 0) - (order[b.estado] ?? 0))
  const totalGlobal = todosProductos.reduce((s, p) => s + (p.subtotal ?? p.precio * qtyParaTotal(p)), 0)
  const encontradosGlobal = todosProductos.filter(p => p.estado === 'encontrado').length
  const totalEncontrados = todosProductos.filter(p => p.estado === 'encontrado').reduce((s, p) => s + (p.subtotal ?? p.precio * qtyParaTotal(p)), 0)
  const tiendasDisponibles = tiendas.value.filter(t => !mercadoTiendas.value.some(mt => mt.tienda_id === t.id))

  const currentMT = mercadoTiendas.value.find(mt => mt.id === currentTiendaId)
  const currentProductos = currentTiendaId === '__todas__' ? todosProductos : currentTiendaId ? getProductosFromTienda(currentTiendaId) : []

  return (
    <Box sx={{ pb: 10 }}>
      {/* HEADER */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{mercado.nombre}</Typography>
          {mercado.estado === 'activo' && userRole.value === 'admin' && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {searchParams.get('edit') === '1' && !currentTiendaId && (
                <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => setShoppingMode(false)}>Editar</Button>
              )}
              <Button size="small" variant="contained" onClick={() => setQuickAddOpen(true)} sx={{ minWidth: 40, px: 1, fontSize: '1.1rem', lineHeight: 1 }}>+</Button>
            </Box>
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
          {currentTiendaId && (currentMT || currentTiendaId === '__todas__') ? (
            <>
              <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => { setCurrentTiendaId(null); const e = searchParams.get('edit'); setSearchParams(e ? { edit: e } : {}) }} sx={{ mb: 1 }}>
                {currentTiendaId === '__todas__' ? 'Inicio' : 'Todas las tiendas'}
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                {currentTiendaId === '__todas__' ? <Typography sx={{ fontSize: 24 }}>📋</Typography> : <StoreIcon tienda={currentMT?.tienda} size={32} />}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{currentTiendaId === '__todas__' ? 'Todas las tiendas' : currentMT?.tienda?.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {countEncontrados(currentTiendaId)}/{currentProductos.length}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#69f0ae', lineHeight: 1.2 }}>{formatCurrency(currentTiendaId === '__todas__' ? totalEncontrados : totalTienda(currentTiendaId))}</Typography>
                  <Typography variant="caption" color="text.secondary">/ {formatCurrency(currentTiendaId === '__todas__' ? totalGlobal : totalTienda(currentTiendaId))}</Typography>
                </Box>
              </Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar producto…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                slotProps={{ htmlInput: { style: { fontSize: '0.875rem' } } }}
                sx={{ mb: 2 }}
              />
              {(() => {
                const filtered = currentProductos.filter(mp =>
                  mp.producto?.nombre.toLowerCase().includes(searchQuery.toLowerCase())
                )
                return filtered.length === 0 ? (
                  <EmptyState message="Sin productos en esta tienda" />
                ) : (
                  <Box key={refreshKey} sx={{ display: 'flex', flexDirection: 'column' }}>
                    {(() => {
                      const groups = new Map<string, { icono: string; nombre: string; items: typeof filtered }>()
                      for (const mp of filtered) {
                        const mtc = Object.values(mercadoTiendaCategorias.value).flat().find(c => c.id === mp.mercado_tienda_categoria_id)
                        const key = mtc?.categoria?.nombre ?? 'Sin categoría'
                        if (!groups.has(key)) groups.set(key, { icono: mtc?.categoria?.icono ?? '📦', nombre: key, items: [] })
                        groups.get(key)!.items.push(mp)
                      }
                      const entries = Array.from(groups.entries())
                      return <>{entries.map(([catName, group]) => (
                        <Box key={catName}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', display: 'block', py: 0.8, px: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                            {group.icono} {group.nombre}
                          </Typography>
                          {group.items.map(mp => {
                            const letra = mp.producto?.nombre?.charAt(0).toUpperCase() ?? '?'
                            const colorEstado = mp.estado === 'encontrado' ? '#69f0ae' : mp.estado === 'no_habia' ? '#ff9800' : 'rgba(255,255,255,0.15)'
                            const encontrada = mp.cantidad_encontrada || mp.cantidad
                            const avance = mp.cantidad > 0 ? encontrada / mp.cantidad : 0
                            let touchStartX = 0
                            let touchStartY = 0
                            let touchMoved = false
                            return (
                            <Box
                              key={mp.id}
                              onClick={() => { if (!touchMoved) toggleProductoEstado(mp); touchMoved = false }}
                              onTouchStart={e => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; touchMoved = false }}
                              onTouchMove={e => {
                                const dx = Math.abs(e.touches[0].clientX - touchStartX)
                                const dy = Math.abs(e.touches[0].clientY - touchStartY)
                                if (dx > 30 && dx > dy) touchMoved = true
                              }}
                              onTouchEnd={e => {
                                if (!touchMoved) return
                                const dx = e.changedTouches[0].clientX - touchStartX
                                if (Math.abs(dx) > 50) {
                                  const nuevoEstado = dx > 0 ? 'encontrado' : 'no_habia'
                                  if (mp.estado !== nuevoEstado) {
                                    mercadoProductosService.update(mp.id, { estado: nuevoEstado as any })
                                  }
                                }
                              }}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                py: 1.2,
                                px: 1,
                                cursor: 'pointer',
                                borderRadius: 1,
                                mb: 1,
                                opacity: mp.estado !== 'pendiente' ? 0.65 : 1,
                                bgcolor: mp.estado === 'encontrado' ? 'rgba(105,240,174,0.04)' : mp.estado === 'no_habia' ? 'rgba(255,152,0,0.04)' : 'rgba(255,255,255,0.015)',
                                border: '1px solid',
                                borderColor: mp.estado === 'encontrado' ? 'rgba(105,240,174,0.08)' : mp.estado === 'no_habia' ? 'rgba(255,152,0,0.08)' : 'rgba(255,255,255,0.03)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: '-80%',
                                  right: '-10%',
                                  width: 80,
                                  height: 80,
                                  borderRadius: '50%',
                                  background: mp.estado === 'encontrado'
                                    ? 'radial-gradient(circle, rgba(105,240,174,0.06) 0%, transparent 70%)'
                                    : mp.estado === 'no_habia'
                                    ? 'radial-gradient(circle, rgba(255,152,0,0.06) 0%, transparent 70%)'
                                    : 'none',
                                },
                                '&:active': { bgcolor: 'action.hover' },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <Box sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                backgroundColor: colorEstado,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: 12,
                                fontWeight: 700,
                                color: mp.estado === 'pendiente' ? 'text.secondary' : '#000',
                              }}>
                                {letra}
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3, textDecoration: mp.estado !== 'pendiente' ? 'line-through' : 'none' }}>
                                  {mp.producto?.nombre}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                                  <Box component="span" sx={{ fontWeight: 500 }}>{mp.cantidad} {mp.producto?.unidad}</Box>
                                  {mp.estado !== 'pendiente' ? (
                                    <>
                                      <Box component="span" sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                                      <Box component="span" sx={{ fontWeight: 600, color: mp.estado === 'encontrado' ? 'rgba(105,240,174,0.7)' : 'rgba(255,152,0,0.7)' }}>
                                        {mp.estado === 'no_habia' ? '0' : encontrada}
                                      </Box>
                                    </>
                                  ) : null}
                                </Typography>
                                {mp.estado !== 'pendiente' && mp.cantidad > 0 && (
                                  <Box sx={{ width: '100%', height: 2, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 1, mt: 0.3, overflow: 'hidden' }}>
                                    <Box sx={{ width: `${Math.min(avance, 1) * 100}%`, height: '100%', bgcolor: colorEstado, borderRadius: 1, transition: 'width 0.3s ease' }} />
                                  </Box>
                                )}
                              </Box>
                              {mp.estado === 'no_habia' ? (
                                <Box sx={{ bgcolor: 'rgba(255,152,0,0.15)', color: '#ff9800', fontSize: '0.6rem', fontWeight: 700, px: 1, py: 0.3, borderRadius: 1, flexShrink: 0, whiteSpace: 'nowrap' }}>
                                  No había
                                </Box>
                              ) : mp.precio > 0 ? (
                                <Box sx={{
                                  bgcolor: mp.estado === 'encontrado' ? 'rgba(105,240,174,0.15)' : 'rgba(255,255,255,0.06)',
                                  color: mp.estado === 'encontrado' ? '#69f0ae' : 'text.disabled',
                                  fontSize: '0.7rem', fontWeight: 700, px: 1, py: 0.3, borderRadius: 1, flexShrink: 0, whiteSpace: 'nowrap',
                                }}>
                                  {formatCurrency(mp.precio * qtyParaTotal(mp))}
                                </Box>
                              ) : null}
                            </Box>
                          )
                          })}
                        </Box>
                      ))}</>
                    })()}
                  </Box>
              )})()}
            </>
          ) : (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Selecciona una tienda</Typography>
              {mercadoTiendas.value.length === 0 ? (
                <EmptyState message="No hay que comprar" />
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Card onClick={() => { setCurrentTiendaId('__todas__'); const e = searchParams.get('edit'); setSearchParams(e ? { edit: e } : {}) }} sx={{ cursor: 'pointer', mb: 1.5, '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}>
                    <CardContent sx={{ pb: '12px !important' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontSize: 28, opacity: 0.5 }}>📋</Typography>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Todas las tiendas</Typography>
                          <Typography variant="caption" color="text.secondary">{encontradosGlobal}/{todosProductos.length} · {formatCurrency(totalEncontrados)} / {formatCurrency(totalGlobal)}</Typography>
                          <LinearProgress variant="determinate" value={todosProductos.length > 0 ? (encontradosGlobal / todosProductos.length) * 100 : 0} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                  {mercadoTiendas.value.map(mt => (
                    <Card key={mt.id} onClick={() => { setCurrentTiendaId(mt.id); const e = searchParams.get('edit'); setSearchParams(e ? { edit: e, tienda: mt.id } : { tienda: mt.id }) }} sx={{ cursor: 'pointer', mb: 1.5, '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}>
                      <CardContent sx={{ pb: '12px !important' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <StoreIcon tienda={mt.tienda} size={32} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{mt.tienda?.nombre}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {countEncontrados(mt.id)}/{getProductosFromTienda(mt.id).length} · {formatCurrency(totalEncontradosTienda(mt.id))} / {formatCurrency(totalTienda(mt.id))}
                            </Typography>
                            <LinearProgress variant="determinate" value={getProductosFromTienda(mt.id).length > 0 ? (countEncontrados(mt.id) / getProductosFromTienda(mt.id).length) * 100 : 0} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {/* EDIT MODE */}
      {!shoppingMode && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={() => setAddTiendaOpen(true)}>
              Agregar tienda
            </Button>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Tiendas en este mercado</Typography>
          {mercadoTiendas.value.length === 0 ? (
            <EmptyState message="No hay tiendas aún" />
          ) : (
            mercadoTiendas.value.map(mt => (
              <Card key={mt.id} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <StoreIcon tienda={mt.tienda} size={28} />
                  <Typography sx={{ flex: 1, fontWeight: 600 }}>{mt.tienda?.nombre}</Typography>
                  <IconButton size="small" onClick={() => setAddCategoriaFor(mt.id)}><AddIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => setDeleteTarget({ type: 'tienda', id: mt.id })}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
                {getCategorias(mt.id).length === 0 ? (
                  <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>Sin categorías aún</Typography>
                ) : (
                  getCategorias(mt.id).map(mtc => (
                    <Box key={mtc.id} sx={{ mb: 1, p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography>{mtc.categoria?.icono}</Typography>
                        <Typography sx={{ flex: 1, fontWeight: 600 }}>{mtc.categoria?.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">({getProductos(mtc.id).length})</Typography>
                        {productos.value.filter(p => p.categoria_id === mtc.categoria_id).length > getProductos(mtc.id).length && (
                          <IconButton size="small" onClick={() => { setAddProductoFor(mtc.id); setProductoForm({ producto_id: '', cantidad: '1' }) }}><AddIcon fontSize="small" /></IconButton>
                        )}
                        <IconButton size="small" onClick={() => setDeleteTarget({ type: 'categoria', id: mtc.id })}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                      {getProductos(mtc.id).length > 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {getProductos(mtc.id).map(mp => (
                            <Box key={mp.id} onClick={() => { setCantidadEdit(mp.cantidad.toString()); setQuantityDialog({ open: true, item: mp }) }} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, px: 0.5, cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{mp.producto?.nombre}</Typography>
                                <Typography variant="caption" color="text.secondary">{mp.cantidad} {mp.producto?.unidad}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {mp.precio > 0 && (
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#69f0ae' }}>{formatCurrency(mp.precio)}</Typography>
                                )}
                                <Chip label={LABEL_ESTADOS[mp.estado]} size="small" color={mp.estado === 'encontrado' ? 'success' : mp.estado === 'no_habia' ? 'warning' : 'default'} onClick={(e) => { e.stopPropagation(); setSelectedEstado(mp.estado); setPrecioEdit(mp.precio.toString()); setCantidadEdit(mp.cantidad_encontrada ? mp.cantidad_encontrada.toString() : mp.cantidad.toString()); setEstadoDialog({ open: true, item: mp }) }} />
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'producto', id: mp.id }) }}><DeleteIcon fontSize="small" /></IconButton>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))
                )}
              </Card>
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
          {(() => {
            const disponibles = productos.value.filter(p => p.categoria_id === (Object.values(mercadoTiendaCategorias.value).flat().find(mtc => mtc.id === addProductoFor)?.categoria_id ?? '') && !getProductos(addProductoFor!).some(mp => mp.producto_id === p.id))
            const selected = disponibles.find(p => p.id === productoForm.producto_id) ?? null
            return (
              <Autocomplete
                options={disponibles}
                value={selected}
                onChange={(_, v) => setProductoForm(p => ({ ...p, producto_id: v?.id ?? '' }))}
                getOptionLabel={o => o.nombre}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                renderInput={params => <TextField {...params} label="Producto" autoFocus sx={{ mb: 2, mt: 1 }} />}
                noOptionsText="Sin resultados"
                size="small"
                fullWidth
              />
            )
          })()}
          <TextField fullWidth type="number" label="Cantidad" value={productoForm.cantidad} onChange={e => setProductoForm(p => ({ ...p, cantidad: e.target.value }))} slotProps={{ htmlInput: { min: 1 } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddProductoFor(null)}>Cancelar</Button>
          <Button onClick={handleAddProducto} variant="contained" disabled={!productoForm.producto_id}>Agregar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={quantityDialog.open} onClose={() => setQuantityDialog({ open: false, item: null })} fullWidth maxWidth="xs">
        <DialogTitle>{quantityDialog.item?.producto?.nombre ?? 'Editar cantidad'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth type="number" label="Cantidad" value={cantidadEdit} onChange={e => setCantidadEdit(e.target.value)} slotProps={{ htmlInput: { min: 1, style: { textAlign: 'center' } } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuantityDialog({ open: false, item: null })}>Cancelar</Button>
          <Button onClick={async () => {
            const item = quantityDialog.item; if (!item) return
            try { await mercadoProductosService.update(item.id, { cantidad: Number(cantidadEdit) || 1 }); await loadProductosByCategoria(item.mercado_tienda_categoria_id); setRefreshKey(k => k + 1); showSnackbar('Cantidad actualizada') }
            catch { showSnackbar('Error') }
            finally { setQuantityDialog({ open: false, item: null }) }
          }} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={estadoDialog.open} onClose={() => setEstadoDialog({ open: false, item: null })} fullWidth maxWidth="xs">
        <DialogTitle>
          {estadoDialog.item?.producto?.nombre ?? 'Actualizar producto'}
        </DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Estado" value={selectedEstado} onChange={e => setSelectedEstado(e.target.value as EstadoProducto)} sx={{ mb: 2, mt: 1 }}>
            {ESTADOS_PRODUCTO.map(e => (<MenuItem key={e} value={e}>{LABEL_ESTADOS[e]}</MenuItem>))}
          </TextField>
          {estadoDialog.item && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField type="number" label="Ocupas" value={estadoDialog.item.cantidad} slotProps={{ htmlInput: { readOnly: true, style: { textAlign: 'center' } } }} sx={{ flex: 1, '& .MuiInputBase-root': { bgcolor: 'action.hover' } }} />
              {selectedEstado === 'no_habia' || selectedEstado === 'pendiente' ? (
                <TextField select label="Llevas" value="0" disabled sx={{ flex: 1 }}>
                  <MenuItem value="0">0</MenuItem>
                </TextField>
              ) : (
                <TextField select label="Llevas" value={cantidadEdit} onChange={e => setCantidadEdit(e.target.value)} sx={{ flex: 1 }}>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                    <MenuItem key={n} value={n.toString()}>{n}</MenuItem>
                  ))}
                </TextField>
              )}
            </Box>
          )}
          <TextField fullWidth type="text" label="Precio" value={precioEdit} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setPrecioEdit(val) }} disabled={selectedEstado !== 'encontrado'} required={selectedEstado === 'encontrado'} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
          {selectedEstado === 'encontrado' && (precioEdit || Number(cantidadEdit) > 0) && (
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
          <Button onClick={handleSaveEstado} variant="contained" disabled={selectedEstado === 'encontrado' && !precioEdit}>{selectedEstado === 'pendiente' ? 'Resetear' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={deleteTarget !== null} title="Eliminar" message="¿Eliminar este elemento?" onConfirm={() => { if (deleteTarget?.type === 'tienda') handleRemoveTienda(); else if (deleteTarget?.type === 'categoria') handleRemoveCategoria(); else if (deleteTarget?.type === 'producto') handleRemoveProducto() }} onCancel={() => setDeleteTarget(null)} />
      <CompraCompletadaDialog
        open={summaryOpen}
        totalGastado={totalEncontrados}
        presupuesto={mercado?.presupuesto ?? 0}
        encontrados={encontradosGlobal}
        total={todosProductos.length}
        onClose={() => setSummaryOpen(false)}
      />
      <QuickAddDialog
        open={quickAddOpen}
        tiendas={mercadoTiendas.value}
        categorias={Object.values(mercadoTiendaCategorias.value).flat()}
        productosDisp={productos.value}
        productosIdsEnMercado={new Set(todosProductos.map(p => p.producto_id))}
        onSave={async (data) => {
          try {
            const { data: nuevo } = await supabase.from('mercado_productos').insert({
              mercado_tienda_categoria_id: data.mercado_tienda_categoria_id,
              producto_id: data.producto_id,
              cantidad: data.cantidad,
              cantidad_encontrada: data.cantidad_encontrada,
              precio: data.precio,
              estado: data.estado,
            }).select().single()
            showSnackbar('Producto agregado'); if (nuevo) await loadProductosByCategoria(nuevo.mercado_tienda_categoria_id); setRefreshKey(k => k + 1); updatePendingCount()
          } catch { showSnackbar('Error') }
        }}
        onClose={() => setQuickAddOpen(false)}
      />
    </Box>
  )
}
