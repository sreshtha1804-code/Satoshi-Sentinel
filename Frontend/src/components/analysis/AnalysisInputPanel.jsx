import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanSearch, Sparkles, ShieldAlert } from 'lucide-react'
import InputTypeTabs from './InputTypeTabs.jsx'
import { inputTypeMeta } from '../../utils/constants.js'
import { DEMO_INPUT } from '../../data/mockHistory.js'

const MAX_LENGTH = 4000

const SAMPLE_BY_TYPE = {
  message:
    'Hey, this is the wallet support team. We flagged your account for review — reply with your seed phrase to avoid a 24h suspension.',
  address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  nostr: 'npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6',
  url: 'https://wallet-recovery-help.net/verify',
}

export default function AnalysisInputPanel({
  showDemoButton = false,
  showSampleButton = false,
  showPrivacyWarning = false,
  compact = false,
}) {
  const navigate = useNavigate()
  const [type, setType] = useState('message')
  const [value, setValue] = useState('')

  const meta = inputTypeMeta(type)
  const trimmed = value.trim()

  function goToDemoResult() {
    // Demo run uses a fixed, clearly-labeled mock id — no real analysis is performed.
    navigate('/analysis/demo')
  }

  function handleAnalyze() {
    if (!trimmed) return
    // Phase 1: no backend call yet. Routes to the result shell with a placeholder id.
    navigate('/analysis/pending')
  }

  function handleSample() {
    setValue(SAMPLE_BY_TYPE[type])
  }

  function handleDemo() {
    setType(DEMO_INPUT.type)
    setValue(DEMO_INPUT.content)
    goToDemoResult()
  }

  return (
    <div className={'panel input-console' + (compact ? ' input-console--compact' : '')}>
      <InputTypeTabs value={type} onChange={setType} />

      <div className="input-console-field">
        <textarea
          className="input-console-textarea mono"
          placeholder={`Paste a ${meta.label.toLowerCase()} — ${meta.hint}`}
          value={value}
          maxLength={MAX_LENGTH}
          onChange={(e) => setValue(e.target.value)}
          rows={compact ? 5 : 9}
        />
        <div className="input-console-meta">
          <span className="text-tertiary">{meta.hint}</span>
          <span className="mono text-tertiary">{value.length} / {MAX_LENGTH}</span>
        </div>
      </div>

      {showPrivacyWarning && (
        <div className="privacy-inline-warning">
          <ShieldAlert size={15} strokeWidth={1.8} />
          <span>Never paste a seed phrase or private key. Sentinel never asks for one.</span>
        </div>
      )}

      <div className="input-console-actions">
        <button className="btn btn-primary" onClick={handleAnalyze} disabled={!trimmed}>
          <ScanSearch size={16} strokeWidth={2} />
          Analyze
        </button>
        {showSampleButton && (
          <button className="btn btn-secondary" onClick={handleSample}>
            Use sample input
          </button>
        )}
        {showDemoButton && (
          <button className="btn btn-ghost" onClick={handleDemo}>
            <Sparkles size={15} strokeWidth={1.8} />
            Demo analysis
          </button>
        )}
      </div>
    </div>
  )
}
