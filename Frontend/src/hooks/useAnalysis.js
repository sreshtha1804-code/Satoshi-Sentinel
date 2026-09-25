import { useState, useCallback } from 'react'
import { submitAnalysis } from '../services/api.js'

// Placeholder hook for running an analysis against the backend.
// Not wired into any page yet — Phase 1 is UI-only. Once the FastAPI
// backend exists, pages can call `run()` instead of navigating straight
// to the result shell.
export function useAnalysis() {
  const [status, setStatus] = useState('idle') // idle | loading | error | success
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const run = useCallback(async (input) => {
    setStatus('loading')
    setError(null)
    try {
      const data = await submitAnalysis(input)
      setResult(data)
      setStatus('success')
      return data
    } catch (err) {
      setError(err)
      setStatus('error')
      throw err
    }
  }, [])

  return { run, status, error, result }
}
