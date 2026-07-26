import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import type { Mercado, CreateMercadoDto, UpdateMercadoDto } from '@/models'

interface MercadoFormDialogProps {
  open: boolean
  mercado?: Mercado | null
  onSave: (data: CreateMercadoDto | UpdateMercadoDto) => Promise<void>
  onClose: () => void
}

export function MercadoFormDialog({ open, mercado, onSave, onClose }: MercadoFormDialogProps) {
  const [nombre, setNombre] = useState('')
  const [fecha, setFecha] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setNombre(mercado?.nombre ?? '')
      setFecha(mercado?.fecha ?? new Date().toISOString().split('T')[0])
      setPresupuesto(mercado?.presupuesto.toString() ?? '')
    }
  }, [open, mercado])

  async function handleSave() {
    if (!nombre.trim()) return
    setSaving(true)
    try {
      await onSave({
        nombre: nombre.trim(),
        fecha,
        presupuesto: Number(presupuesto),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{mercado ? 'Editar mercado' : 'Nuevo mercado'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />
        <TextField
          fullWidth
          type="date"
          label="Fecha"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          fullWidth
          type="number"
          label="Presupuesto"
          value={presupuesto}
          onChange={e => setPresupuesto(e.target.value)}
          slotProps={{ htmlInput: { min: 0 } }}
        />
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
