import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { UserLayout } from '@/components/layout/UserLayout'
import { DashboardPage } from '@/pages/user/DashboardPage'
import { LearningPage } from '@/pages/user/LearningPage'
import { ExamPage } from '@/pages/user/ExamPage'
import { VocabularyPage } from '@/pages/user/VocabularyPage'
import { DailyVocabularyPage } from '@/pages/user/DailyVocabularyPage'
import { FlashcardPage } from '@/pages/user/FlashcardPage'
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
            element: <VocabularyPage />,
          },
          {
            path: '/vocabulary/tips',
            element: <VocabularyPage />,
          },
          {
            path: '/vocabulary/quantifiers',
            element: <VocabularyPage />,
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
