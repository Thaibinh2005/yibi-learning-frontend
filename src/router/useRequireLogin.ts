import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

/**
 * Guests can look around freely; an action that needs an account calls `requireLogin()` first.
 * It returns true for a signed-in learner, otherwise sends the guest to /login and returns false.
 * After signing in, the login page brings them back here (or to `returnTo` when given).
 */
export function useRequireLogin() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()

  const requireLogin = useCallback(
    (returnTo?: { pathname: string; search?: string }) => {
      if (isAuthenticated) return true
      navigate('/login', { state: { from: returnTo ?? { pathname: location.pathname, search: location.search } } })
      return false
    },
    [isAuthenticated, navigate, location.pathname, location.search],
  )

  return { isAuthenticated, requireLogin }
}
