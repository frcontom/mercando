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
import { LABEL_ESTADOS } from '@/core/constants/estados'
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
          {/* Wallet card */}
          <Card
            onClick={() => navigate(`/mercados/${activo.id}`)}
            sx={{
              cursor: 'pointer',
              mb: 3,
              background: 'linear-gradient(135deg, #1a1a3e 0%, #1a1a2e 100%)',
              border: '1px solid rgba(144, 202, 249, 0.15)',
              '&:active': { transform: 'scale(0.98)' },
              transition: 'transform 0.15s ease',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{activo.nombre}</Typography>
                <Chip label="Activo" size="small" color="success" />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                {new Date(activo.fecha).toLocaleDateString()}
              </Typography>
              <Box sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Progreso</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#69f0ae' }}>
                    {encontradosGlobal}/{todosProductos.length} · {formatCurrency(totalEncontrados)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={todosProductos.length > 0 ? (encontradosGlobal / todosProductos.length) * 100 : 0}
                  sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.06)' }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#69f0ae', lineHeight: 1.2 }}>
                    {formatCurrency(totalEncontrados)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Gastado</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#90caf9', lineHeight: 1.2 }}>
                    {formatCurrency(totalGlobal)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Presupuesto</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Store tiles */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
            Tiendas
          </Typography>
          {mercadoTiendas.value.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
              Sin tiendas asignadas
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1.5, mb: 3 }}>
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
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1,
                      '&:active': { transform: 'scale(0.95)' },
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <StoreIcon tienda={mt.tienda} size={36} />
                    <Box sx={{ height: 4 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'center', lineHeight: 1.2, fontSize: '0.65rem' }}>
                      {mt.tienda?.nombre}
                    </Typography>
                    <Typography variant="caption" color={enc === prods.length && prods.length > 0 ? 'success.main' : 'text.secondary'} sx={{ fontSize: '0.6rem' }}>
                      {enc}/{prods.length} · {formatCurrency(total)}
                    </Typography>
                  </Card>
                )
              })}
            </Box>
          )}

          {/* Timeline */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
            Últimos movimientos
          </Typography>
          {todosProductos.filter(p => p.estado !== 'pendiente').length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
              Aún no has marcado productos
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {todosProductos
                .filter(p => p.estado !== 'pendiente' && p.created_at)
                .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
                .slice(0, 8)
                .map(mp => {
                  const diff = Date.now() - new Date(mp.created_at ?? Date.now()).getTime()
                  const mins = Math.floor(diff / 60000)
                  const time = mins < 1 ? 'Ahora' : mins < 60 ? `Hace ${mins}min` : `Hace ${Math.floor(mins / 60)}h`
                  return (
                    <Box key={mp.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: mp.estado === 'encontrado' ? '#69f0ae' : '#ff9800', flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {mp.producto?.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {mp.cantidad_encontrada || mp.cantidad} {mp.producto?.unidad} · {LABEL_ESTADOS[mp.estado]}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                        {time}
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
