import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login/login.tsx'
import Add from './pages/add/add.tsx'
import EntryDetails from './pages/add/entrydetails.tsx'
import { AuthService } from './pages/login/auth.tsx'
import { type ReactNode } from 'react'

// Protected Route wrapper component
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/add" element={<Add />} />
        <Route path="/add/:qrid" element={<Add />} />
        <Route path="/" element={<Navigate to="/add" replace />} /> {/* Default redirect */}

        {/* Protected Routes */}
        <Route path="/entry-details" element={
          <ProtectedRoute>
            <EntryDetails />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
