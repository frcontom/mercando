import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import { mercados, loadMercados, mercadoProductos, loadingMercadoProductos, loadMercadoProductos, tiendas, loadTiendas, productos, loadProductos } from '@/store'
import { mercadoProductosService } from '@/services'
import { showSnackbar } from '@/store'
import { formatCurrency } from '@/core/utils/formatters'
import { ESTADOS_PRODUCTO, LABEL_ESTADOS } from '@/core/constants/estados'
import type { EstadoProducto, MercadoProducto } from '@/models'
import { MercadoProductoItem } from '@/components/business/MercadoProductoItem'
import { AsignarProductosDialog } from '@/components/business/AsignarProductosDialog'
import { AppFab } from '@/components/ui/AppFab'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function MercadoDetailPage() {
  const { id } = useParams()
  const [asignarOpen, setAsignarOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MercadoProducto | null>(null)
  const [estadoDialog, setEstadoDialog] = useState<{ open: boolean; item: MercadoProducto | null }>({ open: false, item: null })
  const [selectedEstado, setSelectedEstado] = useState<EstadoProducto>('pendiente')
  const [precioEdit, setPrecioEdit] = useState('')

  const mercado = mercados.value.find(m => m.id === id)

  useEffect(() => {
    if (id) {
      loadMercados()
      loadMercadoProductos(id)
      loadTiendas()
      loadProductos()
    }
  }, [id])

  async function handleAsignar(selected: { producto_id: string; tienda_id: string; cantidad: number }[]) {
    if (!id) return
    for (const item of selected) {
      await mercadoProductosService.add({ mercado_id: id, ...item })
    }
    showSnackbar(`${selected.length} producto(s) agregado(s)`)
    await loadMercadoProductos(id)
  }

  async function handleDeleteItem() {
    if (!deleteTarget) return
    await mercadoProductosService.remove(deleteTarget.id)
    showSnackbar('Producto eliminado del mercado')
    setDeleteTarget(null)
    if (id) await loadMercadoProductos(id)
  }

  function openEstadoDialog(item: MercadoProducto) {
    setSelectedEstado(item.estado)
    setPrecioEdit(item.precio > 0 ? item.precio.toString() : '')
    setEstadoDialog({ open: true, item })
  }

  async function handleSaveEstado() {
    const item = estadoDialog.item
    if (!item) return
    await mercadoProductosService.update(item.id, {
      estado: selectedEstado,
      precio: Number(precioEdit) || 0,
    })
    showSnackbar('Producto actualizado')
    setEstadoDialog({ open: false, item: null })
    if (id) await loadMercadoProductos(id)
  }

  if (!mercado) return <LoadingSpinner />
  if (loadingMercadoProductos.value) return <LoadingSpinner />

  const total = mercadoProductos.value.reduce((sum, p) => sum + (p.subtotal || p.precio * p.cantidad), 0)
  const grupos = new Map<string, MercadoProducto[]>()
  for (const mp of mercadoProductos.value) {
    const key = mp.tienda?.nombre ?? 'Sin tienda'
    if (!grupos.has(key)) grupos.set(key, [])
    grupos.get(key)!.push(mp)
  }
  const pendientes = mercadoProductos.value.filter(p => p.estado === 'pendiente').length
  const encontrados = mercadoProductos.value.filter(p => p.estado === 'encontrado').length

  return (
    <Box sx={{ pb: 10 }}>
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6">{mercado.nombre}</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
          <Chip label={mercado.estado} size="small" color={mercado.estado === 'completado' ? 'success' : 'warning'} />
          <Typography variant="caption" color="text.secondary">
            {new Date(mercado.fecha).toLocaleDateString()}
          </Typography>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              {encontrados}/{mercadoProductos.value.length} encontrados · {pendientes} pendientes
            </Typography>
            <Typography variant="caption">{formatCurrency(total)} / {formatCurrency(mercado.presupuesto)}</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(total / mercado.presupuesto, 1) * 100}
            sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
          />
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        {mercadoProductos.value.length === 0 ? (
          <EmptyState message="Agrega productos a este mercado" />
        ) : (
          Array.from(grupos.entries()).map(([tienda, items]) => (
            <Box key={tienda} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                {tienda}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {items.map(mp => (
                  <MercadoProductoItem
                    key={mp.id}
                    item={mp}
                    onDelete={setDeleteTarget}
                    onChangeEstado={openEstadoDialog}
                  />
                ))}
              </Box>
            </Box>
          ))
        )}
      </Box>

      {mercado.estado !== 'completado' && <AppFab onClick={() => setAsignarOpen(true)} />}

      <AsignarProductosDialog
        open={asignarOpen}
        productos={productos.value}
        tiendas={tiendas.value}
        onSave={handleAsignar}
        onClose={() => setAsignarOpen(false)}
      />

      <Dialog open={estadoDialog.open} onClose={() => setEstadoDialog({ open: false, item: null })} fullWidth maxWidth="xs">
        <DialogTitle>Actualizar producto</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Estado"
            value={selectedEstado}
            onChange={e => setSelectedEstado(e.target.value as EstadoProducto)}
            sx={{ mb: 2, mt: 1 }}
          >
            {ESTADOS_PRODUCTO.map(e => (
              <MenuItem key={e} value={e}>{LABEL_ESTADOS[e]}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            type="number"
            label="Precio"
            value={precioEdit}
            onChange={e => setPrecioEdit(e.target.value)}
            slotProps={{ htmlInput: { min: 0 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEstadoDialog({ open: false, item: null })}>Cancelar</Button>
          <Button onClick={handleSaveEstado} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar producto"
        message="¿Eliminar este producto del mercado?"
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
