import { KeyRound, Lock, Landmark, Globe, Server, Sparkles } from 'lucide-react'
import './pages.css'

const PRINCIPLES = [
  {
    icon: KeyRound,
    title: 'No seed phrase required',
    copy: 'Sentinel never asks for, stores, or transmits a recovery phrase. There is no field for it anywhere in the product.',
  },
  {
    icon: Lock,
    title: 'No private key required',
    copy: 'Analysis works entirely from information you paste or from public data. No private key ever leaves your device — because none is ever entered.',
  },
  {
    icon: Landmark,
    title: 'No custodial wallet functionality',
    copy: 'Sentinel does not hold, move, or have the ability to move funds on your behalf, at any point.',
  },
  {
    icon: Globe,
    title: 'Public data only',
    copy: 'Bitcoin and Nostr lookups use only information that is already publicly visible on-chain or on relays.',
  },
  {
    icon: Server,
    title: 'API keys stay server-side',
    copy: 'Any third-party API credentials Sentinel uses are held on the backend and are never exposed to the browser.',
  },
  {
    icon: Sparkles,
    title: 'AI output is advisory',
    copy: 'Explanations and risk scores are a decision aid, not proof of malicious or benign intent. Use your own judgment alongside them.',
  },
]

export default function Privacy() {
  return (
    <div className="privacy-page">
      <div className="privacy-grid">
        {PRINCIPLES.map(({ icon: Icon, title, copy }) => (
          <div className="section-panel privacy-card" key={title}>
            <div className="privacy-card-icon">
              <Icon size={17} strokeWidth={1.8} />
            </div>
            <h3 className="privacy-card-title">{title}</h3>
            <p className="privacy-card-copy">{copy}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
