"use client"

import type React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { WalletProvider } from "./contexts/WalletContext"
import { Layout } from "./components/Layout"
import { LandingPage } from "./pages/LandingPage"
import { Dashboard } from "./pages/Dashboard"
import { Profile } from "./pages/Profile"
import { Wallet } from "./pages/Wallet"
import { TicketList } from "./pages/tickets/TicketList"
import { TicketDetails } from "./pages/tickets/TicketDetails"
import { CreateTicket } from "./pages/tickets/CreateTicket"
import { Buy } from "./pages/Buy"
import { Sell } from "./pages/Sell"
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { UserManagement } from "./pages/admin/UserManagement"
import { IssueBLUD } from "./pages/IssueBLUD"
import { DeskManagerDashboard } from "./pages/DeskManagerDashboard"

const ProtectedRoute: React.FC<{
  children: React.ReactNode
  requiredRole?: string
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (requiredRole && !hasRole(requiredRole as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we verify your credentials</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <WalletProvider>
              <Layout />
            </WalletProvider>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="wallet" element={<Wallet />} />

        {/* Tickets */}
        <Route path="tickets" element={<TicketList />} />
        <Route path="tickets/:id" element={<TicketDetails />} />
        <Route path="tickets/create" element={<CreateTicket />} />

        {/* Buy/Sell */}
        <Route path="buy" element={<Buy />} />
        <Route path="sell" element={<Sell />} />

        {/* Admin Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="issue-blud"
          element={
            <ProtectedRoute requiredRole="admin">
              <IssueBLUD />
            </ProtectedRoute>
          }
        />

        {/* Desk Manager Routes */}
        <Route
          path="desk-manager"
          element={
            <ProtectedRoute requiredRole="desk-manager">
              <DeskManagerDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App