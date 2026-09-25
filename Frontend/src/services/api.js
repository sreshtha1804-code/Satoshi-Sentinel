// Placeholder API client for the Satoshi Sentinel backend.
// The FastAPI backend does not exist yet in this phase, so nothing here
// performs a real network call. This file exists so pages and hooks have
// a stable import path to wire up once the backend ships.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Will POST the raw input + type to the backend analysis endpoint.
 * Not implemented in Phase 1 — throws so it fails loudly instead of
 * silently pretending to analyze something.
 */
export async function submitAnalysis(/* { type, content } */) {
  throw new Error(
    'submitAnalysis() is not implemented yet — backend analysis ships in a later phase.'
  )
}

/**
 * Will GET a single analysis result by id.
 * Not implemented in Phase 1.
 */
export async function getAnalysis(/* id */) {
  throw new Error(
    'getAnalysis() is not implemented yet — backend analysis ships in a later phase.'
  )
}

export { BASE_URL }
