import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { PracticeSession } from '@/components/practice/PracticeSession'
import { normalizeLimit, normalizeLevel } from '@/lib/practice'

/** Runs one practice session; the level and size come from today's plan. */
export const PracticePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const learnerLevel = useAppSelector((state) => state.auth.user?.hskLevel)
  return (
    <PracticeSession
      level={normalizeLevel(searchParams.get('level'), learnerLevel)}
      limit={normalizeLimit(searchParams.get('limit'))}
      onExit={() => navigate('/learning-path')}
    />
  )
}
