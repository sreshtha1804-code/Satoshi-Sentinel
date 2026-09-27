// Mirrors the deterministic local template in
// backend/app/services/ai_explain.py, so the "AI explanation" section
// still produces real, useful output when the backend is unreachable —
// never a raw error in its place.

import { scoreToLevel } from './constants.js'

const BAND_LABEL = { danger: 'HIGH', caution: 'MEDIUM', safe: 'LOW' }

export function localExplanation(inputType, localScore, findings) {
  if (!findings || findings.length === 0) {
    return "No local heuristic signals were found for this input. This is not a guarantee of safety — it means none of Sentinel's current pattern checks matched, not that the content has been independently verified."
  }

  const band = `${BAND_LABEL[scoreToLevel(localScore)]} ATTENTION`
  const high = findings.filter((f) => f.severity === 'high')
  const medium = findings.filter((f) => f.severity === 'medium')

  const parts = [
    `This ${inputType} scored in the ${band} range (${localScore}/100) based on ${findings.length} local finding${findings.length !== 1 ? 's' : ''}.`,
  ]

  if (high.length > 0) {
    const titles = high.slice(0, 3).map((f) => f.title.toLowerCase()).join(', ')
    parts.push(
      `The most significant signals were: ${titles}. These are patterns commonly associated with high-risk requests, not confirmation of intent — treat them as reasons to slow down and verify independently, not as a verdict.`
    )
  }
  if (medium.length > 0) {
    const titles = medium.slice(0, 3).map((f) => f.title.toLowerCase()).join(', ')
    parts.push(`Additional supporting signals included: ${titles}.`)
  }

  parts.push(
    "This score is a signal, not proof of fraud. Evidence and interpretation are kept separate throughout: the findings above describe what was observed; this explanation is Sentinel's local, template-based reading of that evidence."
  )

  return parts.join(' ')
}
