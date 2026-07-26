import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

interface ProductoBulkDialogProps {
  open: boolean
  categoriaNombre: string
  onSave: (nombres: string[]) => Promise<void>
  onClose: () => void
}

export function ProductoBulkDialog({ open, categoriaNombre, onSave, onClose }: ProductoBulkDialogProps) {
  const [texto, setTexto] = useState('')
  const [saving, setSaving] = useState(false)

  const lineas = texto.split('\n').map(l => l.trim()).filter(Boolean)

  async function handleSave() {
    if (lineas.length === 0) return
    setSaving(true)
    try {
      await onSave(lineas)
      onClose()
      setTexto('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Crear productos masivo</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Categoría: <strong>{categoriaNombre}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Escribe un nombre por línea
        </Typography>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={6}
          maxRows={12}
          placeholder={`Arroz\nFrijoles\nAceite\nAzúcar\nSal`}
          value={texto}
          onChange={e => setTexto(e.target.value)}
        />
        {lineas.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {lineas.length} producto(s) listos para crear
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={lineas.length === 0 || saving}>
          {saving ? 'Creando...' : `Crear ${lineas.length} producto(s)`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
