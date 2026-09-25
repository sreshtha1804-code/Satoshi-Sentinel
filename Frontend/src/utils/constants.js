import { MessageSquareWarning, Wallet, Radio, Link2 } from 'lucide-react'

export const INPUT_TYPES = [
  { id: 'message', label: 'Message', icon: MessageSquareWarning, hint: 'DM, email, or chat text' },
  { id: 'address', label: 'Bitcoin Address', icon: Wallet, hint: 'On-chain address or invoice' },
  { id: 'nostr', label: 'Nostr Event', icon: Radio, hint: 'Event JSON, note, or npub' },
  { id: 'url', label: 'URL', icon: Link2, hint: 'Link to a site or app' },
]

export const RISK_LEVELS = {
  safe: { label: 'Low risk', color: 'var(--status-safe)', wash: 'var(--status-safe-wash)', border: 'var(--status-safe-border)' },
  caution: { label: 'Caution', color: 'var(--status-caution)', wash: 'var(--status-caution-wash)', border: 'var(--status-caution-border)' },
  danger: { label: 'High risk', color: 'var(--status-danger)', wash: 'var(--status-danger-wash)', border: 'var(--status-danger-border)' },
}

export function scoreToLevel(score) {
  if (score >= 70) return 'danger'
  if (score >= 35) return 'caution'
  return 'safe'
}

export function formatTimestamp(iso) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function inputTypeMeta(id) {
  return INPUT_TYPES.find((t) => t.id === id) || INPUT_TYPES[0]
}
