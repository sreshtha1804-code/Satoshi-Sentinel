import EmptyPlaceholder from '../ui/EmptyPlaceholder.jsx'

export default function ExtractedList({ items = [], emptyLabel }) {
  if (!items || items.length === 0) {
    return <EmptyPlaceholder label={emptyLabel} />
  }
  return (
    <div className="extracted-list">
      {items.map((item, i) => (
        <div className="extracted-row mono" key={`${item}-${i}`} title={item}>
          {item}
        </div>
      ))}
    </div>
  )
}
