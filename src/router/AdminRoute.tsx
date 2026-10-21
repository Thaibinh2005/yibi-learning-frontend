import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

export const AdminRoute: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
