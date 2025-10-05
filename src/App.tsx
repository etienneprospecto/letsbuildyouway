import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { CoachesPage } from '@/pages/CoachesPage'
import { AppPageSimple } from '@/pages/AppPageSimple'
import { ResetPassword } from '@/components/auth/ResetPassword'
import { DirectLogin } from '@/components/auth/DirectLogin'
import AcceptInvitation from '@/components/auth/AcceptInvitation'
import HenriLogin from '@/components/auth/HenriLogin'
import { SetupAccountPage } from '@/pages/SetupAccountPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/coaches" element={<CoachesPage />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/accept-invitation" element={<AcceptInvitation />} />
        <Route path="/auth/henri-login" element={<HenriLogin />} />
        <Route path="/auth/direct-login" element={<DirectLogin />} />
        <Route path="/setup-account" element={<SetupAccountPage />} />
            <Route path="/app/*" element={<AppPageSimple />} />
      </Routes>
    </Router>
  )
}

export default App