import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import RiskBadge from '../ui/RiskBadge.jsx'
import { inputTypeMeta, formatTimestamp } from '../../utils/constants.js'
import { MOCK_HISTORY } from '../../data/mockHistory.js'

export default function RecentAnalyses() {
  const recent = MOCK_HISTORY.slice(0, 4)

  return (
    <div className="panel recent-panel">
      <div className="section-panel-header">
        <h3 className="section-panel-title">Recent analyses</h3>
        <Link to="/history" className="recent-view-all">
          View all <ArrowUpRight size={13} strokeWidth={2} />
        </Link>
      </div>

      <div className="recent-list">
        {recent.map((item) => {
          const typeMeta = inputTypeMeta(item.inputType)
          const Icon = typeMeta.icon
          return (
            <Link key={item.id} to={`/analysis/${item.id}`} className="recent-row">
              <span className="recent-row-icon">
                <Icon size={14} strokeWidth={1.8} />
              </span>
              <span className="recent-row-label mono">{item.label}</span>
              <span className="recent-row-time text-tertiary">{formatTimestamp(item.timestamp)}</span>
              <RiskBadge level={item.riskLevel} score={item.riskScore} />
            </Link>
          )
        })}
      </div>
      <p className="recent-footnote">Sample records shown for interface development.</p>
    </div>
  )
}
