import { SEVERITY_META } from '../../utils/constants.js'
import EmptyPlaceholder from '../ui/EmptyPlaceholder.jsx'

export default function FindingsList({ findings = [] }) {
  if (findings.length === 0) {
    return <EmptyPlaceholder label="No findings for this input" />
  }

  // High severity first, then medium, then low — most actionable up top.
  const order = { high: 0, medium: 1, low: 2 }
  const sorted = [...findings].sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3))

  return (
    <div className="findings-list">
      {sorted.map((f, i) => {
        const meta = SEVERITY_META[f.severity] || SEVERITY_META.low
        return (
          <div className="finding-card" key={`${f.type}-${i}`} style={{ borderLeftColor: meta.color }}>
            <div className="finding-card-head">
              <span className="finding-severity" style={{ color: meta.color, background: meta.wash, borderColor: meta.border }}>
                {meta.label}
              </span>
              <span className="finding-title">{f.title}</span>
            </div>
            <p className="finding-description">{f.description}</p>
            {f.evidence && (
              <div className="finding-evidence">
                <span className="finding-evidence-label">Observed</span>
                <span className="finding-evidence-text mono">{f.evidence}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
