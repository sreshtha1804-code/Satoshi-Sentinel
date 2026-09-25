import { useLocation } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import './layout.css'

const TITLES = {
  '/': ['Dashboard', "Know what you're signing. Know who you're trusting."],
  '/analyze': ['Analyze', 'Run a new inspection on a message, address, event, or link.'],
  '/sign-check': ['Explain Before You Sign', 'Understand a transaction before you approve it.'],
  '/history': ['History', 'Past analyses run in this session.'],
  '/privacy': ['Privacy & Settings', 'What Satoshi Sentinel does and does not access.'],
}

export default function TopBar() {
  const { pathname } = useLocation()
  const isResult = pathname.startsWith('/analysis/')
  const [title, subtitle] = isResult
    ? ['Analysis Result', 'Extracted signals and evidence for this input.']
    : TITLES[pathname] || TITLES['/']

  return (
    <header className="topbar">
      <div className="topbar-titles">
        <h1 className="topbar-title">{title}</h1>
        <p className="topbar-subtitle">{subtitle}</p>
      </div>
      <div className="topbar-indicator" title="No seed phrase or private key is ever requested">
        <ShieldCheck size={15} strokeWidth={1.8} />
        <span>Privacy-first · no keys, ever</span>
      </div>
    </header>
  )
}
