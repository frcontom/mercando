import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import type { Producto, CreateProductoDto, UpdateProductoDto, Categoria } from '@/models'

interface ProductoFormDialogProps {
  open: boolean
  producto?: Producto | null
  categorias: Categoria[]
  onSave: (data: CreateProductoDto | UpdateProductoDto) => Promise<void>
  onClose: () => void
}

export function ProductoFormDialog({ open, producto, categorias, onSave, onClose }: ProductoFormDialogProps) {
  const [nombre, setNombre] = useState('')
  const [unidad, setUnidad] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setNombre(producto?.nombre ?? '')
      setUnidad(producto?.unidad ?? '')
      setCategoriaId(producto?.categoria_id ?? (categorias[0]?.id ?? ''))
    }
  }, [open, producto, categorias])

  async function handleSave() {
    if (!nombre.trim()) return
    setSaving(true)
    try {
      await onSave({ nombre: nombre.trim(), unidad: unidad.trim(), categoria_id: categoriaId })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{producto ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          label="Categoría"
          value={categoriaId}
          onChange={e => setCategoriaId(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        >
          {categorias.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.icono} {c.nombre}</MenuItem>
          ))}
        </TextField>
        <TextField
          autoFocus
          fullWidth
          label="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          select
          fullWidth
          label="Unidad"
          value={unidad}
          onChange={e => setUnidad(e.target.value)}
        >
          {['kg', 'g', 'lb', 'pieza', 'litro', 'ml', 'bolsa', 'paquete', 'caja', 'botella', 'lata', 'docena', 'atado', 'manojo'].map(u => (
            <MenuItem key={u} value={u}>{u}</MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={!nombre.trim() || saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
