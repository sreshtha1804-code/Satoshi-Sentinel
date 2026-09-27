import { useCallback, useState } from 'react'
import { analyzeInput } from '../services/signalEngine.js'
import { analyzeOnBackend, ApiHttpError } from '../services/api.js'
import { checkContent } from '../utils/detectors/security.js'

export class SecurityRejectedError extends Error {
  constructor(message) {
    super(message)
    this.name = 'SecurityRejectedError'
  }
}

/**
 * Runs an analysis, preferring the FastAPI backend and transparently
 * falling back to the local in-browser engine if the backend is slow,
 * unreachable, or simply not running — this is what keeps the app fully
 * usable for a hackathon demo with zero backend setup.
 *
 * The security gate (seed phrase / private key detection) runs locally
 * FIRST, before either path, so it can never be skipped just because the
 * backend happens to be down.
 */
export function useAnalyze() {
  const [lastSource, setLastSource] = useState(null) // 'backend' | 'local'

  const run = useCallback(async (type, content) => {
    const security = checkContent(content)
    if (security.isBlocked) {
      throw new SecurityRejectedError(security.reason)
    }

    try {
      const result = await analyzeOnBackend(type, content, { timeoutMs: 3500 })
      setLastSource('backend')
      return { ...result, analysis_source: 'backend' }
    } catch (err) {
      if (err instanceof ApiHttpError && err.status === 400) {
        // The backend's own security gate caught something — surface it
        // rather than silently retrying locally.
        throw new SecurityRejectedError(err.detail || 'The backend rejected this input.')
      }
      // Backend unreachable, timed out, or errored — fall back to the
      // exact same deterministic engine running locally in the browser.
      const local = analyzeInput({ type, content })
      setLastSource('local')
      return { ...local, analysis_source: 'local' }
    }
  }, [])

  return { run, lastSource }
}
