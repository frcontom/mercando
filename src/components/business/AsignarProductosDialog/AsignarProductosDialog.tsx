import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { Producto, Tienda } from '@/models'

interface AsignarProductosDialogProps {
  open: boolean
  productos: Producto[]
  tiendas: Tienda[]
  onSave: (selected: { producto_id: string; tienda_id: string; cantidad: number }[]) => Promise<void>
  onClose: () => void
}

export function AsignarProductosDialog({ open, productos, tiendas, onSave, onClose }: AsignarProductosDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [tiendaId, setTiendaId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setSelected(new Set())
      setTiendaId(tiendas[0]?.id ?? '')
      setSaving(false)
    }
  }, [open, tiendas])

  function toggleProducto(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleTodos() {
    if (selected.size === productos.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(productos.map(p => p.id)))
    }
  }

  async function handleSave() {
    if (selected.size === 0) return
    setSaving(true)
    try {
      const items = Array.from(selected).map(producto_id => ({
        producto_id,
        tienda_id: tiendaId,
        cantidad: 1,
      }))
      await onSave(items)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Agregar productos</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          label="Tienda"
          value={tiendaId}
          onChange={e => setTiendaId(e.target.value)}
          sx={{ mb: 2 }}
        >
          {tiendas.map(t => (
            <MenuItem key={t.id} value={t.id}>{t.icono} {t.nombre}</MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Productos
          </Typography>
          <Button size="small" onClick={toggleTodos}>
            {selected.size === productos.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </Button>
        </Box>

        <Box sx={{ maxHeight: 260, overflow: 'auto' }}>
          <List dense>
            {productos.map(p => (
              <ListItem key={p.id} onClick={() => toggleProducto(p.id)} sx={{ cursor: 'pointer' }}>
                <ListItemIcon>
                  <Checkbox checked={selected.has(p.id)} />
                </ListItemIcon>
                <ListItemText primary={p.nombre} secondary={p.unidad} />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={selected.size === 0 || saving}>
          {saving ? 'Guardando...' : `Agregar a ${tiendas.find(t => t.id === tiendaId)?.nombre ?? ''} (${selected.size})`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
