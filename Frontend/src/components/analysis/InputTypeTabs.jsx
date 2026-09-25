import { INPUT_TYPES } from '../../utils/constants.js'

export default function InputTypeTabs({ value, onChange }) {
  return (
    <div className="type-tabs" role="tablist" aria-label="Input type">
      {INPUT_TYPES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          role="tab"
          type="button"
          aria-selected={value === id}
          className={'type-tab' + (value === id ? ' type-tab--active' : '')}
          onClick={() => onChange(id)}
        >
          <Icon size={15} strokeWidth={1.8} />
          {label}
        </button>
      ))}
    </div>
  )
}
