import { useState } from 'react'
import { Sparkles, RotateCcw } from 'lucide-react'
import { explainOnBackend } from '../../services/api.js'
import { localExplanation } from '../../utils/aiExplainLocal.js'

export default function AiExplanation({ inputType, localScore, findings }) {
  const [state, setState] = useState('idle') // idle | loading | done
  const [explanation, setExplanation] = useState('')
  const [source, setSource] = useState(null) // 'model' | 'local_template'

  async function handleExplain() {
    setState('loading')
    try {
      const result = await explainOnBackend(inputType, localScore, findings, { timeoutMs: 6000 })
      setExplanation(result.explanation)
      setSource(result.source)
    } catch {
      setExplanation(localExplanation(inputType, localScore, findings))
      setSource('local_template')
    } finally {
      setState('done')
    }
  }

  if (state === 'idle') {
    return (
      <div className="ai-explain-prompt">
        <p className="text-tertiary">
          Generate a plain-language reading of the findings above. Uses the backend if available,
          or a local template if not — either way, evidence and interpretation stay separate.
        </p>
        <button className="btn btn-secondary" onClick={handleExplain}>
          <Sparkles size={15} strokeWidth={1.8} />
          Explain these findings
        </button>
      </div>
    )
  }

  if (state === 'loading') {
    return <p className="text-tertiary">Generating explanation…</p>
  }

  return (
    <div className="ai-explain-result">
      <p>{explanation}</p>
      <div className="ai-explain-footer">
        <span className="ai-explain-source mono">
          {source === 'model' ? 'model-generated' : 'local template (no AI call)'}
        </span>
        <button className="btn btn-ghost" onClick={handleExplain}>
          <RotateCcw size={13} strokeWidth={1.8} />
          Regenerate
        </button>
      </div>
    </div>
  )
}
