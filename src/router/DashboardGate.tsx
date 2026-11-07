import { Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { OnboardingGate } from './OnboardingGate'

/** The dashboard is the front door: a guest sees it straight away, a learner still does the first-sign-in survey first. */
export function DashboardGate() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  return isAuthenticated ? <OnboardingGate /> : <Outlet />
}
