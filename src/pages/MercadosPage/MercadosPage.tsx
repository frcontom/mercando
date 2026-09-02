import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import { mercados as mercadosSignal, loadingMercados, loadMercados, showSnackbar } from '@/store'
import { mercadoCategorias, loadMercadoCategorias } from '@/store'
import { loadProductosByCategoria, getProductosByCategoria } from '@/store'
import { useSignalValue } from '@/hooks/useSignalValue'
import { mercadosService } from '@/services'
import type { Mercado, MercadoEstado, CreateMercadoDto, UpdateMercadoDto } from '@/models'
import { MercadoFormDialog } from '@/components/business/MercadoFormDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrency } from '@/core/utils/formatters'

const estadoColors: Record<MercadoEstado, 'success' | 'default'> = {
  activo: 'success',
  inactivo: 'default',
}

const nextEstado: Record<MercadoEstado, MercadoEstado> = {
  activo: 'inactivo',
  inactivo: 'activo',
}

function getProductos(mcatId: string) { return getProductosByCategoria(mcatId) }

export default function MercadosPage() {
  const navigate = useNavigate()
  const items = useSignalValue(mercadosSignal)
  const isLoading = useSignalValue(loadingMercados)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Mercado | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Mercado | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)

  useEffect(() => { loadMercados() }, [])

  useEffect(() => {
    if (items.length > 0) {
      (async () => {
        for (const m of items) {
          await loadMercadoCategorias(m.id)
          for (const mc of mercadoCategorias.value) await loadProductosByCategoria(mc.id)
        }
      })()
    }
  }, [items.length])

  function statsFor(mercadoId: string) {
    const cats = mercadoCategorias.value.filter(c => c.mercado_id === mercadoId)
    const prods = cats.flatMap(c => getProductos(c.id))
    const enc = prods.filter(p => p.estado === 'encontrado').length
    const gastado = prods.filter(p => p.estado === 'encontrado').reduce((s, p) => s + (p.subtotal ?? p.precio * (p.cantidad_encontrada > 0 ? p.cantidad_encontrada : p.cantidad)), 0)
    const pct = prods.length > 0 ? (enc / prods.length) * 100 : 0
    return { cats: cats.length, prods: prods.length, enc, gastado, pct }
  }

  async function handleSave(data: CreateMercadoDto | UpdateMercadoDto) {
    try {
      if (editing) {
        await mercadosService.update(editing.id, data as UpdateMercadoDto)
        showSnackbar('Mercado actualizado')
      } else {
        await mercadosService.create(data as CreateMercadoDto)
        showSnackbar('Mercado creado')
      }
      await loadMercados()
    } catch { showSnackbar('Error al guardar el mercado') }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try { await mercadosService.delete(deleteTarget.id); showSnackbar('Mercado eliminado'); await loadMercados() }
    catch { showSnackbar('Error al eliminar') }
    finally { setDeleteTarget(null) }
  }

  async function toggleEstado(m: Mercado) {
    try { const nuevo = nextEstado[m.estado]; await mercadosService.update(m.id, { estado: nuevo }); showSnackbar(`Mercado "${nuevo}"`); await loadMercados() }
    catch { showSnackbar('Error al cambiar estado') }
  }

  function openCreate() { setEditing(null); setFormOpen(true) }

  if (isLoading) return <LoadingSpinner />

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Crear mercado</Button>
        <Button variant="outlined" color="error" onClick={() => setDeleteAllOpen(true)} sx={{ minWidth: 44, px: 1 }}><DeleteIcon /></Button>
      </Box>
      {items.length === 0 ? (
        <EmptyState message="No hay mercados aún" />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map(m => {
            const s = statsFor(m.id)
            const activo = m.estado === 'activo'
            return (
              <Card
                key={m.id}
                onClick={() => navigate(`/mercados/${m.id}?edit=1`)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  border: activo ? '1px solid rgba(105,240,174,0.15)' : '1px solid rgba(255,255,255,0.04)',
                  bgcolor: activo ? 'rgba(105,240,174,0.02)' : 'rgba(255,255,255,0.015)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': activo ? { content: '""', position: 'absolute', top: '-60%', right: '-20%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(105,240,174,0.06) 0%, transparent 70%)' } : undefined,
                  '&:active': { transform: 'scale(0.98)' }, transition: 'all 0.2s ease',
                }}
              >
                <CardContent sx={{ pb: '16px !important', position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{m.nombre}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{new Date(m.fecha).toLocaleDateString()}</Typography>
                    </Box>
                    <Chip label={m.estado} color={estadoColors[m.estado]} size="small" onClick={e => { e.stopPropagation(); toggleEstado(m) }} sx={{ cursor: 'pointer', height: 22, '& .MuiChip-label': { px: 1, fontSize: '0.65rem' } }} />
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>Progreso</Typography>
                      <Typography variant="caption" sx={{ color: '#69f0ae', fontWeight: 600, fontSize: '0.6rem' }}>{s.enc}/{s.prods} productos</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={s.pct} sx={{ height: 5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)' }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: s.gastado > 0 ? '#69f0ae' : 'rgba(255,255,255,0.2)' }}>{formatCurrency(s.gastado)}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>Gastado</Typography>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{s.cats}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>Categorías</Typography>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{s.prods}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>Productos</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); setEditing(m); setFormOpen(true) }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); setDeleteTarget(m) }}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      )}

      <MercadoFormDialog open={formOpen} mercado={editing} onSave={handleSave} onClose={() => { setFormOpen(false); setEditing(null) }} />

      <ConfirmDialog open={deleteTarget !== null} title="Eliminar mercado" message={`¿Eliminar "${deleteTarget?.nombre}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      <ConfirmDialog open={deleteAllOpen} title="Borrar todos los mercados" message="¿Eliminar todos los mercados y sus productos asociados? Esta acción no se puede deshacer." onConfirm={async () => { try { await mercadosService.deleteAll(); showSnackbar('Mercados eliminados'); await loadMercados() } catch { showSnackbar('Error al eliminar') } finally { setDeleteAllOpen(false) } }} onCancel={() => setDeleteAllOpen(false)} />
    </Box>
  )
}