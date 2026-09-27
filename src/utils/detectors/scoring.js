// Deterministic scoring: the same input always produces the same score,
// because the score is purely a function of the severities of the findings
// this run produced. No randomness, no external lookups.

const SEVERITY_WEIGHT = {
  high: 30,
  medium: 15,
  low: 6,
}

export function computeLocalScore(findings) {
  if (!Array.isArray(findings) || findings.length === 0) return 0
  const total = findings.reduce((sum, f) => sum + (SEVERITY_WEIGHT[f.severity] || 0), 0)
  return Math.max(0, Math.min(100, total))
}
