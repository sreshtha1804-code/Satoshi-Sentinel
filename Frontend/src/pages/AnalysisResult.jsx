import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  FileSearch,
  Wallet,
  Link2,
  Radio,
  ArrowRightLeft,
  Sparkles,
  ListChecks,
  ScrollText,
} from 'lucide-react'
import ScoreDial from '../components/ui/ScoreDial.jsx'
import RiskBadge from '../components/ui/RiskBadge.jsx'
import EmptyPlaceholder from '../components/ui/EmptyPlaceholder.jsx'
import { MOCK_HISTORY } from '../data/mockHistory.js'
import { formatTimestamp, inputTypeMeta } from '../utils/constants.js'
import '../components/ui/ui.css'
import './pages.css'

export default function AnalysisResult() {
  const { id } = useParams()

  // If the id matches a mock history record, show it pre-filled for layout review.
  // Any other id (e.g. "pending") renders the empty shell that real API data will fill.
  const record = MOCK_HISTORY.find((h) => h.id === id) || null
  const isMock = Boolean(record)
  const typeMeta = record ? inputTypeMeta(record.inputType) : null

  return (
    <div className="result-page">
      <Link to="/analyze" className="result-back">
        <ArrowLeft size={14} strokeWidth={2} />
        New analysis
      </Link>

      <div className="panel result-header">
        <div className="result-header-left">
          <ScoreDial score={isMock ? record.riskScore : null} />
        </div>
        <div className="result-header-body">
          <div className="result-header-top">
            {isMock ? (
              <RiskBadge level={record.riskLevel} score={record.riskScore} />
            ) : (
              <span className="badge">
                <span className="badge-dot" style={{ background: 'var(--text-tertiary)' }} />
                Awaiting analysis
              </span>
            )}
            {typeMeta && (
              <span className="result-header-type mono">
                <typeMeta.icon size={13} strokeWidth={1.8} />
                {typeMeta.label}
              </span>
            )}
          </div>
          <h2 className="result-header-title mono">
            {isMock ? record.label : 'This input has not been analyzed yet'}
          </h2>
          <p className="result-header-meta">
            {isMock
              ? `Analyzed ${formatTimestamp(record.timestamp)} · id ${record.id}`
              : 'Backend analysis is not implemented in this phase. This is the layout that live results will populate.'}
          </p>
        </div>
      </div>

      <div className="result-grid">
        <ResultSection icon={ScrollText} title="Summary">
          {isMock ? (
            <p>
              This is placeholder summary text standing in for the AI-generated explanation
              that will describe why this input received its score.
            </p>
          ) : (
            <EmptyPlaceholder label="Summary will appear once analysis runs" />
          )}
        </ResultSection>

        <ResultSection icon={FileSearch} title="Evidence">
          <EmptyPlaceholder label="Correlated public evidence will appear here" />
        </ResultSection>

        <ResultSection icon={Wallet} title="Extracted Bitcoin addresses">
          <EmptyPlaceholder label="No addresses extracted yet" />
        </ResultSection>

        <ResultSection icon={Link2} title="URLs">
          <EmptyPlaceholder label="No URLs extracted yet" />
        </ResultSection>

        <ResultSection icon={Radio} title="Nostr identity">
          <EmptyPlaceholder label="No Nostr identity detected yet" />
        </ResultSection>

        <ResultSection icon={ArrowRightLeft} title="Transaction signals">
          <EmptyPlaceholder label="No transaction signals detected yet" />
        </ResultSection>

        <ResultSection icon={Sparkles} title="AI explanation" className="result-span-2">
          <EmptyPlaceholder label="Model explanation will render here" />
        </ResultSection>

        <ResultSection icon={ListChecks} title="Recommended next steps" className="result-span-2">
          <EmptyPlaceholder label="Recommended actions will render here" />
        </ResultSection>
      </div>
    </div>
  )
}

function ResultSection({ icon: Icon, title, children, className = '' }) {
  return (
    <section className={`section-panel ${className}`}>
      <div className="section-panel-header">
        <h3 className="section-panel-title">
          <Icon size={16} strokeWidth={1.8} />
          {title}
        </h3>
      </div>
      {children}
    </section>
  )
}
