import { NavLink } from 'react-router-dom'
import { LayoutGrid, ScanSearch, Signature, History, ShieldCheck, Hexagon } from 'lucide-react'
import './layout.css'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/analyze', label: 'Analyze', icon: ScanSearch },
  { to: '/sign-check', label: 'Explain Before You Sign', icon: Signature },
  { to: '/history', label: 'History', icon: History },
  { to: '/privacy', label: 'Privacy & Settings', icon: ShieldCheck },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <Hexagon size={20} strokeWidth={1.6} />
          <span className="sidebar-brand-mark-inner">S</span>
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Satoshi Sentinel</span>
          <span className="sidebar-brand-sub">Signal &amp; scam defense</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' sidebar-link--active' : '')}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="sidebar-status-dot" />
          <span>Local session · public data only</span>
        </div>
      </div>
    </aside>
  )
}
