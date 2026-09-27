import { humanizeSignal } from '../../utils/constants.js'

export default function SignalChips({ signals = [] }) {
  if (signals.length === 0) return null
  return (
    <div className="signal-chips">
      {signals.map((s) => (
        <span className="signal-chip mono" key={s}>
          {humanizeSignal(s)}
        </span>
      ))}
    </div>
  )
}
