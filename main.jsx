    import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SolarFlashFull   from './SolarFlashFull.jsx'
import ReportCard        from './src/ReportCard.jsx'
import Dashboard         from './src/Dashboard.jsx'
import Litepaper         from './src/Litepaper.jsx'
import SmartAlerts       from './src/SmartAlerts.jsx'
import Ecosystem         from './src/Ecosystem.jsx'
import SurvivalScorePage from './src/OrbitMetrics.jsx'
import ReactorDemo       from './src/SurvivalReactor.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<SolarFlashFull />} />
        <Route path="/report"      element={<ReportCard />} />
        <Route path="/dashboard"   element={<Dashboard />} />
        <Route path="/litepaper"   element={<Litepaper />} />
        <Route path="/alerts"      element={<SmartAlerts />} />
        <Route path="/ecosystem"   element={<Ecosystem />} />
        <Route path="/score"       element={<SurvivalScorePage />} />
        <Route path="/reactor-demo" element={<ReactorDemo />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

    
