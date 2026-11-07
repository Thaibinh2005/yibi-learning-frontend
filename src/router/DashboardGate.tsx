import { Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { OnboardingGate } from './OnboardingGate'

/** Pages a guest may browse: a guest sees them straight away, a learner still does the first-sign-in survey first. */
export function DashboardGate() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  return isAuthenticated ? <OnboardingGate /> : <Outlet />
}
