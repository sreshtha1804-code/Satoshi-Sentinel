import { Link } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import RiskBadge from '../components/ui/RiskBadge.jsx'
import { MOCK_HISTORY } from '../data/mockHistory.js'
import { formatTimestamp, inputTypeMeta } from '../utils/constants.js'
import '../components/ui/ui.css'
import './pages.css'

export default function History() {
  return (
    <div className="history-page">
      <div className="mock-notice">
        <FlaskConical size={14} strokeWidth={1.8} />
        Sample records for interface development — not real analyses.
      </div>

      <div className="panel history-table">
        <div className="history-row history-row--head">
          <span>Input</span>
          <span>Type</span>
          <span>Timestamp</span>
          <span>Risk</span>
        </div>
        {MOCK_HISTORY.map((item) => {
          const typeMeta = inputTypeMeta(item.inputType)
          const Icon = typeMeta.icon
          return (
            <Link key={item.id} to={`/analysis/${item.id}`} className="history-row">
              <span className="history-row-label mono">{item.label}</span>
              <span className="history-row-type">
                <Icon size={14} strokeWidth={1.8} />
                {typeMeta.label}
              </span>
              <span className="text-tertiary">{formatTimestamp(item.timestamp)}</span>
              <RiskBadge level={item.riskLevel} score={item.riskScore} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
