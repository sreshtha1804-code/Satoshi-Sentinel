import { FlaskConical } from 'lucide-react'
import { DEMO_EXAMPLES } from '../../data/demoExamples.js'
import { inputTypeMeta } from '../../utils/constants.js'

export default function DemoExamplesPanel({ onLoad }) {
  return (
    <div className="panel demo-examples-panel">
      <div className="section-panel-header">
        <h3 className="section-panel-title">
          <FlaskConical size={16} strokeWidth={1.8} />
          Demo examples
        </h3>
      </div>
      <p className="demo-examples-hint">
        Load one into the console below, then run Analyze. Each is processed by the same
        local engine as anything else you paste — nothing here is a pre-baked result.
      </p>
      <div className="demo-examples">
        {DEMO_EXAMPLES.map((ex) => {
          const typeMeta = inputTypeMeta(ex.type)
          return (
            <div className="demo-example-card" key={ex.id}>
              <div className="demo-example-text">
                <span className="demo-example-title">{ex.label}</span>
                <span className="demo-example-type">{typeMeta.label}</span>
              </div>
              <button className="btn btn-secondary" onClick={() => onLoad(ex)}>
                Load
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
