import { FileText, Wallet, Radio, Link2, Bot } from 'lucide-react'
import AnalysisInputPanel from '../components/analysis/AnalysisInputPanel.jsx'
import '../components/analysis/analysis.css'
import './pages.css'

const INSPECT_ITEMS = [
  {
    icon: FileText,
    title: 'Language patterns',
    copy: 'Urgency cues, impersonation phrasing, and social-engineering structure in messages.',
  },
  {
    icon: Wallet,
    title: 'Bitcoin addresses',
    copy: 'Address format, reuse patterns, and any addresses embedded inside the input.',
  },
  {
    icon: Radio,
    title: 'Nostr identity',
    copy: 'Event structure, signature presence, and pubkey/npub consistency.',
  },
  {
    icon: Link2,
    title: 'URLs & domains',
    copy: 'Domain age signals, redirect chains, and lookalike-domain patterns.',
  },
]

export default function Analyze() {
  return (
    <div className="analyze-page">
      <div className="analyze-layout">
        <div className="analyze-main">
          <AnalysisInputPanel showSampleButton showPrivacyWarning />
        </div>

        <aside className="analyze-side panel">
          <div className="section-panel-header">
            <h3 className="section-panel-title">
              <Bot size={16} strokeWidth={1.8} />
              What we inspect
            </h3>
          </div>
          <div className="inspect-list">
            {INSPECT_ITEMS.map(({ icon: Icon, title, copy }) => (
              <div className="inspect-item" key={title}>
                <Icon size={15} strokeWidth={1.8} />
                <div>
                  <span className="inspect-item-title">{title}</span>
                  <p className="inspect-item-copy">{copy}</p>
                </div>
              </div>
            ))}
          </div>
          <hr className="divider" style={{ margin: '16px 0' }} />
          <p className="analyze-side-footnote">
            Only public, already-visible data is read. Sentinel never requests a seed phrase,
            private key, or wallet connection.
          </p>
        </aside>
      </div>
    </div>
  )
}
