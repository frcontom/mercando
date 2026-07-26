import { useState, useRef, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  function handleTouchStart(e: React.TouchEvent) {
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (refreshing || startY.current === 0) return
    const dy = e.touches[0].clientY - startY.current
    if (dy > 0) setPulling(Math.min(dy * 0.4, 80))
  }

  async function handleTouchEnd() {
    if (pulling > 50 && !refreshing) {
      setRefreshing(true)
      setPulling(0)
      try { await onRefresh() } catch { /* ignore */ }
      setRefreshing(false)
    } else {
      setPulling(0)
    }
    startY.current = 0
  }

  return (
    <Box
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{ height: '100%', overflow: 'auto', position: 'relative' }}
    >
      {(pulling > 0 || refreshing) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, transition: 'height 0.2s', height: refreshing ? 40 : pulling }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {children}
    </Box>
  )
}
