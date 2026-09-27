import { useLocation } from 'react-router-dom'
import { ShieldCheck, Cloud, CloudOff, LoaderCircle } from 'lucide-react'
import { useBackendStatus } from '../../hooks/useBackendStatus.js'
import './layout.css'

const TITLES = {
  '/': ['Dashboard', "Know what you're signing. Know who you're trusting."],
  '/analyze': ['Analyze', 'Run a new inspection on a message, address, event, or link.'],
  '/sign-check': ['Explain Before You Sign', 'Understand a transaction before you approve it.'],
  '/history': ['History', 'Past analyses run in this session.'],
  '/privacy': ['Privacy & Settings', 'What Satoshi Sentinel does and does not access.'],
}

const STATUS_META = {
  checking: { Icon: LoaderCircle, label: 'Checking backend…', className: 'topbar-indicator--checking' },
  online: { Icon: Cloud, label: 'Backend connected', className: 'topbar-indicator--online' },
  offline: { Icon: CloudOff, label: 'Local demo mode (backend offline)', className: 'topbar-indicator--offline' },
}

export default function TopBar() {
  const { pathname } = useLocation()
  const backendStatus = useBackendStatus()
  const isResult = pathname.startsWith('/analysis/')
  const [title, subtitle] = isResult
    ? ['Analysis Result', 'Extracted signals and evidence for this input.']
    : TITLES[pathname] || TITLES['/']

  const { Icon, label, className } = STATUS_META[backendStatus]

  return (
    <header className="topbar">
      <div className="topbar-titles">
        <h1 className="topbar-title">{title}</h1>
        <p className="topbar-subtitle">{subtitle}</p>
      </div>
      <div className="topbar-indicators">
        <div className={`topbar-indicator ${className}`} title="Analysis always works locally even if the backend is offline">
          <Icon size={13} strokeWidth={1.8} />
          <span>{label}</span>
        </div>
        <div className="topbar-indicator" title="No seed phrase or private key is ever requested">
          <ShieldCheck size={15} strokeWidth={1.8} />
          <span>Privacy-first · no keys, ever</span>
        </div>
      </div>
    </header>
  )
}
