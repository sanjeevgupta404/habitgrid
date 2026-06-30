import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import { TooltipProvider } from './components/ui/tooltip'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/ai-assistant" element={<div>AI Assistant (Coming Soon)</div>} />
                  <Route path="/search" element={<div>Crime Search (Coming Soon)</div>} />
                  <Route path="/cases" element={<div>Assigned Cases (Coming Soon)</div>} />
                  <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />

                  {/* Investigator + Admin */}
                  <Route element={<ProtectedRoute allowedRoles={['admin', 'investigator']} />}>
                    <Route path="/analytics" element={<div>Crime Analytics (Coming Soon)</div>} />
                    <Route path="/hotspots" element={<div>Crime Hotspots (Coming Soon)</div>} />
                    <Route path="/network" element={<div>Criminal Network (Coming Soon)</div>} />
                    <Route path="/reports" element={<div>Reports (Coming Soon)</div>} />
                  </Route>

                  {/* Admin Only */}
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/logs" element={<div>Audit Logs (Coming Soon)</div>} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
