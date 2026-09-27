// Frontend API client for the Satoshi Sentinel FastAPI backend.
//
// The frontend never re-implements analysis logic against the backend's
// data — it either gets a result from the backend, or falls back to the
// local browser-side engine (services/signalEngine.js). This file is the
// only place that knows how to reach the backend, how long to wait for
// it, and how to tell "backend down" apart from "backend said no".

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const DEFAULT_TIMEOUT_MS = 4000

export class ApiTimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message)
    this.name = 'ApiTimeoutError'
  }
}

export class ApiUnavailableError extends Error {
  constructor(message = 'Backend is unavailable') {
    super(message)
    this.name = 'ApiUnavailableError'
  }
}

export class ApiHttpError extends Error {
  constructor(status, detail) {
    super(detail || `Request failed with status ${status}`)
    this.name = 'ApiHttpError'
    this.status = status
    this.detail = detail
  }
}

async function request(path, { method = 'GET', body, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiTimeoutError(`Request to ${path} timed out after ${timeoutMs}ms`)
    }
    // fetch rejects with a plain TypeError for network failures (backend
    // not running, DNS failure, CORS block, etc.) — normalize it.
    throw new ApiUnavailableError(`Could not reach the backend at ${BASE_URL}`)
  } finally {
    clearTimeout(timer)
  }

  let payload = null
  const text = await response.text()
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const detail = payload && typeof payload.detail === 'string' ? payload.detail : null
    throw new ApiHttpError(response.status, detail)
  }

  // An empty-but-ok response is treated as unavailable data, not a crash.
  if (payload === null) {
    throw new ApiUnavailableError('Backend returned an empty response')
  }

  return payload
}

/**
 * Quick reachability check. Never throws — returns a plain boolean so
 * callers can show a status indicator without try/catch boilerplate.
 */
export async function checkBackendHealth(timeoutMs = 2000) {
  try {
    const data = await request('/api/health', { timeoutMs })
    return data.status === 'ok'
  } catch {
    return false
  }
}

/**
 * Run analysis on the backend. Throws ApiTimeoutError, ApiUnavailableError,
 * or ApiHttpError (e.g. 400 when the security gate rejects key material) —
 * callers decide what to do with each.
 */
export async function analyzeOnBackend(type, content, { timeoutMs } = {}) {
  return request('/api/analyze', {
    method: 'POST',
    body: { type, content },
    timeoutMs,
  })
}

/**
 * Ask the backend for a plain-language explanation of an already-computed
 * analysis. Falls under the same error types as analyzeOnBackend.
 */
export async function explainOnBackend(inputType, localScore, findings, { timeoutMs } = {}) {
  return request('/api/ai/explain', {
    method: 'POST',
    body: { input_type: inputType, local_score: localScore, findings },
    timeoutMs,
  })
}

/** Public Bitcoin address lookup (structural + best-effort public data). */
export async function getBitcoinAddress(address, { timeoutMs } = {}) {
  return request(`/api/bitcoin/address/${encodeURIComponent(address)}`, { timeoutMs })
}

/** Public Bitcoin transaction lookup (best-effort public data). */
export async function getBitcoinTransaction(txid, { timeoutMs } = {}) {
  return request(`/api/bitcoin/transaction/${encodeURIComponent(txid)}`, { timeoutMs })
}

/** Public Nostr profile lookup via relay (hex pubkey or npub). */
export async function getNostrProfile(pubkey, { timeoutMs } = {}) {
  return request(`/api/nostr/profile/${encodeURIComponent(pubkey)}`, { timeoutMs })
}

export { BASE_URL }
