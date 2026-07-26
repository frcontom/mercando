import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CelebrationIcon from '@mui/icons-material/Celebration'
import { formatCurrency } from '@/core/utils/formatters'

interface CompraCompletadaDialogProps {
  open: boolean
  totalGastado: number
  presupuesto: number
  encontrados: number
  total: number
  onClose: () => void
}

export function CompraCompletadaDialog({ open, totalGastado, presupuesto, total, encontrados, onClose }: CompraCompletadaDialogProps) {
  const ahorro = presupuesto - totalGastado

  function handleShare() {
    const text = `🛒 Compra completada!\n✅ ${encontrados}/${total} productos\n💰 Gastado: ${formatCurrency(totalGastado)}\n📦 Presupuesto: ${formatCurrency(presupuesto)}${ahorro > 0 ? `\n💵 Ahorro: ${formatCurrency(ahorro)}` : ''}`
    if (navigator.share) navigator.share({ title: 'Smart Market Planner', text })
    else navigator.clipboard.writeText(text)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <CelebrationIcon sx={{ fontSize: 64, color: '#ffd740', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>¡Compra completada!</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {encontrados} de {total} productos encontrados
        </Typography>
        <Box sx={{ bgcolor: 'rgba(105,240,174,0.08)', borderRadius: 3, p: 2, mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#69f0ae' }}>{formatCurrency(totalGastado)}</Typography>
          <Typography variant="caption" color="text.secondary">Total gastado</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1, bgcolor: 'action.hover', borderRadius: 2, p: 1.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>{formatCurrency(presupuesto)}</Typography>
            <Typography variant="caption" color="text.secondary">Presupuesto</Typography>
          </Box>
          <Box sx={{ flex: 1, bgcolor: ahorro >= 0 ? 'rgba(105,240,174,0.08)' : 'rgba(255,152,0,0.08)', borderRadius: 2, p: 1.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: ahorro >= 0 ? '#69f0ae' : '#ff9800' }}>
              {ahorro >= 0 ? formatCurrency(ahorro) : `-${formatCurrency(Math.abs(ahorro))}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">{ahorro >= 0 ? 'Ahorro' : 'Exceso'}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button fullWidth variant="outlined" onClick={handleShare}>
            {typeof navigator.share !== 'undefined' ? 'Compartir' : 'Copiar'}
          </Button>
          <Button fullWidth variant="contained" onClick={onClose}>Cerrar</Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
