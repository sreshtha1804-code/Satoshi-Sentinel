import { RISK_LEVELS, scoreToLevel } from '../../utils/constants.js'

export default function ScoreDial({ score = null, size = 132 }) {
  const hasScore = typeof score === 'number'
  const level = hasScore ? scoreToLevel(score) : null
  const meta = level ? RISK_LEVELS[level] : null
  const radius = (size - 14) / 2
  const circumference = 2 * Math.PI * radius
  const pct = hasScore ? Math.min(100, Math.max(0, score)) / 100 : 0
  const dash = circumference * pct

  return (
    <div className="score-dial" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="7"
        />
        {hasScore && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={meta.color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        )}
      </svg>
      <div className="score-dial-center">
        <span className="score-dial-value mono" style={{ color: hasScore ? meta.color : 'var(--text-disabled)' }}>
          {hasScore ? score : '—'}
        </span>
        <span className="score-dial-label">{hasScore ? '/ 100' : 'pending'}</span>
      </div>
    </div>
  )
}
