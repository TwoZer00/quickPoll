import { useState, useEffect } from 'react'

const POLL_INTERVAL = 60_000

export default function useServiceStatus () {
  const url = import.meta.env.VITE_UPTIME_KUMA_URL
  const [status, setStatus] = useState(null) // null | 'up' | 'down'

  useEffect(() => {
    if (!url) return

    const check = async () => {
      try {
        const res = await fetch(url)
        if (!res.ok) { setStatus('down'); return }
        const data = await res.json()
        const beats = Object.values(data.heartbeatList ?? {}).flat()
        const last = beats.at(-1)
        setStatus(last?.status === 1 ? 'up' : 'down')
      } catch (e) {
        console.warn('[useServiceStatus]', e.message)
        setStatus(null)
      }
    }

    check()
    const id = setInterval(check, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [url])

  return status
}
