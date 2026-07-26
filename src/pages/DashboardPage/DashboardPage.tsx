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
import { formatCurrency } from '@/core/utils/formatters'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
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
function totalTienda(mtId: string) {
  return getProductosFromTienda(mtId).reduce((s, p) => s + (p.subtotal ?? p.precio * qtyParaTotal(p)), 0)
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{activo.nombre}</Typography>
            <Chip label="Activo" size="small" color="success" />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            {new Date(activo.fecha).toLocaleDateString()}
          </Typography>

          {mercadoTiendas.value.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
              Sin tiendas asignadas
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <Card onClick={() => navigate(`/mercados/${activo.id}?tienda=__todas__`)} sx={{ cursor: 'pointer', mb: 1.5, '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}>
                <CardContent sx={{ pb: '12px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontSize: 28, opacity: 0.5 }}>📋</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Todas las tiendas</Typography>
                      <Typography variant="caption" color="text.secondary">{encontradosGlobal}/{todosProductos.length} · {formatCurrency(totalEncontrados)} / {formatCurrency(totalGlobal)}</Typography>
                      <LinearProgress variant="determinate" value={todosProductos.length > 0 ? (encontradosGlobal / todosProductos.length) * 100 : 0} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              {mercadoTiendas.value.map(mt => {
                const prods = getProductosFromTienda(mt.id)
                const encontrados = prods.filter(p => p.estado === 'encontrado').length
                return (
                  <Card
                    key={mt.id}
                    onClick={() => navigate(`/mercados/${activo.id}?tienda=${mt.id}`)}
                    sx={{ cursor: 'pointer', mb: 1.5, '&:active': { transform: 'scale(0.98)' }, transition: 'transform 0.15s ease' }}
                  >
                    <CardContent sx={{ pb: '12px !important' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontSize: 28 }}>{mt.tienda?.icono}</Typography>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{mt.tienda?.nombre}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {encontrados}/{prods.length} · {formatCurrency(totalTienda(mt.id))}
                          </Typography>
                          <LinearProgress variant="determinate" value={prods.length > 0 ? (encontrados / prods.length) * 100 : 0} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )
              })}
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
