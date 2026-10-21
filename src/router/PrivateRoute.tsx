import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

export const PrivateRoute: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    // Pass the current location so LoginPage can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
