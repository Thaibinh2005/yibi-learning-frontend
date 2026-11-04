import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setOnboardingCompleted } from '@/app/slices/authSlice'
import { getPlacementStatus } from '@/api/placementApi'

const EXEMPT_PREFIXES = ['/onboarding', '/placement']

/**
 * Sends a learner who has not done the first-sign-in survey to /onboarding. The answer is read once per
 * sign-in and kept in the auth slice; if the status call fails the learner is let through rather than locked out.
 */
export function OnboardingGate() {
  const dispatch = useAppDispatch()
  const completed = useAppSelector((state) => state.auth.onboardingCompleted)
  const location = useLocation()

  useEffect(() => {
    if (completed !== null) return
    let cancelled = false
    getPlacementStatus()
      .then((status) => !cancelled && dispatch(setOnboardingCompleted(status.onboardingCompleted)))
      .catch(() => !cancelled && dispatch(setOnboardingCompleted(true)))
    return () => {
      cancelled = true
    }
  }, [completed, dispatch])

  if (completed === null) return <div className="min-h-screen bg-slate-50" aria-busy="true" />
  const exempt = EXEMPT_PREFIXES.some((prefix) => location.pathname.startsWith(prefix))
  if (!completed && !exempt) return <Navigate to="/onboarding" replace />
  return <Outlet />
}
