import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { CoachesPage } from '@/pages/CoachesPage'
import { AppPage } from '@/pages/AppPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/coaches" element={<CoachesPage />} />
        <Route path="/app/*" element={<AppPage />} />
      </Routes>
    </Router>
  )
}

export default App