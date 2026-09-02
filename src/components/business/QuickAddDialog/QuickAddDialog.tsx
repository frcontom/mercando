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
import { ESTADOS_PRODUCTO, LABEL_ESTADOS } from '@/core/constants/estados'
import type { EstadoProducto, Producto, Categoria } from '@/models'
import { formatCurrency } from '@/core/utils/formatters'

interface QuickAddDialogProps {
  open: boolean
  categoriasCatalog: Categoria[]
  productosDisp: Producto[]
  productosIdsEnMercado: Set<string>
  onSave: (data: { categoria_id: string; producto_id: string; cantidad: number; precio: number; cantidad_encontrada: number; estado: EstadoProducto }) => Promise<void>
  onClose: () => void
}

export function QuickAddDialog({ open, categoriasCatalog, productosDisp, productosIdsEnMercado, onSave, onClose }: QuickAddDialogProps) {
  const [categoriaId, setCategoriaId] = useState(categoriasCatalog[0]?.id ?? '')
  const [producto, setProducto] = useState<Producto | null>(null)
  const [estado, setEstado] = useState<EstadoProducto>('pendiente')
  const [cantidad, setCantidad] = useState('1')
  const [precio, setPrecio] = useState('')
  const [saving, setSaving] = useState(false)

  const disponibles = productosDisp.filter(p => {
    if (productosIdsEnMercado.has(p.id)) return false
    if (!categoriaId) return true
    return p.categoria_id === categoriaId
  })

  useEffect(() => {
    if (open) {
      setCategoriaId(categoriasCatalog[0]?.id ?? '')
      setProducto(null)
      setEstado('pendiente')
      setCantidad('1')
      setPrecio('')
    }
  }, [open, categoriasCatalog])

  useEffect(() => {
    if (estado === 'pendiente' || estado === 'no_habia') { setCantidad('0'); setPrecio('0') }
    else if (estado === 'encontrado') { setCantidad('1'); setPrecio('') }
  }, [estado])

  async function handleSave() {
    if (!producto || !categoriaId) return
    if (estado === 'encontrado' && !precio) return
    setSaving(true)
    try {
      const cant = Number(cantidad) || 0
      await onSave({
        categoria_id: categoriaId,
        producto_id: producto.id,
        cantidad: estado === 'pendiente' ? 1 : cant || 1,
        precio: estado === 'encontrado' ? (Number(precio) || 0) : 0,
        cantidad_encontrada: estado === 'encontrado' ? cant : 0,
        estado,
      })
      onClose()
    } finally { setSaving(false) }
  }

  const disabled = estado === 'pendiente' || estado === 'no_habia'

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Agregar producto rápido</DialogTitle>
      <DialogContent>
        <TextField select fullWidth label="Categoría" value={categoriaId} onChange={e => { setCategoriaId(e.target.value); setProducto(null) }} sx={{ mb: 2, mt: 1 }}>
          {categoriasCatalog.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.icono} {c.nombre}</MenuItem>
          ))}
        </TextField>
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
            {producto && (
              <>
                <TextField select fullWidth label="Estado" value={estado} onChange={e => setEstado(e.target.value as EstadoProducto)} sx={{ mb: 2 }}>
                  {ESTADOS_PRODUCTO.map(e => (<MenuItem key={e} value={e}>{LABEL_ESTADOS[e]}</MenuItem>))}
                </TextField>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField select label="Cantidad" value={cantidad} onChange={e => setCantidad(e.target.value)} disabled={disabled} sx={{ flex: 1 }}>
                    {disabled ? <MenuItem value="0">0</MenuItem> : Array.from({ length: 20 }, (_, i) => i + 1).map(n => (<MenuItem key={n} value={n.toString()}>{n}</MenuItem>))}
                  </TextField>
                  <TextField type="text" label="Precio" value={precio} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setPrecio(val) }} disabled={disabled} required={estado === 'encontrado'} slotProps={{ htmlInput: { inputMode: 'numeric' } }} sx={{ flex: 1 }} />
                </Box>
                {estado === 'encontrado' && precio && (
                  <Box sx={{ textAlign: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#69f0ae', fontWeight: 700 }}>{formatCurrency(Number(precio) * Number(cantidad))}</Typography>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={!producto || !categoriaId || saving || (estado === 'encontrado' && !precio)}>Agregar</Button>
      </DialogActions>
    </Dialog>
  )
}