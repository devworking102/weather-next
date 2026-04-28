'use client'

import { useEffect, useRef, useState } from 'react'

export function usePullToRefresh(onRefresh: () => void | Promise<void>, threshold = 80) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef(0)
  const pullingRef = useRef(false)
  const refreshingRef = useRef(false)
  const handlerRef = useRef(onRefresh)

  useEffect(() => {
    handlerRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    function onStart(e: TouchEvent) {
      if (window.scrollY > 0 || refreshingRef.current) return
      startYRef.current = e.touches[0]!.clientY
      pullingRef.current = true
    }
    function onMove(e: TouchEvent) {
      if (!pullingRef.current) return
      const dy = e.touches[0]!.clientY - startYRef.current
      if (dy > 0) {
        setPullDistance(Math.min(dy, threshold * 1.6))
        if (dy > 10) e.preventDefault()
      }
    }
    async function onEnd() {
      if (!pullingRef.current) return
      pullingRef.current = false
      setPullDistance((d) => {
        if (d >= threshold) {
          refreshingRef.current = true
          setRefreshing(true)
          Promise.resolve(handlerRef.current()).finally(() => {
            refreshingRef.current = false
            setRefreshing(false)
          })
        }
        return 0
      })
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
    window.addEventListener('touchcancel', onEnd)
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
    }
  }, [threshold])

  return { pullDistance, refreshing }
}
