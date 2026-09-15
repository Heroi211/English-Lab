import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DiagnosticResult, Mistake, ReviewItem } from '../types'

export interface ProgressState {
  currentLevel: string
  currentModuleId: string
  currentLessonId: string
  lessonSection: string
  streak: number
  lastStudyDate: string | null
  mastery: Record<string, number>
  canDo: Record<string, boolean>
  completedLessons: string[]
  completedSections: Record<string, boolean>
  unlockedLessons: string[]
  unlockedModules: string[]
  assessmentHistory: Array<Record<string, unknown>>
  exerciseHistory: Array<Record<string, unknown>>
  studySessions: Array<Record<string, unknown>>
  diagnosticDone: boolean
}

interface Settings {
  studyMode: 'quick' | 'standard' | 'deep'
  backendUrl: string
  learnerName: string
}

interface AppState {
  progress: ProgressState
  settings: Settings
  mistakes: Mistake[]
  reviewQueue: ReviewItem[]
  diagnostic: DiagnosticResult | null
  /** Writing drafts keyed by lessonId — survives revisits via localStorage. */
  writings: Record<string, string>
  setProgress: (partial: Partial<ProgressState>) => void
  setSettings: (partial: Partial<Settings>) => void
  setMistakes: (mistakes: Mistake[]) => void
  setReviewQueue: (queue: ReviewItem[]) => void
  setDiagnostic: (d: DiagnosticResult | null) => void
  setWriting: (lessonId: string, text: string) => void
  patchMastery: (topic: string, score: number) => void
  markSectionComplete: (lessonId: string, section: string) => void
  unlockLesson: (lessonId: string) => void
  unlockModule: (moduleId: string) => void
  completeLesson: (lessonId: string) => void
  touchStreak: () => void
  exportAll: () => string
  importAll: (json: string) => void
  resetLearning: () => void
}

const defaultProgress: ProgressState = {
  currentLevel: 'A1',
  currentModuleId: 'a1-m1',
  currentLessonId: 'a1-m1-l1',
  lessonSection: 'warmup',
  streak: 0,
  lastStudyDate: null,
  mastery: {},
  canDo: {},
  completedLessons: [],
  completedSections: {},
  unlockedLessons: ['a1-m1-l1'],
  unlockedModules: ['a1-m1'],
  assessmentHistory: [],
  exerciseHistory: [],
  studySessions: [],
  diagnosticDone: false,
}

const defaultSettings: Settings = {
  studyMode: 'standard',
  backendUrl: '',
  learnerName: '',
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      progress: defaultProgress,
      settings: defaultSettings,
      mistakes: [],
      reviewQueue: [],
      diagnostic: null,
      writings: {},

      setProgress: (partial) => set({ progress: { ...get().progress, ...partial } }),
      setSettings: (partial) => set({ settings: { ...get().settings, ...partial } }),
      setMistakes: (mistakes) => set({ mistakes }),
      setReviewQueue: (reviewQueue) => set({ reviewQueue }),
      setDiagnostic: (diagnostic) => set({ diagnostic }),
      setWriting: (lessonId, text) => set({ writings: { ...get().writings, [lessonId]: text } }),

      patchMastery: (topic, score) => {
        const mastery = { ...get().progress.mastery, [topic]: score }
        set({ progress: { ...get().progress, mastery } })
      },

      markSectionComplete: (lessonId, section) => {
        const key = `${lessonId}:${section}`
        set({
          progress: {
            ...get().progress,
            completedSections: { ...get().progress.completedSections, [key]: true },
          },
        })
      },

      unlockLesson: (lessonId) => {
        const unlocked = new Set(get().progress.unlockedLessons)
        unlocked.add(lessonId)
        set({ progress: { ...get().progress, unlockedLessons: [...unlocked] } })
      },

      unlockModule: (moduleId) => {
        const unlocked = new Set(get().progress.unlockedModules)
        unlocked.add(moduleId)
        set({ progress: { ...get().progress, unlockedModules: [...unlocked] } })
      },

      completeLesson: (lessonId) => {
        const completed = new Set(get().progress.completedLessons)
        completed.add(lessonId)
        set({ progress: { ...get().progress, completedLessons: [...completed] } })
      },

      touchStreak: () => {
        const today = new Date().toISOString().slice(0, 10)
        const last = get().progress.lastStudyDate
        let streak = get().progress.streak || 0
        if (last === today) {
          set({ progress: { ...get().progress, lastStudyDate: today } })
          return
        }
        const y = new Date()
        y.setDate(y.getDate() - 1)
        streak = last === y.toISOString().slice(0, 10) ? streak + 1 : 1
        set({ progress: { ...get().progress, lastStudyDate: today, streak } })
      },

      exportAll: () =>
        JSON.stringify(
          {
            progress: get().progress,
            settings: get().settings,
            mistakes: get().mistakes,
            reviewQueue: get().reviewQueue,
            diagnostic: get().diagnostic,
            writings: get().writings,
            exportedAt: new Date().toISOString(),
          },
          null,
          2,
        ),

      importAll: (json) => {
        const data = JSON.parse(json)
        set({
          progress: { ...defaultProgress, ...data.progress },
          settings: { ...defaultSettings, ...data.settings },
          mistakes: data.mistakes || [],
          reviewQueue: data.reviewQueue || [],
          diagnostic: data.diagnostic || null,
          writings: data.writings || {},
        })
      },

      resetLearning: () =>
        set({
          progress: defaultProgress,
          mistakes: [],
          reviewQueue: [],
          diagnostic: null,
          writings: {},
        }),
    }),
    { name: 'ej-learning-v1' },
  ),
)
