import { useEffect, useState } from 'react'
import { checkBackendHealth } from '../services/api.js'

const POLL_INTERVAL_MS = 20000

/**
 * Tracks whether the FastAPI backend is currently reachable. Used purely
 * for a status indicator — analysis itself always works either way via
 * useAnalyze's fallback, so this never blocks anything.
 */
export function useBackendStatus() {
  const [status, setStatus] = useState('checking') // 'checking' | 'online' | 'offline'

  useEffect(() => {
    let cancelled = false

    async function poll() {
      const healthy = await checkBackendHealth(2000)
      if (!cancelled) setStatus(healthy ? 'online' : 'offline')
    }

    poll()
    const id = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return status
}
