import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { UserLayout } from '@/components/layout/UserLayout'
import { DashboardPage } from '@/pages/user/DashboardPage'
import { LearningPage } from '@/pages/user/LearningPage'
import { PersonalizedLearningPage } from '@/pages/user/PersonalizedLearningPage'
import { ExamPage } from '@/pages/user/ExamPage'
import { VocabularyPage } from '@/pages/user/VocabularyPage'
import { VocabularyTopicPage } from '@/pages/user/VocabularyTopicPage'
import { VocabularyTopicDetailPage } from '@/pages/user/VocabularyTopicDetailPage'
import { TopicFlashcardPage } from '@/pages/user/TopicFlashcardPage'
import { DailyVocabularyPage } from '@/pages/user/DailyVocabularyPage'
import { FlashcardPage } from '@/pages/user/FlashcardPage'
import { PracticePage } from '@/pages/user/PracticePage'
import { PathLessonPage, PathLevelTestPage } from '@/pages/user/PathLessonPage'
import { PathMistakesPage } from '@/pages/user/PathMistakesPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { OnboardingSurveyPage } from '@/pages/user/placement/OnboardingSurveyPage'
import { PlacementIntroPage } from '@/pages/user/placement/PlacementIntroPage'
import { PlacementTestPage } from '@/pages/user/placement/PlacementTestPage'
import { PlacementFinishPage } from '@/pages/user/placement/PlacementFinishPage'
import { PlacementResultPage } from '@/pages/user/placement/PlacementResultPage'
import { OnboardingGate } from './OnboardingGate'
import { PrivateRoute } from './PrivateRoute'
import { AdminRoute } from './AdminRoute'

const OldPracticeRedirect = () => {
  const { search } = useLocation()
  return <Navigate to={search.includes('level=') ? `/learning-path/practice${search}` : '/learning-path'} replace />
}

export const router = createBrowserRouter([
  // ── Public Routes ──────────────────────────────────────────
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  // ── Protected Student Routes (UserLayout with Sidebar & Header) ──
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <OnboardingGate />,
        children: [
      {
        element: <UserLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/courses',
            element: <LearningPage />,
          },
          {
            path: '/learning',
            element: <LearningPage />,
          },
          {
            path: '/learning-path',
            element: <PersonalizedLearningPage />,
          },
          {
            path: '/learning-path/lesson/:nodeId',
            element: <PathLessonPage />,
          },
          {
            path: '/learning-path/mistakes',
            element: <PathMistakesPage />,
          },
          {
            path: '/learning-path/level-test/:level',
            element: <PathLevelTestPage />,
          },
          {
            path: '/learning-path/practice',
            element: <PracticePage />,
          },
          {
            // Old links: a level means "run this session", anything else opens the path.
            path: '/practice/adaptive',
            element: <OldPracticeRedirect />,
          },
          {
            path: '/practice',
            element: <OldPracticeRedirect />,
          },
          // ── Vocabulary Routes ──
          {
            path: '/vocabulary',
            element: <Navigate to="/vocabulary/daily" replace />,
          },
          {
            path: '/vocabulary/daily',
            element: <DailyVocabularyPage />,
          },
          {
            path: '/vocabulary/search',
            element: <VocabularyPage />,
          },
          {
            path: '/vocabulary/notebook',
            element: <VocabularyPage />,
          },
          {
            path: '/vocabulary/topic',
            element: <VocabularyTopicPage />,
          },
          {
            path: '/vocabulary/topic/:slug',
            element: <VocabularyTopicDetailPage />,
          },
          {
            path: '/vocabulary/topic/:slug/flashcards',
            element: <TopicFlashcardPage />,
          },
          {
            path: '/vocabulary/tips',
            element: <VocabularyPage />,
          },
          {
            // Measure words now live on the daily vocabulary page and flashcards.
            path: '/vocabulary/quantifiers',
            element: <Navigate to="/vocabulary/daily" replace />,
          },
          // ── Other Features ──
          {
            path: '/flashcards',
            element: <FlashcardPage />,
          },
          {
            path: '/exams',
            element: <ExamPage />,
          },
          // ── Onboarding survey and the adaptive placement test ──
          { path: '/onboarding', element: <OnboardingSurveyPage /> },
          { path: '/placement', element: <PlacementIntroPage /> },
          { path: '/placement/test', element: <PlacementTestPage /> },
          { path: '/placement/finish', element: <PlacementFinishPage /> },
          { path: '/placement/result/:attemptId', element: <PlacementResultPage /> },
        ],
      },
        ],
      },
    ],
  },

  // ── Protected Admin Routes (Admin Only) ─────────────────────
  {
    element: <AdminRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminDashboardPage />,
      },
    ],
  },

  // ── Fallback Route ─────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])
