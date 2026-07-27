import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { categorias as categoriasList } from '@/store'
import type { MercadoProducto, Producto, MercadoTienda, MercadoTiendaCategoria } from '@/models'
import { formatCurrency } from '@/core/utils/formatters'

interface QuickAddDialogProps {
  open: boolean
  tiendas: MercadoTienda[]
  categorias: MercadoTiendaCategoria[]
  productosDisp: Producto[]
  editItem?: MercadoProducto | null
  onSave: (data: { mercado_tienda_categoria_id: string; producto_id: string; cantidad: number; precio: number }) => Promise<void>
  onClose: () => void
  selectedTiendaId?: string
  selectedCategoriaId?: string
}

export function QuickAddDialog({ open, tiendas, categorias, productosDisp, editItem, onSave, onClose, selectedTiendaId, selectedCategoriaId }: QuickAddDialogProps) {
  const [tiendaId, setTiendaId] = useState(selectedTiendaId ?? tiendas[0]?.id ?? '')
  const [categoriaId, setCategoriaId] = useState(selectedCategoriaId ?? '')
  const [producto, setProducto] = useState<Producto | null>(null)
  const [cantidad, setCantidad] = useState('1')
  const [precio, setPrecio] = useState('')
  const [saving, setSaving] = useState(false)

  const disponibles = productosDisp.filter(p => {
    if (!categoriaId) return true
    const catRef = categoriasList.value.find(c => c.id === p.categoria_id)
    const mtc = categorias.find(mtc => mtc.id === categoriaId)
    return catRef && mtc ? p.categoria_id === mtc.categoria_id : true
  })

  useEffect(() => {
    if (open) {
      setTiendaId(selectedTiendaId ?? tiendas[0]?.id ?? '')
      setCategoriaId(selectedCategoriaId ?? '')
      setProducto(null)
      setCantidad(editItem?.cantidad.toString() ?? '1')
      setPrecio(editItem && editItem.precio > 0 ? editItem.precio.toString() : '')
    }
  }, [open, editItem, tiendas, selectedTiendaId, selectedCategoriaId])

  async function handleSave() {
    if (!producto || !categoriaId) return
    setSaving(true)
    try {
      await onSave({ mercado_tienda_categoria_id: categoriaId, producto_id: producto.id, cantidad: Number(cantidad) || 1, precio: Number(precio) || 0 })
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{editItem ? 'Editar producto' : 'Agregar producto rápido'}</DialogTitle>
      <DialogContent>
        <TextField select fullWidth label="Tienda" value={tiendaId} onChange={e => { setTiendaId(e.target.value); setCategoriaId(''); setProducto(null) }} sx={{ mb: 2, mt: 1 }}>
          {tiendas.map(t => (
            <MenuItem key={t.id} value={t.id}>{t.tienda?.icono} {t.tienda?.nombre}</MenuItem>
          ))}
        </TextField>
        {tiendaId && (
          <TextField select fullWidth label="Categoría" value={categoriaId} onChange={e => { setCategoriaId(e.target.value); setProducto(null) }} sx={{ mb: 2 }}>
            <MenuItem value="">Seleccionar categoría</MenuItem>
            {categorias.filter(c => c.mercado_tienda_id === tiendaId).map(c => (
              <MenuItem key={c.id} value={c.id}>{c.categoria?.icono} {c.categoria?.nombre}</MenuItem>
            ))}
          </TextField>
        )}
        {categoriaId && (
          <>
            <Autocomplete
              options={disponibles}
              value={producto}
              onChange={(_, v) => setProducto(v)}
              getOptionLabel={o => o.nombre}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={params => <TextField {...params} label="Producto" sx={{ mb: 2 }} />}
              noOptionsText="Sin resultados"
              size="small"
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField select label="Cantidad" value={cantidad} onChange={e => setCantidad(e.target.value)} sx={{ flex: 1 }}>
                {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                  <MenuItem key={n} value={n.toString()}>{n}</MenuItem>
                ))}
              </TextField>
              <TextField type="text" label="Precio" value={precio} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setPrecio(val) }} slotProps={{ htmlInput: { inputMode: 'numeric' } }} sx={{ flex: 1 }} />
            </Box>
            {precio && producto && (
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#69f0ae', fontWeight: 700 }}>
                  {formatCurrency(Number(precio) * Number(cantidad))}
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={!producto || !categoriaId || saving}>
          {editItem ? 'Guardar cambios' : 'Agregar al mercado'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
