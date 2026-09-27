import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanSearch, Sparkles, ShieldAlert, TriangleAlert } from 'lucide-react'
import InputTypeTabs from './InputTypeTabs.jsx'
import { inputTypeMeta } from '../../utils/constants.js'
import { DEMO_EXAMPLES } from '../../data/demoExamples.js'
import { saveAnalysis } from '../../utils/sessionStore.js'
import { useAnalyze, SecurityRejectedError } from '../../hooks/useAnalyze.js'

const MAX_LENGTH = 4000

const SAMPLE_BY_TYPE = {
  message:
    'Hey, this is the wallet support team. We flagged your account for review — reply with your seed phrase to avoid a 24h suspension.',
  address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  nostr: 'npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6',
  url: 'https://wallet-recovery-help.net/verify',
}

// Used by the dashboard's single "Demo analysis" quick-action button.
const QUICK_DEMO = DEMO_EXAMPLES[0]

export default function AnalysisInputPanel({
  showDemoButton = false,
  showSampleButton = false,
  showPrivacyWarning = false,
  compact = false,
  // Optional controlled-mode props, used by the Analyze page so the demo
  // examples selector can load content into this panel from outside.
  type: controlledType,
  onTypeChange,
  value: controlledValue,
  onValueChange,
}) {
  const navigate = useNavigate()
  const { run } = useAnalyze()
  const [internalType, setInternalType] = useState('message')
  const [internalValue, setInternalValue] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [blockedReason, setBlockedReason] = useState(null)

  const type = controlledType ?? internalType
  const setType = onTypeChange ?? setInternalType
  const value = controlledValue ?? internalValue
  const setValue = onValueChange ?? setInternalValue

  const meta = inputTypeMeta(type)
  const trimmed = value.trim()

  async function runAndNavigate(inputType, content) {
    setBlockedReason(null)
    setIsRunning(true)
    try {
      const analysis = await run(inputType, content)
      const id = saveAnalysis(analysis)
      navigate(`/analysis/${id}`)
    } catch (err) {
      if (err instanceof SecurityRejectedError) {
        setBlockedReason(err.message)
      } else {
        // Should be unreachable — useAnalyze falls back locally on every
        // other error type — but never leave the button silently stuck.
        setBlockedReason('Something went wrong running the analysis. Please try again.')
      }
    } finally {
      setIsRunning(false)
    }
  }

  function handleAnalyze() {
    if (!trimmed) return
    runAndNavigate(type, value)
  }

  function handleSample() {
    setBlockedReason(null)
    setValue(SAMPLE_BY_TYPE[type])
  }

  function handleDemo() {
    setType(QUICK_DEMO.type)
    setValue(QUICK_DEMO.content)
    runAndNavigate(QUICK_DEMO.type, QUICK_DEMO.content)
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
          onChange={(e) => {
            setBlockedReason(null)
            setValue(e.target.value)
          }}
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
          <span>Never paste a seed phrase or private key. Sentinel never asks for one, and refuses to analyze either if submitted.</span>
        </div>
      )}

      {blockedReason && (
        <div className="security-block-warning">
          <TriangleAlert size={15} strokeWidth={1.8} />
          <span>{blockedReason}</span>
        </div>
      )}

      <div className="input-console-actions">
        <button className="btn btn-primary" onClick={handleAnalyze} disabled={!trimmed || isRunning}>
          <ScanSearch size={16} strokeWidth={2} />
          {isRunning ? 'Analyzing…' : 'Analyze'}
        </button>
        {showSampleButton && (
          <button className="btn btn-secondary" onClick={handleSample} disabled={isRunning}>
            Use sample input
          </button>
        )}
        {showDemoButton && (
          <button className="btn btn-ghost" onClick={handleDemo} disabled={isRunning}>
            <Sparkles size={15} strokeWidth={1.8} />
            Demo analysis
          </button>
        )}
      </div>
    </div>
  )
}
