import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import type { Tienda, CreateTiendaDto, UpdateTiendaDto } from '@/models'

const PRESET_COLORS = ['#90caf9', '#f48fb1', '#a5d6a7', '#fff59d', '#ce93d8', '#81d4fa', '#ffab91', '#b0bec5']
const PRESET_ICONS = ['🛒', '🏪', '🛍️', '🥩', '🥬', '🧀', '🥛', '🍞', '🐟', '🍎', '🥚', '🧃', '/tiendas/d1.svg', '/tiendas/sanmateo.svg', '/tiendas/surtimax.svg']

interface TiendaFormDialogProps {
  open: boolean
  tienda?: Tienda | null
  onSave: (data: CreateTiendaDto | UpdateTiendaDto) => Promise<void>
  onClose: () => void
}

export function TiendaFormDialog({ open, tienda, onSave, onClose }: TiendaFormDialogProps) {
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [icono, setIcono] = useState(PRESET_ICONS[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setNombre(tienda?.nombre ?? '')
      setColor(tienda?.color ?? PRESET_COLORS[0])
      setIcono(tienda?.icono ?? PRESET_ICONS[0])
    }
  }, [open, tienda])

  async function handleSave() {
    if (!nombre.trim()) return
    setSaving(true)
    try {
      await onSave({ nombre: nombre.trim(), color, icono })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{tienda ? 'Editar tienda' : 'Nueva tienda'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />
        <Box sx={{ mb: 2 }}>
          <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>Color</Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {PRESET_COLORS.map(c => (
              <Box
                key={c}
                onClick={() => setColor(c)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: c,
                  cursor: 'pointer',
                  border: color === c ? '2px solid white' : '2px solid transparent',
                  transition: 'border 0.15s ease',
                }}
              />
            ))}
          </Box>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>Icono</Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {PRESET_ICONS.map(i => (
              <Box
                key={i}
                onClick={() => setIcono(i)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  cursor: 'pointer',
                  bgcolor: icono === i ? 'action.selected' : 'action.hover',
                  transition: 'background 0.15s ease',
                  overflow: 'hidden',
                }}
              >
                {i.startsWith('/') || i.startsWith('http') ? (
                  <img src={i} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  i
                )}
              </Box>
            ))}
          </Box>
        </Box>
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
