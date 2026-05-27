    import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SolarFlashFull from './SolarFlashFull.jsx'
import ReportCard from './src/ReportCard.jsx'
import Dashboard from './src/Dashboard.jsx'
import Litepaper from './src/Litepaper.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<SolarFlashFull />} />
        <Route path="/report"     element={<ReportCard />} />
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/litepaper"  element={<Litepaper />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

    
