// A run of the local signal engine needs to travel from the Analyze page
// to the Result page. There is no backend yet, so this simply holds
// results in memory for the current browser session — nothing is written
// to disk, a database, or a server. Refreshing the page clears it, which
// is intentional for this phase.

const store = new Map()
let counter = 0

function generateId() {
  counter += 1
  const rand = Math.random().toString(36).slice(2, 8)
  return `local-${Date.now().toString(36)}-${counter}-${rand}`
}

/**
 * Store a completed analysis object and return the id it was saved under.
 */
export function saveAnalysis(analysis) {
  const id = generateId()
  store.set(id, analysis)
  return id
}

/**
 * Retrieve a previously stored analysis by id, or null if it isn't
 * present (e.g. after a page refresh, or an id that was never local).
 */
export function getStoredAnalysis(id) {
  return store.get(id) || null
}
