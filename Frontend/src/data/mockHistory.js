// TEMPORARY MOCK DATA — for UI development only.
// This will be replaced by real records from the FastAPI backend in a later phase.
// Do not treat any value here as a real analysis result.

export const MOCK_HISTORY = [
  {
    id: 'a1f9c3',
    timestamp: '2026-09-24T18:42:00Z',
    inputType: 'address',
    label: 'bc1qxy2...0wlh',
    riskLevel: 'danger',
    riskScore: 88,
  },
  {
    id: 'b7e2d1',
    timestamp: '2026-09-24T14:10:00Z',
    inputType: 'message',
    label: '"Support" DM asking to verify wallet',
    riskLevel: 'danger',
    riskScore: 93,
  },
  {
    id: 'c4a8f0',
    timestamp: '2026-09-23T09:05:00Z',
    inputType: 'url',
    label: 'wallet-recovery-help.net',
    riskLevel: 'caution',
    riskScore: 61,
  },
  {
    id: 'd9b1e6',
    timestamp: '2026-09-22T21:37:00Z',
    inputType: 'nostr',
    label: 'npub1a8f...k3zq',
    riskLevel: 'safe',
    riskScore: 14,
  },
  {
    id: 'e2c7a4',
    timestamp: '2026-09-21T11:52:00Z',
    inputType: 'address',
    label: '3FZbgi29c...pcAgb',
    riskLevel: 'caution',
    riskScore: 54,
  },
  {
    id: 'f6d4b9',
    timestamp: '2026-09-20T08:15:00Z',
    inputType: 'message',
    label: 'Telegram "giveaway" double-your-BTC offer',
    riskLevel: 'danger',
    riskScore: 97,
  },
]

// TEMPORARY sample content used by the "Demo analysis" action on the dashboard.
export const DEMO_INPUT = {
  type: 'message',
  content:
    'Hi, this is Coinbase Support. We noticed unusual activity on your wallet. ' +
    'To verify your identity and prevent a lockout, please confirm your recovery phrase ' +
    'or send a small amount to this verification address: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
}
