import { ShieldCheck, Radar, KeyRound, ArrowRight } from 'lucide-react'
import AnalysisInputPanel from '../components/analysis/AnalysisInputPanel.jsx'
import RecentAnalyses from '../components/analysis/RecentAnalyses.jsx'
import { Link } from 'react-router-dom'
import '../components/analysis/analysis.css'
import '../components/ui/ui.css'
import './pages.css'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <section className="hero-panel panel">
        <div className="hero-panel-text">
          <span className="badge hero-eyebrow">
            <span className="badge-dot" style={{ background: 'var(--accent-orange)' }} />
            Bitcoin + Nostr intelligence
          </span>
          <h2 className="hero-heading">
            Know what you're signing.
            <br />
            Know who you're trusting.
          </h2>
          <p className="hero-copy">
            Paste suspicious content. Sentinel extracts signals, correlates public evidence,
            and explains what deserves your attention — before you click, reply, or send.
          </p>
        </div>
        <div className="hero-panel-stats">
          <div className="hero-stat">
            <Radar size={16} strokeWidth={1.8} />
            <div>
              <span className="hero-stat-label">Inspects</span>
              <span className="hero-stat-value">Messages, addresses, Nostr events, URLs</span>
            </div>
          </div>
          <div className="hero-stat">
            <KeyRound size={16} strokeWidth={1.8} />
            <div>
              <span className="hero-stat-label">Requires</span>
              <span className="hero-stat-value">No seed phrase, no private key, no custody</span>
            </div>
          </div>
          <div className="hero-stat">
            <ShieldCheck size={16} strokeWidth={1.8} />
            <div>
              <span className="hero-stat-label">Output</span>
              <span className="hero-stat-value">Advisory signal, not financial proof</span>
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="dashboard-section-label">Run an analysis</div>
          <AnalysisInputPanel showDemoButton showPrivacyWarning />
        </div>

        <div className="dashboard-side">
          <RecentAnalyses />

          <Link to="/privacy" className="panel privacy-teaser">
            <div className="privacy-teaser-icon">
              <ShieldCheck size={17} strokeWidth={1.8} />
            </div>
            <div className="privacy-teaser-text">
              <span className="privacy-teaser-title">Privacy-first by design</span>
              <span className="privacy-teaser-copy">
                No wallet connection. No custody. Only public on-chain and Nostr data is read.
              </span>
            </div>
            <ArrowRight size={15} strokeWidth={1.8} className="privacy-teaser-arrow" />
          </Link>
        </div>
      </div>
    </div>
  )
}
