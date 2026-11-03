import { createBrowserRouter, Navigate } from 'react-router-dom'
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
import { AdaptivePracticePage } from '@/pages/user/AdaptivePracticePage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { PrivateRoute } from './PrivateRoute'
import { AdminRoute } from './AdminRoute'

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
            path: '/practice/adaptive',
            element: <AdaptivePracticePage />,
          },
          {
            path: '/practice',
            element: <Navigate to="/practice/adaptive" replace />,
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
