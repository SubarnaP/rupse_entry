import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login/login'
import Add from './pages/add/add'
import EntryDetails from './pages/add/entrydetails'
import { AuthService } from './pages/login/auth'

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
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
        <Route path="/add/:qrid?" element={<Add />} />
        <Route path="/" element={<Add />} /> {/* Default route */}

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
