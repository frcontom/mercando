import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import { mercados, loadMercados } from '@/store'
import { mercadoTiendas, loadMercadoTiendas } from '@/store'
import { mercadoTiendaCategorias, loadCategoriasByTienda, getCategoriasByTienda } from '@/store'
import { loadProductosByCategoria, getProductosByCategoria } from '@/store'
import { refreshHandler } from '@/store'
import { formatCurrency } from '@/core/utils/formatters'

import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreIcon } from '@/components/business/StoreIcon'
import type { MercadoProducto } from '@/models'

function getCategorias(mtId: string) { return getCategoriasByTienda(mtId) }
function getProductos(mtcId: string) { return getProductosByCategoria(mtcId) }
function getProductosFromTienda(mtId: string) {
  const order = { pendiente: 0, encontrado: 1, no_habia: 2 }
  return getCategorias(mtId).flatMap(c => getProductos(c.id))
    .sort((a, b) => (order[a.estado] ?? 0) - (order[b.estado] ?? 0))
}
function qtyParaTotal(mp: MercadoProducto) {
  return mp.estado !== 'pendiente' && mp.cantidad_encontrada > 0 ? mp.cantidad_encontrada : mp.cantidad
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        await loadMercados()
        const activo = mercados.value.find(m => m.estado === 'activo')
        if (activo) {
          await loadMercadoTiendas(activo.id)
          for (const mt of mercadoTiendas.value) await loadCategoriasByTienda(mt.id)
          for (const cats of Object.values(mercadoTiendaCategorias.value).flat()) await loadProductosByCategoria(cats.id)
        }
      } catch (e) { console.error(e) }
      setLoading(false)
    })()
    refreshHandler.value = async () => {
      await loadMercados()
      const a = mercados.value.find(m => m.estado === 'activo')
      if (a) {
        await loadMercadoTiendas(a.id)
        for (const mt of mercadoTiendas.value) await loadCategoriasByTienda(mt.id)
        for (const cats of Object.values(mercadoTiendaCategorias.value).flat()) await loadProductosByCategoria(cats.id)
      }
    }
    return () => { refreshHandler.value = null }
  }, [])

  const activo = mercados.value.find(m => m.estado === 'activo')

  if (loading) return <LoadingSpinner />

  const todosProductos = mercadoTiendas.value.flatMap(mt => getProductosFromTienda(mt.id))
  const encontradosGlobal = todosProductos.filter(p => p.estado === 'encontrado').length
  const totalGlobal = todosProductos.reduce((s, p) => s + (p.subtotal ?? p.precio * qtyParaTotal(p)), 0)
  const totalEncontrados = todosProductos.filter(p => p.estado === 'encontrado').reduce((s, p) => s + (p.subtotal ?? p.precio * qtyParaTotal(p)), 0)
  const restante = totalGlobal - totalEncontrados
  const pct = todosProductos.length > 0 ? (encontradosGlobal / todosProductos.length) * 100 : 0

  return (
    <Box sx={{ p: 2 }}>
      {!activo ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No hay mercado activo. Crea uno desde Mercados.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main card — banking style */}
          <Card
            onClick={() => navigate(`/mercados/${activo.id}`)}
            sx={{
              cursor: 'pointer',
              mb: 3,
              background: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #1a1a3e 100%)',
              border: '1px solid rgba(144, 202, 249, 0.12)',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-30%',
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(144,202,249,0.06) 0%, transparent 70%)',
              },
              '&:active': { transform: 'scale(0.98)' },
              transition: 'transform 0.15s ease',
            }}
          >
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {activo.nombre}
                </Typography>
                <Chip label="Activo" size="small" color="success" sx={{ height: 22, '& .MuiChip-label': { px: 1, fontSize: '0.65rem' } }} />
              </Box>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', letterSpacing: 1, textTransform: 'uppercase' }}>
                  Total gastado
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.1, mt: 0.3, letterSpacing: -1 }}>
                  {formatCurrency(totalEncontrados)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem' }}>
                  de {formatCurrency(totalGlobal)} presupuestados
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>
                    Progreso
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#69f0ae', fontWeight: 600, fontSize: '0.6rem' }}>
                    {encontradosGlobal}/{todosProductos.length} productos
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)' }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
                <Box sx={{ flex: 1, bgcolor: 'rgba(105,240,174,0.06)', borderRadius: 2, p: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#69f0ae', fontWeight: 700, fontSize: '0.8rem' }}>{formatCurrency(totalEncontrados)}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block', fontSize: '0.55rem' }}>Gastado</Typography>
                </Box>
                <Box sx={{ flex: 1, bgcolor: restante > 0 ? 'rgba(255,183,77,0.06)' : 'rgba(105,240,174,0.06)', borderRadius: 2, p: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: restante > 0 ? '#ffb74d' : '#69f0ae', fontWeight: 700, fontSize: '0.8rem' }}>{formatCurrency(restante)}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block', fontSize: '0.55rem' }}>Restante</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Stores as merchants */}
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1.5, fontSize: '0.6rem' }}>
            Comercios
          </Typography>
          {mercadoTiendas.value.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
              Sin tiendas asignadas
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <Card
                onClick={() => navigate(`/mercados/${activo.id}?tienda=__todas__`)}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  border: '1px dashed rgba(255,255,255,0.08)',
                  bgcolor: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(4px)',
                  '&:active': { transform: 'scale(0.98)' },
                  transition: 'all 0.2s ease',
                }}
              >
                <Typography sx={{ fontSize: 24, opacity: 0.3 }}>📋</Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Todas las tiendas</Typography>
                  <Typography variant="caption" color="text.secondary">{encontradosGlobal}/{todosProductos.length} productos</Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#69f0ae' }}>{formatCurrency(totalEncontrados)}</Typography>
              </Card>
              {mercadoTiendas.value.map(mt => {
                const prods = getProductosFromTienda(mt.id)
                const enc = prods.filter(p => p.estado === 'encontrado').length
                const total = prods.reduce((s, p) => s + (p.subtotal ?? p.precio * qtyParaTotal(p)), 0)
                return (
                  <Card
                    key={mt.id}
                    onClick={() => navigate(`/mercados/${activo.id}?tienda=${mt.id}`)}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      px: 2,
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.04)',
                      bgcolor: 'rgba(255,255,255,0.015)',
                      '&:active': { transform: 'scale(0.98)' },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <StoreIcon tienda={mt.tienda} size={40} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{mt.tienda?.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {enc}/{prods.length}
                        {total > 0 ? ` · ${formatCurrency(total)}` : ''}
                      </Typography>
                      {prods.length > 0 && (
                        <Box sx={{ width: '100%', height: 3, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2, mt: 0.5, overflow: 'hidden' }}>
                          <Box sx={{ width: `${(enc / prods.length) * 100}%`, height: '100%', bgcolor: '#69f0ae', borderRadius: 2, transition: 'width 0.3s ease' }} />
                        </Box>
                      )}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: total > 0 ? '#69f0ae' : 'text.disabled', flexShrink: 0 }}>
                      {total > 0 ? formatCurrency(total) : '$0'}
                    </Typography>
                  </Card>
                )
              })}
            </Box>
          )}

          {/* Timeline as transactions */}
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1.5, fontSize: '0.6rem' }}>
            Últimos movimientos
          </Typography>
          {todosProductos.filter(p => p.estado !== 'pendiente').length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
              Aún no has marcado productos
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {todosProductos
                .filter(p => p.estado !== 'pendiente' && p.created_at)
                .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
                .slice(0, 8)
                .map(mp => {
                  const diff = Date.now() - new Date(mp.created_at ?? Date.now()).getTime()
                  const mins = Math.floor(diff / 60000)
                  const time = mins < 1 ? 'Ahora' : mins < 60 ? `Hace ${mins}min` : `Hace ${Math.floor(mins / 60)}h`
                  const esEncontrado = mp.estado === 'encontrado'
                  return (
                    <Box key={mp.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.6 }}>
                      <Box sx={{
                        width: 28, height: 28, borderRadius: '50%',
                        bgcolor: esEncontrado ? 'rgba(105,240,174,0.12)' : 'rgba(255,152,0,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, flexShrink: 0,
                      }}>
                        {esEncontrado ? '✅' : '🚫'}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                          {mp.producto?.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {mp.cantidad_encontrada || mp.cantidad} {mp.producto?.unidad} · {time}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{
                        fontWeight: 700,
                        color: esEncontrado && mp.precio > 0 ? '#69f0ae' : 'text.disabled',
                        flexShrink: 0,
                      }}>
                        {esEncontrado && mp.precio > 0 ? `+${formatCurrency(mp.precio * qtyParaTotal(mp))}` : '-'}
                      </Typography>
                    </Box>
                  )
                })}
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
