import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import type { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '@/models'

const PRESET_ICONS = ['🥩', '🥬', '🧀', '🥛', '🍞', '🐟', '🍎', '🥚', '🧃', '🧴', '🧹', '🍝', '🥫', '🧊', '🍪', '☕']

interface CategoriaFormDialogProps {
  open: boolean
  categoria?: Categoria | null
  onSave: (data: CreateCategoriaDto | UpdateCategoriaDto) => Promise<void>
  onClose: () => void
}

export function CategoriaFormDialog({ open, categoria, onSave, onClose }: CategoriaFormDialogProps) {
  const [nombre, setNombre] = useState('')
  const [icono, setIcono] = useState(PRESET_ICONS[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setNombre(categoria?.nombre ?? '')
      setIcono(categoria?.icono ?? PRESET_ICONS[0])
    }
  }, [open, categoria])

  async function handleSave() {
    if (!nombre.trim()) return
    setSaving(true)
    try {
      await onSave({ nombre: nombre.trim(), icono })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{categoria ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />
        <Box>
          <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>Icono</Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {PRESET_ICONS.map(i => (
              <Box
                key={i}
                onClick={() => setIcono(i)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  cursor: 'pointer',
                  bgcolor: icono === i ? 'action.selected' : 'action.hover',
                  transition: 'background 0.15s ease',
                }}
              >
                {i}
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
