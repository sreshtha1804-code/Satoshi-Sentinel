import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Analyze from './pages/Analyze.jsx'
import AnalysisResult from './pages/AnalysisResult.jsx'
import ExplainBeforeSign from './pages/ExplainBeforeSign.jsx'
import History from './pages/History.jsx'
import Privacy from './pages/Privacy.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/analysis/:id" element={<AnalysisResult />} />
            <Route path="/sign-check" element={<ExplainBeforeSign />} />
            <Route path="/history" element={<History />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
