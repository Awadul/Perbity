import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Invite from './pages/Invite.jsx'
import Cashout from './pages/Cashout.jsx'
import BuyPlan from './pages/BuyPlan.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Layout from './components/layout/Layout.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected dashboard routes without layout (has its own structure) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/invite" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
        <Route path="/cashout" element={<ProtectedRoute><Cashout /></ProtectedRoute>} />
        <Route path="/buy-plan" element={<ProtectedRoute><BuyPlan /></ProtectedRoute>} />
        
        {/* Main app routes with layout */}
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        
        {/* Placeholder routes for dashboard navigation */}
        <Route path="/active-plans" element={<Layout><div className="page-wrapper"><h1 className="page-title">Active Plans</h1><p>Coming soon...</p></div></Layout>} />
        <Route path="/history" element={<Layout><div className="page-wrapper"><h1 className="page-title">History</h1><p>Coming soon...</p></div></Layout>} />
        <Route path="/earnings" element={<Layout><div className="page-wrapper"><h1 className="page-title">Earnings</h1><p>Coming soon...</p></div></Layout>} />
        <Route path="/referrals" element={<Layout><div className="page-wrapper"><h1 className="page-title">Referrals</h1><p>Coming soon...</p></div></Layout>} />
        <Route path="/total-deposits" element={<Layout><div className="page-wrapper"><h1 className="page-title">Total Deposits</h1><p>Coming soon...</p></div></Layout>} />
        <Route path="/total-withdraws" element={<Layout><div className="page-wrapper"><h1 className="page-title">Total Withdraws</h1><p>Coming soon...</p></div></Layout>} />
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
