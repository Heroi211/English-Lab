import { Navigate, Route, Routes } from 'react-router-dom'
import { RootLayout } from './layouts/RootLayout'
import { DashboardPage } from './pages/DashboardPage'
import { TodayPage } from './pages/TodayPage'
import { JourneyPage } from './pages/JourneyPage'
import { LearnPage } from './pages/LearnPage'
import { LessonPage } from './pages/LessonPage'
import { ReviewPage } from './pages/ReviewPage'
import { ProgressPage } from './pages/ProgressPage'
import { TutorPage } from './pages/TutorPage'
import { SettingsPage } from './pages/SettingsPage'
import { DiagnosticPage } from './pages/DiagnosticPage'
import { AssessmentPage } from './pages/AssessmentPage'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="today" element={<TodayPage />} />
        <Route path="journey" element={<JourneyPage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="learn/:lessonId" element={<LessonPage />} />
        <Route path="review" element={<ReviewPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="tutor" element={<TutorPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="diagnostic" element={<DiagnosticPage />} />
        <Route path="assessments/:assessmentId" element={<AssessmentPage />} />
      </Route>
    </Routes>
  )
}
