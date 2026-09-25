import { useState } from 'react'
import { ShieldAlert, Signature, ArrowRight } from 'lucide-react'
import EmptyPlaceholder from '../components/ui/EmptyPlaceholder.jsx'
import '../components/ui/ui.css'
import './pages.css'

const FIELDS = [
  { id: 'asset', label: 'What asset is moving' },
  { id: 'from', label: 'From what address / account' },
  { id: 'to', label: 'To what address / account' },
  { id: 'amount', label: 'Amount' },
  { id: 'fee', label: 'Network fee' },
]

export default function ExplainBeforeSign() {
  const [raw, setRaw] = useState('')
  const trimmed = raw.trim()

  return (
    <div className="sign-page">
      <div className="warning-banner">
        <ShieldAlert size={18} strokeWidth={1.8} />
        <div>
          <strong>Never enter your seed phrase or private key.</strong>
          <span> Sentinel only reads transaction details you paste — it cannot and will not ask for key material.</span>
        </div>
      </div>

      <div className="sign-layout">
        <div className="panel sign-input-panel">
          <div className="section-panel-header">
            <h3 className="section-panel-title">
              <Signature size={16} strokeWidth={1.8} />
              Paste transaction details
            </h3>
          </div>
          <p className="sign-input-hint">
            Paste a raw transaction, PSBT, invoice, or a plain description of what you're
            about to approve. Sentinel will break down what it actually authorizes.
          </p>
          <textarea
            className="input-console-textarea mono sign-textarea"
            placeholder="Paste transaction hex, PSBT, BIP-21 URI, or a description of the request…"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={10}
          />
          <button className="btn btn-primary btn-block sign-submit" disabled={!trimmed}>
            Explain this transaction
            <ArrowRight size={15} strokeWidth={2} />
          </button>
        </div>

        <div className="sign-breakdown">
          {FIELDS.map((f) => (
            <div className="section-panel sign-field" key={f.id}>
              <span className="sign-field-label">{f.label}</span>
              <EmptyPlaceholder label="Pending" />
            </div>
          ))}

          <div className="section-panel sign-field sign-field--wide">
            <span className="sign-field-label">Suspicious characteristics</span>
            <EmptyPlaceholder label="No transaction submitted yet" />
          </div>

          <div className="section-panel sign-field sign-field--wide">
            <span className="sign-field-label">What you are actually authorizing</span>
            <EmptyPlaceholder label="Plain-language explanation will appear here" />
          </div>
        </div>
      </div>
    </div>
  )
}
