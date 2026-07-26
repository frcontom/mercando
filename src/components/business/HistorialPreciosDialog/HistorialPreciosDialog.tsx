import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { historialPreciosService } from '@/services'
import type { HistorialPrecio } from '@/models'
import { formatCurrency } from '@/core/utils/formatters'

interface HistorialPreciosDialogProps {
  open: boolean
  productoNombre: string
  productoId: string
  onClose: () => void
}

export function HistorialPreciosDialog({ open, productoNombre, productoId, onClose }: HistorialPreciosDialogProps) {
  const [items, setItems] = useState<HistorialPrecio[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && productoId) {
      setLoading(true)
      historialPreciosService.obtenerHistorial(productoId).then(setItems).finally(() => setLoading(false))
    }
  }, [open, productoId])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Historial de precios</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {productoNombre}
        </Typography>
        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState message="Sin historial de precios" />
        ) : (
          <List dense>
            {items.map(h => (
              <ListItem key={h.id}>
                <ListItemText
                  primary={formatCurrency(h.precio)}
                  secondary={new Date(h.fecha).toLocaleDateString()}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
