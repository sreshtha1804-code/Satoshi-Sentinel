import { CircleDashed } from 'lucide-react'

export default function EmptyPlaceholder({ label = 'Awaiting analysis data' }) {
  return (
    <div className="empty-placeholder">
      <CircleDashed size={15} strokeWidth={1.6} />
      <span>{label}</span>
    </div>
  )
}
