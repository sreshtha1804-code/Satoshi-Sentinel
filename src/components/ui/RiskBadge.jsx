import { RISK_LEVELS } from '../../utils/constants.js'

export default function RiskBadge({ level, score }) {
  const meta = RISK_LEVELS[level] || RISK_LEVELS.safe
  return (
    <span
      className="risk-badge"
      style={{
        color: meta.color,
        background: meta.wash,
        borderColor: meta.border,
      }}
    >
      <span className="risk-badge-dot" style={{ background: meta.color }} />
      {meta.label}
      {typeof score === 'number' && <span className="risk-badge-score mono">{score}</span>}
    </span>
  )
}
