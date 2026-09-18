import { useEffect, useRef, useState, useCallback } from 'react'

const THRESHOLD = 80

export default function usePullToRefresh (onRefresh, scrollRef) {
  const startY = useRef(null)
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const pullingRef = useRef(false)

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }, [onRefresh])

  useEffect(() => {
    const el = scrollRef?.current
    if (!el) return

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) startY.current = e.touches[0].clientY
    }

    const onTouchMove = (e) => {
      if (startY.current === null) return
      const delta = e.touches[0].clientY - startY.current
      pullingRef.current = delta >= THRESHOLD && el.scrollTop === 0
      setPulling(pullingRef.current)
    }

    const onTouchEnd = async () => {
      if (pullingRef.current) {
        pullingRef.current = false
        setPulling(false)
        await handleRefresh()
      }
      startY.current = null
      setPulling(false)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [handleRefresh, scrollRef.current]) // eslint-disable-line react-hooks/exhaustive-deps

  return { refreshing, pulling }
}
