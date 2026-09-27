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
  Info,
} from 'lucide-react'
import ScoreDial from '../components/ui/ScoreDial.jsx'
import RiskBadge from '../components/ui/RiskBadge.jsx'
import EmptyPlaceholder from '../components/ui/EmptyPlaceholder.jsx'
import FindingsList from '../components/analysis/FindingsList.jsx'
import ExtractedList from '../components/analysis/ExtractedList.jsx'
import SignalChips from '../components/analysis/SignalChips.jsx'
import AiExplanation from '../components/analysis/AiExplanation.jsx'
import { MOCK_HISTORY } from '../data/mockHistory.js'
import { formatTimestamp, inputTypeMeta, scoreToLevel } from '../utils/constants.js'
import { getStoredAnalysis } from '../utils/sessionStore.js'
import '../components/ui/ui.css'
import '../components/analysis/analysis.css'
import './pages.css'

export default function AnalysisResult() {
  const { id } = useParams()

  // A live analysis produced by the local engine this session takes
  // priority. Older sample records from the History page fall back to the
  // Phase 1 placeholder layout. Anything else is genuinely un-analyzed.
  const live = getStoredAnalysis(id)
  const record = live ? null : MOCK_HISTORY.find((h) => h.id === id) || null

  if (live) return <LiveResult analysis={live} />
  if (record) return <MockResult record={record} />
  return <EmptyResult />
}

function ResultShell({ children }) {
  return (
    <div className="result-page">
      <Link to="/analyze" className="result-back">
        <ArrowLeft size={14} strokeWidth={2} />
        New analysis
      </Link>
      {children}
    </div>
  )
}

function LiveResult({ analysis }) {
  const { input_type, signals, extracted, local_score, findings, meta, analysis_source } = analysis
  const typeMeta = inputTypeMeta(input_type)
  const level = scoreToLevel(local_score)
  const viaBackend = analysis_source === 'backend'

  return (
    <ResultShell>
      <div className="panel result-header">
        <div className="result-header-left">
          <ScoreDial score={local_score} />
        </div>
        <div className="result-header-body">
          <div className="result-header-top">
            <RiskBadge level={level} score={local_score} />
            <span className="result-header-type mono">
              <typeMeta.icon size={13} strokeWidth={1.8} />
              {typeMeta.label}
            </span>
          </div>
          <h2 className="result-header-title mono">
            {meta.raw_input_preview || '(empty input)'}
          </h2>
          <p className="result-header-meta">
            Analyzed {viaBackend ? 'via backend' : 'locally in your browser'} {formatTimestamp(meta.analyzed_at)} · {findings.length} finding
            {findings.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>


      <div className="local-only-notice">
        <Info size={14} strokeWidth={1.8} />
        <span>
          This is a local, heuristic analysis — evidence and pattern matches only. It does not
          check the blockchain and has not been reviewed by an AI model yet.
        </span>
      </div>

      {signals.length > 0 && (
        <div className="section-panel">
          <div className="section-panel-header">
            <h3 className="section-panel-title">
              <ListChecks size={16} strokeWidth={1.8} />
              Detected signals
            </h3>
          </div>
          <SignalChips signals={signals} />
        </div>
      )}

      <div className="result-grid">
        <ResultSection icon={ScrollText} title="Findings" className="result-span-2">
          <FindingsList findings={findings} />
        </ResultSection>

        <ResultSection icon={Wallet} title="Extracted Bitcoin addresses">
          <ExtractedList items={extracted.bitcoin_addresses} emptyLabel="No addresses extracted" />
        </ResultSection>

        <ResultSection icon={Link2} title="URLs">
          <ExtractedList items={extracted.urls} emptyLabel="No URLs extracted" />
        </ResultSection>

        <ResultSection icon={Radio} title="Nostr identity">
          <ExtractedList items={extracted.nostr_pubkeys} emptyLabel="No Nostr identity detected" />
        </ResultSection>

        <ResultSection icon={ArrowRightLeft} title="Transaction signals">
          <EmptyPlaceholder label="On-chain transaction correlation arrives in a later phase" />
        </ResultSection>

        <ResultSection icon={Sparkles} title="AI explanation" className="result-span-2">
          <AiExplanation inputType={input_type} localScore={local_score} findings={findings} />
        </ResultSection>

        <ResultSection icon={FileSearch} title="Recommended next steps" className="result-span-2">
          <RecommendedSteps level={level} signals={signals} />
        </ResultSection>
      </div>
    </ResultShell>
  )
}

function RecommendedSteps({ level, signals }) {
  const steps = []
  if (signals.includes('seed_phrase_request') || signals.includes('private_key_request')) {
    steps.push('Never share a seed phrase or private key with anyone, under any circumstance — no legitimate support request needs it.')
  }
  if (signals.includes('send_funds_request') || signals.includes('funds_request_with_address')) {
    steps.push('Do not send funds based on this message alone. Verify the request through an official channel you looked up yourself.')
  }
  if (signals.includes('impersonation_indicator')) {
    steps.push('Contact the organization directly through its official site or app — not through the contact method this message provided.')
  }
  if (signals.includes('url_brand_lookalike') || signals.includes('url_shortener') || signals.includes('url_ip_host')) {
    steps.push('Avoid clicking the link. If you need the real site, type the known address in directly rather than following this one.')
  }
  if (steps.length === 0) {
    steps.push(
      level === 'safe'
        ? 'No high-risk local signals were found. This is not a guarantee of safety — stay cautious with any request involving funds or credentials.'
        : 'Review the findings above before acting, and verify any request through a channel you trust independently of this input.'
    )
  }
  return (
    <ul className="steps-list">
      {steps.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ul>
  )
}

function MockResult({ record }) {
  const typeMeta = inputTypeMeta(record.inputType)
  return (
    <ResultShell>
      <div className="panel result-header">
        <div className="result-header-left">
          <ScoreDial score={record.riskScore} />
        </div>
        <div className="result-header-body">
          <div className="result-header-top">
            <RiskBadge level={record.riskLevel} score={record.riskScore} />
            <span className="result-header-type mono">
              <typeMeta.icon size={13} strokeWidth={1.8} />
              {typeMeta.label}
            </span>
          </div>
          <h2 className="result-header-title mono">{record.label}</h2>
          <p className="result-header-meta">
            Analyzed {formatTimestamp(record.timestamp)} · id {record.id} · sample record from History
          </p>
        </div>
      </div>

      <div className="result-grid">
        <ResultSection icon={ScrollText} title="Summary">
          <p>
            This is a sample record from before this session — its detailed findings were not
            kept. Run a new analysis to see full local evidence and findings.
          </p>
        </ResultSection>
        <ResultSection icon={FileSearch} title="Evidence">
          <EmptyPlaceholder label="Not available for sample records" />
        </ResultSection>
      </div>
    </ResultShell>
  )
}

function EmptyResult() {
  return (
    <ResultShell>
      <div className="panel result-header">
        <div className="result-header-left">
          <ScoreDial score={null} />
        </div>
        <div className="result-header-body">
          <span className="badge">
            <span className="badge-dot" style={{ background: 'var(--text-tertiary)' }} />
            Awaiting analysis
          </span>
          <h2 className="result-header-title mono">This input has not been analyzed yet</h2>
          <p className="result-header-meta">
            Results only exist for the current browser session. Run a new analysis to see one here.
          </p>
        </div>
      </div>
    </ResultShell>
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
